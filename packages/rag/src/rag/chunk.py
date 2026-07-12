import re

CHUNK_MAX_WORDS = 200
CHUNK_OVERLAP_WORDS = 20


def chunk_markdown_by_headings(text: str, source: str, max_words: int = CHUNK_MAX_WORDS) -> list[dict]:
    lines = text.split("\n")
    chunks: list[dict] = []
    current: list[str] = []
    current_title = source
    heading_stack: list[str] = []

    def flush():
        nonlocal current
        if not current:
            return
        content = "\n".join(current).strip()
        if not content:
            return
        title = current_title
        if heading_stack:
            title = " > ".join(heading_stack)
        chunks.append({"title": title, "content": content, "source": source})
        current = []

    for line in lines:
        heading_match = re.match(r"^(#{1,6})\s+(.+)$", line)
        if heading_match:
            flush()
            level = len(heading_match.group(1))
            heading_text = heading_match.group(2).strip()
            # Update heading stack
            while heading_stack and len(heading_stack) >= level:
                heading_stack.pop()
            if len(heading_stack) < level:
                heading_stack.append(heading_text)
            else:
                heading_stack[-1] = heading_text
            current_title = heading_text
            current = [line]
            continue

        current.append(line)
        word_count = len(" ".join(current).split())
        if word_count >= max_words:
            flush()

    flush()
    return chunks


def chunk_plain_text(text: str, source: str, max_words: int = CHUNK_MAX_WORDS) -> list[dict]:
    words = text.split()
    if not words:
        return []
    chunks: list[dict] = []
    for i in range(0, len(words), max_words - CHUNK_OVERLAP_WORDS):
        chunk_words = words[i:i + max_words]
        chunks.append({
            "title": source,
            "content": " ".join(chunk_words),
            "source": source,
        })
    return chunks


def chunk_document(text: str, source: str) -> list[dict]:
    if re.search(r"^#{1,6}\s+", text, re.MULTILINE):
        return chunk_markdown_by_headings(text, source)
    return chunk_plain_text(text, source)


def truncate_for_embedding(text: str, max_chars: int = 512) -> str:
    return text[:max_chars]
