import sys
from pathlib import Path

from .db import get_conn, ensure_schema, count_documents, count_segments
from .chunk import chunk_document, truncate_for_embedding
from .embed import embed_texts
from .store import insert_document, insert_segment
from .crawlers import CRAWLERS


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "qbo"
    country = sys.argv[2] if len(sys.argv) > 2 else None

    crawler_cls = CRAWLERS.get(target)
    if not crawler_cls:
        print(f"Unknown crawler: {target}")
        print(f"Available: {list(CRAWLERS.keys())}")
        sys.exit(1)

    crawler = crawler_cls()
    docs = crawler.list_documents()

    if country:
        docs = [d for d in docs if d["country_code"] == country]
        print(f"Filtered to country {country}: {len(docs)} docs")
    else:
        print(f"Found {len(docs)} documents for {target}")

    conn = get_conn()
    ensure_schema(conn)

    existing = count_documents(conn)
    if existing > 0:
        print(f"DB already has {existing} docs. Set FORCE_REINDEX=1 to redo.")
        conn.close()
        return

    total_chunks = 0
    for doc in docs:
        path = doc["path"]
        source_name = doc["source"]
        cc = doc["country_code"]
        filename = doc["filename"]

        print(f"  {filename}...", end=" ", flush=True)

        text = Path(path).read_text(encoding="utf-8")
        chunks = chunk_document(text, source_name)

        if not chunks:
            print("no content")
            continue

        doc_id = insert_document(
            conn,
            country_code=cc,
            content=filename.replace(".md", ""),
            filename=filename,
            source=source_name,
            source_url=doc.get("source_url"),
        )

        texts = [truncate_for_embedding(c["content"]) for c in chunks]
        embeddings = embed_texts(texts)

        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            insert_segment(
                conn,
                country_code=cc,
                content=chunk["content"],
                source_document_id=doc_id,
                vector=embedding,
                chunk_index=i,
            )

        total_chunks += len(chunks)
        print(f"{len(chunks)} chunks")

    print(f"\nDone: {len(docs)} docs, {total_chunks} segments")
    conn.close()


if __name__ == "__main__":
    main()
