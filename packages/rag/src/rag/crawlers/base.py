from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Generator


@dataclass
class Document:
    url: str
    filename: str
    country_code: str
    source: str
    metadata: dict | None = None


class Crawler(ABC):
    """Base class for legal document crawlers."""

    type = "base"  # Override in each subclass — matches `type` in YAML config

    def __init__(self, country_code: str = "XX", **kwargs):
        self.country_code = country_code

    @abstractmethod
    def crawl(self) -> Generator[Document, None, None]:
        """Yield documents to download."""
        ...

    def download(self, doc: Document) -> bytes | None:
        """Download a document. Override for custom auth/headers."""
        import httpx
        resp = httpx.get(doc.url, follow_redirects=True, timeout=60)
        resp.raise_for_status()
        return resp.content
