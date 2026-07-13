#!/usr/bin/env python3
"""
Fast jibaya.tn ingestion — parallel scrape + download + embed.
Handles reconnections and skips failures.
"""
import os, json, httpx, fitz, time, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
sys.path.insert(0, "src")

from rag.db import ensure_schema, get_conn
from rag.chunk import chunk_document
from rag.embed import embed_texts
from rag.store import insert_document, insert_segment

MANIFEST = "config/jibaya_docs_data.json"

def extract_pdf_url(article_url: str, client: httpx.Client) -> list[str]:
    try:
        r = client.get(article_url, timeout=15)
        r.raise_for_status()
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(r.text, "lxml")
        return [a["href"] for a in soup.find_all("a", href=True) if a["href"].endswith(".pdf")]
    except:
        return []

def process_pdf(url: str, client: httpx.Client):
    try:
        r = client.get(url, timeout=120)
        r.raise_for_status()
        pdf = fitz.open(stream=r.content)
        text = "\n".join(page.get_text() for page in pdf)
        pdf.close()
        if len(text.strip()) < 50:
            return [], url
        source = "jibaya"
        chunks = chunk_document(text, source)
        return chunks, url
    except Exception as e:
        raise

def main():
    # Scrape phase
    with open(MANIFEST) as f:
        manifest = json.load(f)
    articles = [a["url"] for cat in manifest for sub in cat.get("sub_categories", []) for a in sub.get("articles", [])]
    print(f"Total articles: {len(articles)}", flush=True)

    pdf_urls = []
    with ThreadPoolExecutor(max_workers=15) as pool, httpx.Client(follow_redirects=True, timeout=15) as client:
        fut = {pool.submit(extract_pdf_url, url, client): url for url in articles}
        for i, f in enumerate(as_completed(fut), 1):
            pdf_urls.extend(f.result())
            if i % 20 == 0:
                print(f"  Scraped {i}/{len(articles)} articles, found {len(pdf_urls)} PDFs", flush=True)
    print(f"Total PDFs: {len(pdf_urls)}", flush=True)

    # Process phase — DB per batch
    total_segments = 0
    batch = []
    conn = get_conn()
    ensure_schema(conn)

    with ThreadPoolExecutor(max_workers=3) as pool, httpx.Client(follow_redirects=True, timeout=120, verify=False) as client:
        fut = {pool.submit(process_pdf, url, client): url for url in pdf_urls}
        for i, f in enumerate(as_completed(fut), 1):
            try:
                chunks, url = f.result()
            except Exception as e:
                name = url.split("/")[-1][:50]
                print(f"  [{i}/{len(pdf_urls)}] FAIL {name}: {str(e)[:60]}", flush=True)
                continue

            if not chunks:
                continue

            try:
                doc_id = insert_document(conn, country_code="TN", content=url.split("/")[-1].replace(".pdf", ""), filename=url.split("/")[-1], source="jibaya", source_url=url)
                texts = [c["content"][:512] for c in chunks]
                embs = embed_texts(texts)
                for j, (ch, emb) in enumerate(zip(chunks, embs)):
                    insert_segment(conn, country_code="TN", content=ch["content"], source_document_id=doc_id, vector=emb, chunk_index=j, tags=ch["sectors"], law_id=ch.get("law_id"), refs=ch.get("refs"))
                total_segments += len(chunks)
            except psycopg.OperationalError:
                print("  DB lost — reconnecting...", flush=True)
                conn.close()
                time.sleep(2)
                conn = get_conn()
                ensure_schema(conn)
                doc_id = insert_document(conn, country_code="TN", content=url.split("/")[-1].replace(".pdf", ""), filename=url.split("/")[-1], source="jibaya", source_url=url)
                texts = [c["content"][:512] for c in chunks]
                embs = embed_texts(texts)
                for j, (ch, emb) in enumerate(zip(chunks, embs)):
                    insert_segment(conn, country_code="TN", content=ch["content"], source_document_id=doc_id, vector=emb, chunk_index=j, tags=ch["sectors"], law_id=ch.get("law_id"), refs=ch.get("refs"))
                total_segments += len(chunks)

            if i % 5 == 0:
                print(f"  [{i}/{len(pdf_urls)}] processed, {total_segments} segs", flush=True)

    conn.close()
    print(f"\nDone: {total_segments} segments from {len(pdf_urls)} PDFs", flush=True)

if __name__ == "__main__":
    main()
