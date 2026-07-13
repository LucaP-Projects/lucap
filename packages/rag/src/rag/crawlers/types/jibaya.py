"""Crawler for jibaya.tn — Tunisian tax document portal."""

import json
import re
import httpx
from pathlib import Path
from typing import Generator
from bs4 import BeautifulSoup

from ..base import Crawler, Document


JIBATA_MANIFEST_RAW = (
    "https://raw.githubusercontent.com/"
    "rnmdridi/silkcrawl/main/jibaya_docs_data.json"
)


class JibayaCrawler(Crawler):
    type = "jibaya"

    def __init__(self, manifest: str | None = None, **kwargs):
        self._manifest_path = manifest
        self.client = httpx.Client(follow_redirects=True, timeout=30)

    def crawl(self) -> Generator[Document, None, None]:
        manifest = self._load_manifest()
        if not manifest:
            print("  [WARN] No jibaya manifest available")
            return

        for category in manifest:
            for sub in category.get("sub_categories", []):
                for article in sub.get("articles", []):
                    url = article["url"]
                    title = article["title"]
                    try:
                        resp = self.client.get(url)
                        resp.raise_for_status()
                        soup = BeautifulSoup(resp.text, "lxml")
                        pdfs = []
                        for a in soup.find_all("a", href=True):
                            h = a["href"]
                            if h.endswith(".pdf") or ".pdf" in h:
                                pdfs.append(a)
                        for link in pdfs:
                            href = link.get("href")
                            if not href:
                                continue
                            full_url = (
                                href if href.startswith("http")
                                else f"https://jibaya.tn{href}"
                            )
                            safe = re.sub(r"[^a-zA-Z0-9_-]", "_", title)[:60]
                            yield Document(
                                url=full_url,
                                filename=f"jibaya_{safe}.pdf",
                                country_code=self.country_code,
                                source="jibaya",
                            )
                    except Exception as e:
                        print(f"  [WARN] jibaya article failed: {url} — {e}")

    def _load_manifest(self) -> list[dict]:
        if self._manifest_path and Path(self._manifest_path).exists():
            with open(self._manifest_path) as f:
                return json.load(f)
        try:
            resp = self.client.get(JIBATA_MANIFEST_RAW, timeout=15)
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return []

    def __del__(self):
        self.client.close()
