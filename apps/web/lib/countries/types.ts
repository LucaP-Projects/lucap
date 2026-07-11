export type Region =
  | 'NORTH_AFRICA' | 'SUB_SAHARAN_AFRICA' | 'EUROPE' | 'ASIA'
  | 'NORTH_AMERICA' | 'SOUTH_AMERICA' | 'OCEANIA' | 'MIDDLE_EAST' | 'CARIBBEAN';

export type TaxRegime = 'VAT' | 'GST' | 'SALES_TAX' | 'CONSUMPTION_TAX' | 'NONE' | 'RST' | 'IVA';
export type FiscalYearEnd = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11; // 0=Jan, 11=Dec
export type AccountStandard = 'PCN_TUNISIE' | 'PCG_FRANCE' | 'OHADA' | 'IFRS' | 'US_GAAP' | 'UK_GAAP' | 'LOCAL';

export type SupportLevel = 'full' | 'basic' | 'coming';

export interface CountryConfig {
  supportLevel: SupportLevel;
  alpha2: string;
  alpha3: string;
  numeric: string;
  nameEn: string;
  nameFr: string;
  nameLocal?: string;
  region: Region;
  currency: {
    code: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  languages: string[];
  locales: string[];
  phoneCode: string;
  timezone: string;
  tax: {
    regime: TaxRegime;
    standardRate: number;
    reducedRate?: number;
    superReducedRate?: number;
    zeroRated: boolean;
    hasWithholdingTax: boolean;
    hasSalesTax: boolean;
    taxInclusiveDefault: boolean;
    hasProvincialTax: boolean;
  };
  accounting: {
    standard: AccountStandard;
    fiscalYearStart: FiscalYearEnd;
    fiscalYearEnd: FiscalYearEnd;
    chartDigits: number;
    requiresMatriculeFiscale: boolean;
    requiresAudit: boolean;
    requiresFEC: boolean;
    requiresCbCR: boolean;
    requiresTransferPricing: boolean;
  };
  invoice: {
    requiresSequentialNumbering: boolean;
    requiresCustomerTaxId: boolean;
    requiresSellerTaxId: boolean;
    requiresLegalForm: boolean;
    requiresShareCapital: boolean;
    maxArchivalYears: number;
  };
}
