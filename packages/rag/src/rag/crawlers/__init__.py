"""Config-driven crawler registry.

Loads a country's YAML config and instantiates the configured crawlers.
"""

import os
import yaml
from pathlib import Path
from typing import Generator

from .base import Crawler, Document

# Import all crawler types — they register themselves via the TYPE registry
from .types.jibaya import JibayaCrawler
from .types.jort import JortCrawler

# ── Crawler type registry ──
# Keys match the `type` field in YAML config
CRAWLER_TYPES: dict[str, type[Crawler]] = {
    "jibaya": JibayaCrawler,
    "jort": JortCrawler,
}

# ── Config loading ──

CONFIG_DIR = Path(__file__).parent.parent.parent.parent / "config"


def get_config_path(country_code: str) -> Path | None:
    code = country_code.lower()
    for f in CONFIG_DIR.glob("*.yaml"):
        if f.stem.lower() == code:
            return f
    return None


def load_config(country_code: str) -> dict | None:
    path = get_config_path(country_code)
    if path is None:
        return None
    with open(path) as f:
        return yaml.safe_load(f)


def list_configured() -> list[str]:
    return sorted(f.stem.upper() for f in CONFIG_DIR.glob("*.yaml"))
