"""
Runtime retrieval module — called by the Next.js chat API to query pgvector.

Usage from TypeScript:
  const { searchSegments } = await import("@lucap/rag/retrieve");
  const results = await searchSegments(company.countryCode, userQuery);
"""

from .db import get_conn, ensure_schema
from .embed import embed_text
from .store import search_segments


def retrieve(query: str, country_code: str, limit: int = 5) -> list[dict]:
    conn = get_conn()
    ensure_schema(conn)

    query_vector = embed_text(query)
    results = search_segments(conn, country_code, query_vector, limit)

    conn.close()
    return results


def format_context(results: list[dict]) -> str:
    if not results:
        return ""
    lines: list[str] = []
    for r in results:
        source = r.get("source", "?")
        filename = r.get("filename", "?")
        sim = r.get("similarity", 0)
        lines.append(f"[{source}/{filename}] (score: {sim:.2f})")
        lines.append(r["content"])
        lines.append("")
    return "\n".join(lines)
