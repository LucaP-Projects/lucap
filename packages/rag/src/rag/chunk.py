import re

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
        "facture", "invoice", "clearance", "continuous transaction",
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
        "exportation", "règles d'origine", "déclaration en douane",
        "customs", "tariff", "free trade", "rules of origin",
    ],
    "aml": [
        "blanchiment", "financement du terrorisme", "lcb-ft",
        "kyc", "bénéficiaire effectif", "déclaration de soupçon",
        "anti-money laundering", "aml", "know your customer",
        "beneficial ownership", "suspicious transaction",
    ],
    "realestate": [
        "foncier", "immobilier", "cadastre", "hypothèque", "notaire",
        "propriété", "permis de construire", "urbanisme",
        "real estate", "property", "land", "mortgage",
    ],
    "procurement": [
        "marchés publics", "commande publique", "appel d'offres",
        "concession", "délégation de service public",
        "public procurement", "tender", "government contract",
    ],
    "banking": [
        "banque", "établissement de crédit", "taux d'intérêt",
        "moyen de paiement", "monnaie électronique", "psp",
        "banking", "payment", "fintech", "credit institution",
    ],
    "investment": [
        "investissement", "code des investissements", "incitation fiscale",
        "zone franche", "avantage fiscal", "investissement étranger",
        "investment", "tax incentive", "free zone", "foreign direct",
    ],
}


def classify_sector(text: str) -> list[str]:
    text_lower = text.lower()
    matched = []
    for sector, keywords in SECTOR_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in text_lower:
                matched.append(sector)
                break
    return matched if matched else ["general"]


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
        chunks.append({
            "title": title,
            "content": content,
            "source": source,
            "sectors": classify_sector(content),
            "page_number": None,
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
        content = " ".join(chunk_words)
        chunks.append({
            "title": source,
            "content": content,
            "source": source,
            "sectors": classify_sector(content),
            "page_number": None,
        })
    return chunks


def chunk_document(text: str, source: str) -> list[dict]:
    if re.search(r"^#{1,6}\s+", text, re.MULTILINE):
        return chunk_markdown_by_headings(text, source)
    return chunk_plain_text(text, source)


def truncate_for_embedding(text: str, max_chars: int = 512) -> str:
    return text[:max_chars]
