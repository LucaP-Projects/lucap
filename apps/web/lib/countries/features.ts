/**
 * Features that are ALWAYS available regardless of country support level.
 * These should never be gated by country configuration.
 * Non-accounting features like AI, document scanning, file upload,
 * marketplace, drive, tickets work independently of tax/regulatory setup.
 */
export function getCountryIndependentFeatures(): string[] {
  return [
    'ai assistant',
    'document scanning',
    'file upload',
    'drive',
    'marketplace',
    'online store',
    'shopping cart',
    'orders',
    'support tickets',
    'time tracking',
    'employee records',
    'customer management',
    'vendor management',
    'basic invoicing',
  ];
}

/**
 * Features that require FULL country support configuration.
 * These should show "support coming" banners but NOT block access.
 */
export function getCountryDependentFeatures(): string[] {
  return [
    'tax rates & codes',
    'tax agency management',
    'tax payment tracking',
    'legal invoice formatting',
    'country-specific reports (FEC, CA3)',
    'multi-currency (auto rates)',
    'budgeting',
    'TVA declarations',
    'withholding tax',
  ];
}
