"""Crawler for jort.tn — Tunisian Official Journal."""

import re
import httpx
from typing import Generator
from bs4 import BeautifulSoup

from ..base import Crawler, Document


class JortCrawler(Crawler):
    type = "jort"

    def __init__(self, collections: list[str] | None = None, **kwargs):
        super().__init__(**kwargs)
        self.collections = collections or [
            "journal-officiel",
            "annonces-legales",
            "tribunal-immobilier",
        ]
        self.client = httpx.Client(follow_redirects=True, timeout=30)

    def crawl(self) -> Generator[Document, None, None]:
        for collection in self.collections:
            yield from self._crawl_collection(collection)

    def _crawl_collection(self, collection: str) -> Generator[Document, None, None]:
        browse_url = f"https://jort.tn/browse/{collection}/"
        try:
            resp = self.client.get(browse_url)
            resp.raise_for_status()
        except Exception as e:
            print(f"  [WARN] jort/{collection} browse failed: {e}")
            return

        soup = BeautifulSoup(resp.text, "lxml")
        years = set()
        for link in soup.find_all("a", href=True):
            m = re.search(rf"/browse/{re.escape(collection)}/(\d{{4}})", link["href"])
            if m:
                years.add(int(m.group(1)))

        for year in sorted(years):
            issues = self._get_issues(collection, year)
            for issue_num in issues:
                for lang in ("fr", "ar"):
                    pdf_url = (
                        f"https://lake.jort.tn/{collection}/{lang}/"
                        f"{year}/{issue_num}.pdf"
                    )
                    yield Document(
                        url=pdf_url,
                        filename=f"jort_{collection}_{lang}_{year}_{issue_num:04d}.pdf",
                        country_code=self.country_code,
                        source=f"jort/{collection}",
                    )

    def _get_issues(self, collection: str, year: int) -> list[int]:
        try:
            resp = self.client.get(
                f"https://jort.tn/browse/{collection}/{year}/"
            )
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")
            issues = set()
            for link in soup.find_all("a", href=True):
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
