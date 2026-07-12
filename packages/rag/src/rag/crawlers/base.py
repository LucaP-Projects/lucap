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
    """Base class for per-country legal document crawlers."""

    @property
    @abstractmethod
    def country_code(self) -> str:
        """ISO 3166-1 alpha-2 country code."""
        ...

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
