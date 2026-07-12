def extract_text_from_markdown(filepath: str) -> str:
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()
