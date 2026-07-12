import os
from pathlib import Path


class QboCrawler:
    name = "qbo"
    country_code = "GLOBAL"

    def __init__(self, docs_dir: str | None = None):
        self.docs_dir = docs_dir or os.environ.get(
            "QBO_DOCS_DIR",
            str(Path.home() / "Desktop" / "SILKDEV" / "qbp" / "qbo_docs"),
        )

    def list_documents(self) -> list[dict]:
        docs: list[dict] = []
        p = Path(self.docs_dir)
        if not p.exists():
            print(f"  WARNING: QBO docs dir not found: {p}")
            return docs
        for f in sorted(p.glob("*.md")):
            docs.append({
                "path": str(f),
                "filename": f.name,
                "source": "qbo",
                "source_url": None,
                "country_code": "GLOBAL",
            })
        return docs
