"""
Shared pipeline: download → extract → chunk → embed → store
"""

from pathlib import Path
from .chunk import chunk_document, truncate_for_embedding
from .embed import embed_texts
from .store import insert_document, insert_segment
from .crawlers import Document


def run_pipeline(docs, conn, data_dir: str = "data"):
    """Run the full pipeline for a batch of documents (accepts list or generator)."""
    data_path = Path(data_dir)
    total_chunks = 0
    total_docs = 0

    for i, doc in enumerate(docs):
        total_docs = i + 1
        print(f"  [{total_docs}] {doc.filename[:50]}...", end=" ", flush=True)
        local_path = data_path / doc.country_code / doc.filename
        local_path.parent.mkdir(parents=True, exist_ok=True)

        # Download
        if not local_path.exists():
            import httpx
            try:
                resp = httpx.get(doc.url, follow_redirects=True, timeout=120)
                resp.raise_for_status()
                local_path.write_bytes(resp.content)
            except Exception as e:
                print(f"download failed: {e}")
                continue

        # Extract text
        text = _extract_text(str(local_path))
        if not text or len(text.strip()) < 50:
            print("no content")
            continue

        # Chunk
        chunks = chunk_document(text, doc.source)
        if not chunks:
            print("no chunks")
            continue

        # Store document
        doc_id = insert_document(
            conn,
            country_code=doc.country_code,
            content=doc.filename.replace(".pdf", "").replace(".md", ""),
            filename=doc.filename,
            source=doc.source,
            source_url=doc.url,
        )

        # Embed
        texts = [truncate_for_embedding(c["content"]) for c in chunks]
        embeddings = embed_texts(texts)

        # Store segments
        for j, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            insert_segment(
                conn,
                country_code=doc.country_code,
                content=chunk["content"],
                source_document_id=doc_id,
                vector=embedding,
                chunk_index=j,
                tags=chunk.get("sectors"),
                law_id=chunk.get("law_id"),
                refs=chunk.get("refs"),
            )

        total_chunks += len(chunks)
        print(f"{len(chunks)} chunks")

    return total_chunks


def _extract_text(filepath: str) -> str:
    """Extract text from PDF or markdown."""
    ext = Path(filepath).suffix.lower()
    if ext == ".pdf":
        return _extract_pdf(filepath)
    elif ext in (".md", ".txt"):
        return Path(filepath).read_text(encoding="utf-8")
    return ""


def _extract_pdf(filepath: str) -> str:
    """Extract text from PDF using PyMuPDF."""
    import fitz
    try:
        doc = fitz.open(filepath)
        text = "\n".join(page.get_text() for page in doc)
        doc.close()
        return text
    except Exception:
        return ""
