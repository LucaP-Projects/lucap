"""
Legal reference extraction and dependency graph building.

Each chunk can reference, amend, or cancel other legal texts.
We build a two-way dependency graph per country.
"""

import re
from typing import Generator

# ── Reference extraction ──

LAW_REF_RE = re.compile(
    r"(décret|loi|arrêté|décision|ordre|code|circulaire|note commune)"
    r"\s+n[°°]?\s*(\d{4})-(\d+)",
    re.IGNORECASE,
)

AMEND_VERBS = re.compile(
    r"(modifi|abrog|remplac|annul|complét|rapport|rectifi)",
    re.IGNORECASE,
)

AR_LAW_REF_RE = re.compile(
    r"(قانون|أمر|قرار|تعليمة|منشور|بلاغ|مرسوم)"
    r"\s+عدد\s*(\d+)\s+لسنة\s*(\d{4})",
)

AR_AMEND_VERBS = re.compile(
    r"(تعديل|إلغاء|استبدال|تعويض|إتمام|تبديل)",
)


def extract_law_id(text: str) -> str | None:
    """Extract the primary law reference from a chunk's header."""
    m = re.search(
        r"(décret|loi|arrêté)\s+n[°°]\s*(\d{4})-(\d+)",
        text[:200],
        re.IGNORECASE,
    )
    if m:
        return f"{m.group(1).lower()} n° {m.group(2)}-{m.group(3)}"
    m = AR_LAW_REF_RE.search(text[:200])
    if m:
        return f"{m.group(1)} عدد {m.group(2)} لسنة {m.group(3)}"
    return None


def normalize_ref(ref: str) -> str:
    """Normalize a law reference to lowercase for dedup."""
    ref = ref.strip().lower()
    ref = ref.replace("décret", "decret")
    ref = ref.replace("arrêté", "arrete")
    ref = ref.replace("décision", "decision")
    return ref


def extract_references(text: str, chunk_header: str = "") -> dict:
    """
    Parse a chunk's content and return:
    {
      "amends": [...],       # Laws this chunk modifies/cancels
      "references": [...],   # Laws this chunk cites for context ("vu")
      "amended_by": [],      # Populated by backfill
      "refs": [...],         # All law references found
    }
    """
    result = {
        "amends": [],
        "references": [],
        "amended_by": [],
        "refs": [],
    }

    # Find all law references
    raw_refs = set()
    for m in re.finditer(
        r"(décret|loi|arrêté)\s+n[°°]\s*(\d{4})-(\d+)",
        text,
        re.IGNORECASE,
    ):
        ref = f"{m.group(1).lower()} n° {m.group(2)}-{m.group(3)}"
        raw_refs.add(ref)
    for m in AR_LAW_REF_RE.finditer(text):
        ref = f"{m.group(1)} عدد {m.group(2)} لسنة {m.group(3)}"
        raw_refs.add(ref)

    # Filter out self-references
    header_norm = normalize_ref(chunk_header)
    all_refs = set()
    for ref in raw_refs:
        if normalize_ref(ref) != header_norm:
            all_refs.add(ref)

    result["refs"] = sorted(all_refs)
    if not all_refs:
        return result

    # Check each sentence for amend/cancel context
    sentences = re.split(r"[.!?\n]+", text)
    for sentence in sentences:
        is_amend = bool(AMEND_VERBS.search(sentence) or AR_AMEND_VERBS.search(sentence))
        is_vu = bool(re.search(r"\b(vu|conformément|vertu)\b", sentence, re.IGNORECASE))

        for ref in all_refs:
            if ref not in sentence.lower():
                continue
            if is_amend:
                if ref not in result["amends"]:
                    result["amends"].append(ref)
            elif is_vu:
                if ref not in result["references"]:
                    result["references"].append(ref)
            else:
                if ref not in result["references"]:
                    result["references"].append(ref)

    return result


# ── Dependency graph ──

def build_dependency_graph(chunks: list[dict]) -> dict[str, dict]:
    """
    Build a two-way graph from all chunks.
    Returns: { law_id: { "amends": [...], "amended_by": [...], "references": [...] } }
    """
    graph: dict[str, dict] = {}

    for chunk in chunks:
        refs = chunk.get("refs", {})
        if isinstance(refs, str):
            continue  # skip if not parsed yet
        for amend in refs.get("amends", []):
            if amend not in graph:
                graph[amend] = {"amends": [], "amended_by": [], "references": []}
        for ref in refs.get("references", []):
            if ref not in graph:
                graph[ref] = {"amends": [], "amended_by": [], "references": []}

    for chunk in chunks:
        refs = chunk.get("refs", {})
        if isinstance(refs, str):
            continue
        chunk_id = chunk.get("ref") or chunk.get("title", "")
        chunk_law_id = extract_law_id(chunk["content"][:500])

        if chunk_law_id and chunk_law_id not in graph:
            graph[chunk_law_id] = {"amends": [], "amended_by": [], "references": []}

        for amend in refs.get("amends", []):
            if chunk_law_id and chunk_law_id in graph:
                if amend not in graph[chunk_law_id]["amends"]:
                    graph[chunk_law_id]["amends"].append(amend)
            if amend in graph:
                if chunk_law_id and chunk_law_id not in graph[amend]["amended_by"]:
                    graph[amend]["amended_by"].append(chunk_law_id)

        for ref in refs.get("references", []):
            if chunk_law_id and chunk_law_id in graph:
                if ref not in graph[chunk_law_id]["references"]:
                    graph[chunk_law_id]["references"].append(ref)

    return graph


def format_dependency_context(graph: dict[str, dict], chunk_law_id: str | None) -> str:
    """Format a human-readable amendment chain for LLM context."""
    if not chunk_law_id or chunk_law_id not in graph:
        return ""
    node = graph[chunk_law_id]
    parts = []
    if node["amended_by"]:
        parts.append(f"Amendé par: {', '.join(node['amended_by'])}")
    if node["amends"]:
        parts.append(f"Amende: {', '.join(node['amends'])}")
    if node["references"]:
        # only show refs not already covered
        refs = [r for r in node["references"] if r not in node["amends"]]
        if refs:
            parts.append(f"Références: {', '.join(refs)}")
    return " | ".join(parts) if parts else ""
