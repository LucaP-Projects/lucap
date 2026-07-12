"""
Tunisia legal document crawler.
Sources:
  - jibaya.tn (tax codes, fiscal notes, circulars)
  - jort.tn (Official Journal of the Republic of Tunisia)
"""

import json
import re
import httpx
from pathlib import Path
from typing import Generator
from bs4 import BeautifulSoup

from .base import Crawler, Document


class TunisiaCrawler(Crawler):
    country_code = "TN"

    def __init__(self, data_dir: str | None = None):
        self.data_dir = Path(data_dir or "data/tunisia")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.client = httpx.Client(follow_redirects=True, timeout=30)

    # ─── Jibaya.tn (tax codes, fiscal notes) ───

    JIBAYA_URLS = {
        "code-impot": "https://jibaya.tn/code-impot/",
        "code-enregistrement": "https://jibaya.tn/code-enregistrement/",
        "code-tva": "https://jibaya.tn/code-tva/",
        "code-procedure-fiscale": "https://jibaya.tn/code-procedure-fiscale/",
        "conventions-fiscales": "https://jibaya.tn/conventions-fiscales/",
        "notes-communes": "https://jibaya.tn/notes-communes/",
        "lois-finances": "https://jibaya.tn/lois-de-finances/",
        "circulaires": "https://jibaya.tn/circulaires/",
    }

    JORT_COLLECTIONS = [
        "journal-officiel",
        "annonces-legales",
        "tribunal-immobilier",
    ]

    def crawl(self) -> Generator[Document, None, None]:
        yield from self._crawl_jibaya()
        yield from self._crawl_jort()

    def _crawl_jibaya(self) -> Generator[Document, None, None]:
        """Crawl jibaya.tn for PDF documents."""
        for name, url in self.JIBAYA_URLS.items():
            try:
                resp = self.client.get(url)
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "lxml")
                for link in soup.select("a[href$='.pdf'], a.wp-block-file__button, .wp-block-file a"):
                    href = link.get("href")
                    if href and href.endswith(".pdf"):
                        full_url = href if href.startswith("http") else f"https://jibaya.tn{href}"
                        filename = f"jibaya_{name}_{href.split('/')[-1]}"
                        yield Document(
                            url=full_url,
                            filename=filename,
                            country_code="TN",
                            source=f"jibaya/{name}",
                        )
            except Exception as e:
                print(f"  [WARN] Failed to crawl jibaya/{name}: {e}")

    def _crawl_jort(self) -> Generator[Document, None, None]:
        """Crawl jort.tn for Official Journal PDFs."""
        for collection in self.JORT_COLLECTIONS:
            try:
                resp = self.client.get(f"https://jort.tn/browse/{collection}/")
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "lxml")
                years = set()
                for link in soup.select("a"):
                    href = link.get("href", "")
                    m = re.search(r"/browse/" + collection + r"/(\d{4})", href)
                    if m:
                        years.add(int(m.group(1)))
                for year in sorted(years):
                    issues_resp = self.client.get(
                        f"https://jort.tn/browse/{collection}/{year}/"
                    )
                    issues_resp.raise_for_status()
                    issues_soup = BeautifulSoup(issues_resp.text, "lxml")
                    issue_nums = set()
                    for link in issues_soup.select("a"):
                        href = link.get("href", "")
                        m = re.search(rf"/browse/{collection}/{year}/(\d+)", href)
                        if m:
                            issue_nums.add(int(m.group(1)))
                    for issue_num in sorted(issue_nums):
                        for lang in ("fr", "ar"):
                            pdf_url = f"https://lake.jort.tn/{collection}/{lang}/{year}/{issue_num}.pdf"
                            filename = f"jort_{collection}_{lang}_{year}_{issue_num:04d}.pdf"
                            yield Document(
                                url=pdf_url,
                                filename=filename,
                                country_code="TN",
                                source=f"jort/{collection}",
                            )
            except Exception as e:
                print(f"  [WARN] Failed to crawl jort/{collection}: {e}")

    def __del__(self):
        self.client.close()
