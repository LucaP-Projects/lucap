"""
Tunisia legal document crawler.
Sources:
  - jibaya.tn (tax codes, fiscal notes, circulars) via URL manifest
  - jort.tn (Official Journal of the Republic of Tunisia) via URL generation
"""

import json
import re
import httpx
from pathlib import Path
from typing import Generator
from bs4 import BeautifulSoup

from .base import Crawler, Document


JIBATA_MANIFEST_URL = (
    "https://raw.githubusercontent.com/"
    "rnmdridi/silkcrawl/main/jibaya_docs_data.json"
)


class TunisiaCrawler(Crawler):
    country_code = "TN"

    def __init__(self, data_dir: str | None = None, jibaya_manifest: str | None = None):
        self.data_dir = Path(data_dir or "data/tunisia")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self._jibaya_manifest = jibaya_manifest
        self.client = httpx.Client(follow_redirects=True, timeout=30)

    def crawl(self) -> Generator[Document, None, None]:
        yield from self._crawl_jibaya()
        yield from self._crawl_jort()

    # ─── Jibaya.tn (tax docs via URL manifest) ───

    def _crawl_jibaya(self) -> Generator[Document, None, None]:
        manifest = self._load_jibaya_manifest()
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
                        pdf_links = []
                        for a in soup.find_all("a", href=True):
                            h = a["href"]
                            if h.endswith(".pdf") or ".pdf" in h:
                                pdf_links.append(a)
                        for link in pdf_links:
                            href = link.get("href")
                            if not href:
                                continue
                            full_url = (
                                href if href.startswith("http")
                                else f"https://jibaya.tn{href}"
                            )
                            safe_title = re.sub(r"[^a-zA-Z0-9_-]", "_", title)[:60]
                            filename = f"jibaya_{safe_title}.pdf"
                            yield Document(
                                url=full_url,
                                filename=filename,
                                country_code="TN",
                                source="jibaya",
                            )
                    except Exception as e:
                        print(f"  [WARN] jibaya article failed: {url} — {e}")

    def _load_jibaya_manifest(self) -> list[dict]:
        if self._jibaya_manifest:
            with open(self._jibaya_manifest) as f:
                return json.load(f)
        try:
            resp = self.client.get(JIBATA_MANIFEST_URL, timeout=15)
            resp.raise_for_status()
            return resp.json()
        except Exception:
            local = Path("jibaya_docs_data.json")
            if local.exists():
                with open(local) as f:
                    return json.load(f)
            return []

    # ─── JORT (Official Journal) ───

    JORT_COLLECTIONS = [
        "journal-officiel",
        "annonces-legales",
        "tribunal-immobilier",
    ]

    def _crawl_jort(self) -> Generator[Document, None, None]:
        for collection in self.JORT_COLLECTIONS:
            try:
                resp = self.client.get(
                    f"https://jort.tn/browse/{collection}/"
                )
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "lxml")
                years = set()
                for link in soup.find_all("a", href=True):
                    m = re.search(
                        rf"/browse/{re.escape(collection)}/(\d{{4}})",
                        link["href"],
                    )
                    if m:
                        years.add(int(m.group(1)))
                for year in sorted(years):
                    issues = self._get_jort_issues(collection, year)
                    for issue_num in issues:
                        for lang in ("fr", "ar"):
                            pdf_url = (
                                f"https://lake.jort.tn/{collection}/{lang}/"
                                f"{year}/{issue_num}.pdf"
                            )
                            filename = (
                                f"jort_{collection}_{lang}_{year}_"
                                f"{issue_num:04d}.pdf"
                            )
                            yield Document(
                                url=pdf_url,
                                filename=filename,
                                country_code="TN",
                                source=f"jort/{collection}",
                            )
            except Exception as e:
                print(f"  [WARN] jort/{collection} failed: {e}")

    def _get_jort_issues(
        self, collection: str, year: int
    ) -> list[int]:
        try:
            resp = self.client.get(
                f"https://jort.tn/browse/{collection}/{year}/"
            )
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")
            issues = set()
            for link in soup.select("a[href]"):
                m = re.search(
                    rf"/browse/{re.escape(collection)}/{year}/(\d+)",
                    link["href"],
                )
                if m:
                    issues.add(int(m.group(1)))
            return sorted(issues)
        except Exception:
            return []

    def __del__(self):
        self.client.close()
