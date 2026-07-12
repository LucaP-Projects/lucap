"""
Entry point: crawl + pipeline for one or all countries.

Usage:
  python -m rag.ingest TN              # Crawl + ingest Tunisia only
  python -m rag.ingest all              # All supported countries
  python -m rag.ingest list             # List supported countries
"""

import sys
from .db import get_conn, ensure_schema
from .pipeline import run_pipeline
from .crawlers import get_crawler, list_supported, REGISTRY


def main():
    args = sys.argv[1:]
    if not args or args[0] == "list":
        print("Supported countries:", ", ".join(list_supported()))
        return

    countries = list_supported() if args[0] == "all" else args

    conn = get_conn()
    ensure_schema(conn)

    for cc in countries:
        crawler = get_crawler(cc)
        if crawler is None:
            print(f"Unknown country: {cc}")
            continue

        print(f"\n=== {cc} ({crawler.__class__.__name__}) ===")
        print("Crawling...")
        docs = list(crawler.crawl())
        print(f"Found {len(docs)} documents")

        total = run_pipeline(docs, conn, data_dir="data")
        print(f"Total segments: {total}")

    conn.close()


if __name__ == "__main__":
    main()
