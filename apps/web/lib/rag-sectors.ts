const SECTOR_KEYWORDS: Record<string, string[]> = {
  tax: [
    "impôt", "taxe", "tva", "fiscal", "irpp", "is",
    "déclaration", "retenue", "taux", "crédit d'impôt",
    "tax", "vat", "gst", "withholding", "corporate tax", "income tax",
  ],
  social: [
    "cnss", "cnrps", "sécurité sociale", "cotisation", "prestation",
    "social security", "contribution", "pension", "health insurance",
  ],
  labor: [
    "code du travail", "contrat de travail", "salarié", "employeur",
    "licenciement", "congé", "salaire", "smig",
    "labor", "employment", "termination", "severance",
  ],
  corporate: [
    "société", "sarl", "sa", "actionnaire", "commerce",
    "company", "corporation", "shareholder", "board",
  ],
  accounting: [
    "comptabilité", "bilan", "compte de résultat", "audit",
    "accounting", "gaaf", "ifrs", "financial statement",
  ],
  einvoicing: [
    "facture électronique", "e-invoicing", "signature électronique",
    "invoice", "clearance",
  ],
  data: [
    "données personnelles", "protection des données", "rgpd",
    "data protection", "privacy", "gdpr",
  ],
  currency: [
    "change", "code des changes", "convertibilité", "rapatriement",
    "currency control", "foreign exchange", "repatriation",
  ],
  customs: [
    "douane", "code des douanes", "importation", "exportation",
    "customs", "tariff", "rules of origin",
  ],
  aml: [
    "blanchiment", "lcb-ft", "kyc", "bénéficiaire effectif",
    "anti-money laundering", "aml",
  ],
  realestate: [
    "foncier", "immobilier", "hypothèque", "notaire", "propriété",
    "real estate", "property", "mortgage",
  ],
  procurement: [
    "marchés publics", "appel d'offres", "concession",
    "public procurement", "tender",
  ],
  banking: [
    "banque", "taux d'intérêt", "moyen de paiement",
    "banking", "fintech", "payment",
  ],
  investment: [
    "investissement", "code des investissements", "zone franche",
    "incitation fiscale", "investment", "free zone",
  ],
};

export function classifyQuerySector(query: string): string[] {
  const lower = query.toLowerCase();
  const matched: string[] = [];
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        matched.push(sector);
        break;
      }
    }
  }
  return matched;
}
