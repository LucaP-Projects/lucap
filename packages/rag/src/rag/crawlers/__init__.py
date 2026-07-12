from .base import Crawler, Document
from .tunisia import TunisiaCrawler

REGISTRY: dict[str, type[Crawler]] = {
    "TN": TunisiaCrawler,
}


def get_crawler(country_code: str, **kwargs) -> Crawler | None:
    cls = REGISTRY.get(country_code)
    if cls is None:
        return None
    return cls(**kwargs)


def list_supported() -> list[str]:
    return sorted(REGISTRY.keys())
