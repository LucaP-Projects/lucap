"""
Entry point: config-driven crawl + ingest per country.

Usage:
  python -m rag.ingest TN          # Crawl + ingest Tunisia
  python -m rag.ingest all         # All configured countries
  python -m rag.ingest list        # List configured countries
"""

import sys
from .db import get_conn, ensure_schema
from .pipeline import run_pipeline
from .crawlers import CRAWLER_TYPES, load_config, list_configured


def main():
    args = sys.argv[1:]
    if not args or args[0] == "list":
        print("Configured countries:", ", ".join(list_configured()))
        return

    codes = list_configured() if args[0] == "all" else args

    conn = get_conn()
    ensure_schema(conn)

    for cc in codes:
        cfg = load_config(cc)
        if cfg is None:
            print(f"Unknown country: {cc}")
            continue

        print(f"\n=== {cc} — {cfg.get('name', cc)} ===")
        all_docs = []

        for crawler_cfg in cfg.get("crawlers", []):
            ctype = crawler_cfg.get("type")
            cls = CRAWLER_TYPES.get(ctype)
            if cls is None:
                print(f"  Unknown crawler type: {ctype}")
                continue

            kwargs = {k: v for k, v in crawler_cfg.items() if k != "type"}
            crawler = cls(country_code=cc, **kwargs)
            print(f"  Running {ctype}...")
            docs = list(crawler.crawl())
            print(f"    Found {len(docs)} documents")
            all_docs.extend(docs)

        total = run_pipeline(all_docs, conn, data_dir="data")
        print(f"  Total segments: {total}")

    conn.close()


if __name__ == "__main__":
    main()
