import re
from typing import Generator
from .refs import extract_references, extract_law_id

CHUNK_MAX_WORDS = 200
CHUNK_OVERLAP_WORDS = 20

SECTOR_KEYWORDS: dict[str, list[str]] = {
    "tax": [
        "impôt", "taxe", "tva", "fiscal", "irpp", "is",
        "déclaration", "retenue à la source", "crédit d'impôt",
        "droit d'enregistrement", "timbre", "tax", "vat", "gst",
        "withholding", "corporate tax", "income tax", "transfer pricing",
    ],
    "social": [
        "cnss", "cnrps", "sécurité sociale", "cotisation", "prestation sociale",
        "allocations familiales", "assurance maladie", "retraite", "mutuelle",
        "social security", "contribution", "pension", "health insurance",
    ],
    "labor": [
        "code du travail", "contrat de travail", "salarié", "employeur",
        "licenciement", "préavis", "congé", "temps de travail",
        "salaire minimum", "smig", "convention collective",
        "labor", "employment", "termination", "severance",
    ],
    "corporate": [
        "code de commerce", "société", "sarl", "sa", "actionnaire",
        "assemblée générale", "conseil d'administration", "gérant",
        "registre du commerce", "fusion", "liquidation",
        "company", "corporation", "shareholder", "board",
    ],
    "accounting": [
        "comptabilité", "plan comptable", "bilan", "compte de résultat",
        "norme comptable", "etats financiers", "audit", "commissaire",
        "accounting", "gaap", "ifrs", "financial statement",
    ],
    "einvoicing": [
        "facture électronique", "e-invoicing", "facturation électronique",
        "signature électronique", "archivage électronique",
        "invoice", "clearance", "continuous transaction",
    ],
    "data": [
        "données personnelles", "protection des données", "rgpd",
        "consentement", "data protection", "privacy",
        "gdpr", "personal data", "cross-border transfer",
    ],
    "currency": [
        "change", "code des changes", "convertibilité", "rapatriement",
        "compte en devises", "banque centrale", "currency control",
        "foreign exchange", "repatriation", "capital control",
    ],
    "customs": [
        "douane", "code des douanes", "droit de douane", "importation",
        "exportation", "règles d'origine", "customs", "tariff",
    ],
    "aml": [
        "blanchiment", "lcb-ft", "kyc", "bénéficiaire effectif",
        "déclaration de soupçon", "anti-money laundering", "aml",
        "beneficial ownership", "suspicious transaction",
    ],
    "realestate": [
        "foncier", "immobilier", "cadastre", "hypothèque", "notaire",
        "propriété", "urbanisme", "real estate", "property", "mortgage",
    ],
    "procurement": [
        "marchés publics", "appel d'offres", "concession",
        "public procurement", "tender", "government contract",
    ],
    "banking": [
        "banque", "taux d'intérêt", "moyen de paiement",
        "monnaie électronique", "psp", "banking", "fintech",
    ],
    "investment": [
        "investissement", "code des investissements", "zone franche",
        "incitation fiscale", "investment", "free zone", "tax incentive",
    ],
}

ARABIC_SECTOR_KEYWORDS: dict[str, list[str]] = {
    "tax": ["ضريبة", "جباية", "أداء", "tva", "إقرار", "تصريح"],
    "social": ["ضمان اجتماعي", "cnss", "cnrps", "تقاعد", "تأمين صحي"],
    "labor": ["شغل", "أجير", "مشغّل", "عقد عمل", "تسريح"],
    "corporate": ["شركة", "تجاري", "مساهم", "سجل تجاري"],
    "accounting": ["محاسبة", "ميزانية", "حسابات", "تدقيق"],
    "einvoicing": ["فاتورة إلكترونية", "فاتورة"],
    "data": ["معطيات شخصية", "بيانات شخصية"],
    "currency": ["صرف", "تحويل", "عملة"],
    "customs": ["ديوانة", "تصدير", "استيراد"],
    "aml": ["غسل أموال", "تمويل الإرهاب"],
    "realestate": ["عقار", "ملكية", "رهن", "عدل"],
    "procurement": ["صفقات عمومية", "مناقصة"],
    "banking": ["بنك", "مؤسسة مالية", "دفع"],
    "investment": ["استثمار", "منطقة حرة", "حوافز"],
}


def classify_sector(text: str) -> list[str]:
    text_lower = text.lower()
    matched: list[str] = []
    for sector, keywords in SECTOR_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in text_lower:
                matched.append(sector)
                break
    if not matched:
        for sector, keywords in ARABIC_SECTOR_KEYWORDS.items():
            for kw in keywords:
                if kw in text:
                    matched.append(sector)
                    break
    return matched if matched else ["general"]


def extract_jort_ref(text: str) -> str | None:
    """Extract the decree/law reference from a JORT document (FR or AR)."""
    m = re.search(
        r"(Décret|Arrêté|Loi|Décision|Ordre)\s+n[°°]\s*(\d{4})-(\d+)",
        text,
    )
    if m:
        return f"{m.group(1)} n° {m.group(2)}-{m.group(3)}"
    m = re.search(r"(Décret|Arrêté|Loi)\s+.*?du\s+(\d+\s+\w+\s+\d{4})", text)
    if m:
        return m.group(0)[:80]
    m = re.search(r"(أمر|قرار)\s+عدد\s*(\d+)\s+لسنة\s*(\d{4})", text)
    if m:
        return f"{m.group(1)} عدد {m.group(2)} لسنة {m.group(3)}"
    return None


def is_decree_boundary(line: str) -> bool:
    """Check if a line marks the start of a new decree in JORT (FR or AR)."""
    clean = line.strip()
    if not clean:
        return False
    if re.match(
        r"^(Décret|Arrêté|LOI|Loi|Décision|Ordre)\s",
        clean,
        re.IGNORECASE,
    ):
        return True
    if re.match(r"^MINIST[ÈE]RE\s", clean, re.IGNORECASE):
        return True
    if re.match(r"^(أمر|قرار|منشور|تعليمة|بلاغ|إعلان|وزير|وزارة)\s", clean):
        return True
    return False


def chunk_jort(text: str, source: str) -> list[dict]:
    """JORT-aware chunker: splits at decree/arrêté boundaries."""
    lines = text.split("\n")
    chunks: list[dict] = []
    current: list[str] = []
    current_meta = {"title": source, "ref": None, "sectors": []}

    def flush():
        if not current:
            return
        content = "\n".join(current).strip()
        if len(content) < 20:
            return
        sectors = classify_sector(content)
        header = current_meta["title"]
        law_refs = extract_references(content, header)
        law_id = extract_law_id(content[:300])
        chunks.append({
            "title": header,
            "content": content,
            "source": source,
            "sectors": sectors,
            "page_number": None,
            "ref": current_meta["ref"],
            "law_id": law_id,
            "refs": law_refs,
        })

    for line in lines:
        if is_decree_boundary(line) and len("\n".join(current).strip()) > 100:
            flush()
            current = []
            ref = extract_jort_ref(line)
            current_meta = {"title": line.strip()[:120], "ref": ref, "sectors": []}
        current.append(line)

    flush()
    return chunks


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
        sectors = classify_sector(content)
        law_id = extract_law_id(content[:300])
        law_refs = extract_references(content, title)
        chunks.append({
            "title": title,
            "content": content,
            "source": source,
            "sectors": sectors,
            "page_number": None,
            "ref": None,
            "law_id": law_id,
            "refs": law_refs,
        })
        current = []

    for line in lines:
        heading_match = re.match(r"^(#{1,6})\s+(.+)$", line)
        if heading_match:
            flush()
            level = len(heading_match.group(1))
            heading_text = heading_match.group(2).strip()
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
        if len(" ".join(current).split()) >= max_words:
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
        content = " ".join(chunk_words)
        sectors = classify_sector(content)
        law_id = extract_law_id(content[:300])
        law_refs = extract_references(content, source)
        chunks.append({
            "title": source,
            "content": content,
            "source": source,
            "sectors": sectors,
            "page_number": None,
            "ref": extract_jort_ref(content),
            "law_id": law_id,
            "refs": law_refs,
        })
    return chunks


def chunk_document(text: str, source: str) -> list[dict]:
    if "jort" in source or "journal-officiel" in source:
        return chunk_jort(text, source)
    if re.search(r"^#{1,6}\s+", text, re.MULTILINE):
        return chunk_markdown_by_headings(text, source)
    return chunk_plain_text(text, source)


def truncate_for_embedding(text: str, max_chars: int = 512) -> str:
    return text[:max_chars]
