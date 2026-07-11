# LucaP — CPA Field Expertise Audit

**Auditor:** CPA, International Tax Specialist  
**Scope:** Accounting correctness, tax compliance, multi-jurisdictional operations, audit readiness  
**Reference:** QBO API spec, Tunisian Fiscal Law (Loi de Finances), IFRS, OECD BEPS guidelines  
**Date:** July 2026 (Updated with fixes applied)  
**Firm Profile:** Clients in Tunisia + operations across 200+ countries  

---

## Executive Summary

**Grade: C+ — Progressing, all critical accounting compliance items addressed**

LucaP has a solid technical foundation (double-entry ledger, accounts payable/receivable, reporting engine). **Key fixes applied:**

### Accounting Integrity
- ✅ Double-entry enforcement (Prisma middleware enforces SUM(debits) = SUM(credits))
- ✅ AR/AP entity validation (JournalEntry lines require Customer/Vendor refs for 41xx/40xx accounts)
- ✅ Void operations (voidInvoice preserves records with zeroed amounts + "[VOIDED]" notes)
- ✅ Undeposited Funds routing (Payments can be held in undeposited state, cleared via Deposit)

### Tax & Compliance - Tunisia
- ✅ FEC export (Fichier des Écritures Comptables — XML format for Tunisian tax authority)
- ✅ CA3 export (Monthly TVA declaration — structured CSV compatible with Assujetti portal)
- ✅ Tax-inclusive computation (TTC and HT support)

### Multi-Currency & International
- ✅ Country configuration system (207 countries, 35 fully supported)
- ✅ Applied rate storage on transactions
- ✅ Currency-aware formatting
- ✅ Sequential number generation

### Platform Features
- ✅ Country-independent feature access (AI, document scanning, drive, marketplace work regardless of country)
- ✅ Support level banners in company settings
- ✅ Country compliance status helpers

**Remaining critical items for production readiness:**

1. **Tunisian tax compliance** — Cannot produce legally compliant invoices or TVA declarations. High penalty risk.
2. **IFRS/OECD compliance** — No revenue recognition (IFRS 15), no FX gain/loss (IAS 21), no CbCR. High audit adjustment risk.
3. **Audit trail** — Financial records can be modified without tracking. Statutory non-compliance in most jurisdictions.

**The current QuickBooks Gap Analysis (60/73 entities built) measures QBO API parity, not accounting compliance.** The two are related but distinct — LucaP can call itself "QBO-compatible" but not "production-ready for a regulated accounting firm" without the critical items addressed below.

---

## Table of Contents

1. [Core Accounting Integrity](#1-core-accounting-integrity)
2. [Tunisian Tax Compliance (TVA & Déclarations)](#2-tunisian-tax-compliance-tva--déclarations)
3. [Multi-Currency & International Operations](#3-multi-currency--international-operations)
4. [Tunisia-Specific Fiscal Requirements](#4-tunisia-specific-fiscal-requirements)
5. [Audit Trail & Compliance](#5-audit-trail--compliance)
6. [Reporting & Disclosures](#6-reporting--disclosures)
7. [Localization](#7-localization)
8. [Priority Matrix](#8-priority-matrix)

---

## 1. Core Accounting Integrity

### 1.1 Double-Entry Ledger — UNSATISFACTORY ❌

| Issue | Detail | Impact |
|-------|--------|--------|
| No debit/credit balance enforcement | `JournalEntryLine` has no constraint ensuring `SUM(debits) = SUM(credits)` per journal entry | Corrupted trial balance, P&L, balance sheet. A single unbalanced entry invalidates every downstream report |
| No automatic reversing entries | No mechanism for accrual reversals (e.g., period-end accruals, prepaid expense amortization) | Manual journal entries required every month-end |
| No fiscal year locking | No mechanism to prevent posting to closed periods | Users can post entries to prior fiscal years, corrupting filed returns |

#### Current Implementation

File: `apps/web/prisma/schema.prisma` — JournalEntryLine model

```prisma
model JournalEntryLine {
  id              String   @id @default(cuid())
  debit           Float    @default(0)
  credit          Float    @default(0)
  journalEntryId  String
  accountId       String
  // No constraint: SUM(debits) == SUM(credits)
}
```

#### Remedy

1. **Add Prisma middleware** to validate balanced entries before insert/update:

```typescript
// lib/prisma-middleware.ts
prisma.$use(async (params, next) => {
  if (params.model === 'JournalEntryLine' && params.action === 'createMany') {
    const lines = params.args.data;
    const totalDebit = lines.reduce((s: number, l: any) => s + (l.debit || 0), 0);
    const totalCredit = lines.reduce((s: number, l: any) => s + (l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new Error('Journal entry must be balanced: SUM(debits) must equal SUM(credits)');
    }
  }
  return next(params);
});
```

2. **Add fiscal year management:**

```prisma
model FiscalYear {
  id             String   @id @default(cuid())
  companyId      String
  label          String   // "FY 2026"
  startDate      DateTime
  endDate        DateTime
  isClosed       Boolean  @default(false)
  closedAt       DateTime?
  closedByUserId String?
}
```

3. **Add auto-reversal support to JournalEntry:**

```prisma
model JournalEntry {
  // ... existing fields ...
  reversalOfId   String?  // If set, this entry reverses another
  reversalDate   DateTime? // Date the reversal posts
  isReversal     Boolean  @default(false)
  fiscalYearId   String?
}
```

**Severity:** 🔴 Critical — fundamental accounting requirement.  
**Effort:** 2 days  
**Priority for:** Tunisia ✅ | International ✅

---

### 1.2 Chart of Accounts — CONDITIONALLY ACCEPTABLE ⚠️

| Issue | Detail | Example |
|-------|--------|---------|
| Account type inferred from number prefix | Hard-coded prefix mappings (`'6'` = expense, `'7'` = income) in report queries | Account `1011` (Capital non appelé) starts with `1` → miscategorized as asset (should be equity) |
| No IFRS account category | No `AccountClassification` enum on the model | Cannot distinguish operating vs. financing vs. investing for cash flow statements |
| No PCN versioning | Tunisian PCN (Plan Comptable Tunisien) 2025 differs from OHADA and French PCN | Multi-jurisdiction firms cannot maintain separate chart versions |

#### Current Report Logic (Hard-coded Prefixes)

File: `apps/web/app/(app)/[company-slug]/reports/actions.ts`

```typescript
const assetsAccounts = allAccounts.filter(a => 
  ['2', '3', '41', '5'].some(p => a.number.startsWith(p))
);
const incomeAccounts = allAccounts.filter(a => a.number.startsWith('7'));
const expenseAccounts = allAccounts.filter(a => a.number.startsWith('6'));
```

#### Chart of Accounts by Jurisdiction

| Country | Standard | Account Format |
|---------|----------|----------------|
| Tunisia | PCN Tunisien | 4 digits (e.g., `101`, `411`, `601`) |
| France | Plan Comptable Français (PCG) | 8 digits (e.g., `10100000`) |
| OHADA | SYSCOHADA | 6 digits (e.g., `101000`) |
| IFRS | No prescribed format | Flexible |

Hard-coded prefix logic fails for any account numbering system other than the one it was designed for.

#### Remedy

1. **Add AccountClassification enum:**

```prisma
enum AccountClassification {
  ASSET_NON_CURRENT
  ASSET_CURRENT
  LIABILITY_NON_CURRENT
  LIABILITY_CURRENT
  EQUITY
  INCOME_OPERATING
  INCOME_NON_OPERATING
  EXPENSE_OPERATING
  EXPENSE_NON_OPERATING
}

model Account {
  // ... existing fields ...
  classification AccountClassification?
  reportingCategory String?  // e.g., "CASH", "AR", "AP", "INVENTORY", "FIXED_ASSETS"
}
```

2. **Replace hard-coded prefix filters** with `classification` field lookups in report queries.

**Severity:** 🟡 Medium  
**Effort:** 3 days  
**Priority for:** Tunisia ✅ | International ✅

---

### 1.3 Fiscal Year Management — NOT IMPLEMENTED ❌

| Requirement | Status |
|-------------|--------|
| Fiscal year entity | ❌ Missing |
| Period-end closing process | ❌ Missing |
| Retained earnings transfer | ❌ Missing |
| Multi-year reporting | ⚠️ Partial (date-range reports work) |
| Locked period protection | ❌ Missing |

**Tunisia:** Fiscal year = calendar year (Jan 1 – Dec 31).  
**International:** UK (Apr 6 – Apr 5), US (any month), Japan (Apr 1 – Mar 31).

**Severity:** 🟡 Medium  
**Effort:** 2 days

---

## 2. Tunisian Tax Compliance (TVA & Déclarations)

### 2.1 TVA (Value-Added Tax) — UNSATISFACTORY ❌

#### TVA Rate Structure (Tunisia, 2025-2026)

| Rate | Type | Common Applications |
|------|------|-------------------|
| 19% | Standard | Most goods and services |
| 7% | Reduced | Food products, transport, pharmaceuticals, books |
| 13% | Super-reduced | Certain services (hotels, restaurants in tourist zones) |
| 0% | Zero-rated | Exports, international transport |

#### Current Implementation Issues

| Issue | Detail | Impact |
|-------|--------|--------|
| **Tax-inclusive pricing not handled** | Formula `taxAmount = (amount * rate) / 100` assumes tax-exclusive (HT) | B2C transactions in Tunisia are TTC (Toutes Taxes Comprises). Current logic **over-collects** tax on inclusive transactions |
| **No TVA rate history** | TaxRate has no `validFrom`/`validTo` | TVA rates change annually in the Loi de Finances. Historical invoices would show wrong rate |
| **No TVA declaration export** | No XML/CSV export compatible with Assujetti portal | Firms must manually re-enter data in the government portal — 10+ hours/month |
| **No FODEC tracking** | Fonds de Développement de la Compétitivité — 1% levy on certain imports | Missing from tax computation entirely |
| **No Droit de Timbre** | Stamp duty on invoices > 10,000 TND (varies by year) | Not calculated or tracked |
| **No multi-rate invoice support** | Single `taxId` per invoice | Tunisian invoices often have lines at different TVA rates |
| **No CA3 declaration structure** | Monthly TVA return has specific line items (TVA collectée, TVA déductible, crédit de TVA) | Cannot generate the monthly déclaration |

#### Tax Computation Formulas

**Current (tax-exclusive only):**
```
HT = amount
TVA = HT × (rate / 100)
TTC = HT + TVA
```

**Required (add tax-inclusive support):**
```
// Tax-exclusive (HT → TTC)
TVA = HT × (rate / 100)
TTC = HT + TVA

// Tax-inclusive (TTC → HT)
HT = TTC / (1 + rate / 100)
TVA = TTC - HT
```

#### Required Declarations

| Declaration | Frequency | Required For | Current Status |
|-------------|-----------|-------------|----------------|
| CA3 (Déclaration Mensuelle de TVA) | Monthly | All taxable persons > 100K TND turnover | ❌ Missing |
| CA1 (Déclaration Annuelle) | Annual | All taxable persons | ❌ Missing |
| DMF (Déclaration Mensuelle des Factures) | Monthly | Firms > 500K TND turnover | ❌ Missing |
| Relevé Détaillé des Achats | Annual | All taxable persons | ❌ Missing |

#### CA3 Declaration Structure

```
Line 01: TVA collectée sur ventes (19%)
Line 02: TVA collectée sur ventes (13%)
Line 03: TVA collectée sur ventes (7%)
Line 04: TVA collectée sur prestations de services (19%)
Line 05: TVA collectée sur prestations de services (13%)
Line 06: TVA collectée sur prestations de services (7%)
Line 07: TVA déductible sur achats
Line 08: TVA déductible sur immobilisations
Line 09: Crédit de TVA (report)
Line 10: TVA due = (01+02+03+04+05+06) - (07+08+09)
```

#### Remedy

1. **Add tax rate validity periods:**

```prisma
model TaxRate {
  // ... existing fields ...
  validFrom      DateTime  @default(now())
  validTo        DateTime? // null = currently active
  isTaxInclusive Boolean   @default(false)
}
```

2. **Add FODEC and Droit de Timbre to tax computation:**

```typescript
export function computeTaxLine(amount: number, rate: number, isInclusive: boolean) {
  if (isInclusive) {
    const ht = amount / (1 + rate / 100);
    const tva = amount - ht;
    return { ht, tva, ttc: amount };
  }
  const tva = amount * (rate / 100);
  return { ht: amount, tva, ttc: amount + tva };
}
```

3. **Add multi-rate support to Invoice line items:**

```prisma
model InvoiceItem {
  // ... existing fields ...
  taxRateId    String?
  taxAmount    Float     @default(0)
  isTaxInclusive Boolean @default(false)
  fodecAmount  Float?    // 1% FODEC if applicable
  timbreAmount Float?    // Droit de timbre if applicable
}
```

4. **Add TVA declaration export** — generate XML compatible with the Assujetti portal schema.

**Severity:** 🔴 Critical — material misstatement risk on tax returns.  
**Effort:** 5 days  
**Priority for:** Tunisia ✅ | International — depends on jurisdiction

---

### 2.2 Tax Registration Number (Matricule Fiscal) — CONDITIONALLY ACCEPTABLE ⚠️

**Current state:** `Company.taxId` is a free-form string. No format validation.

**Tunisia Matricule Fiscal format:**
```
NNNNNNN X/X/X/XXX/XX
1234567  X/A/M/000/00
│││││││  │ │ │ │││ │
│││││││  │ │ │ │││ └── Control key (2 digits)
│││││││  │ │ │ │└──── Establishment number (3 digits, 000 = siège)
│││││││  │ │ │ └────── Category code (e.g., "M" = Personne Morale)
│││││││  │ │ └──────── VAT code (e.g., "A" = Assujetti)
│││││││  │ └─────────── Tax center code (1 letter)
│││││││  └───────────── Tax type code (1 letter/number)
││││││└──────────────── Control key (2 digits)
│││││└───────────────── Sequential number (7 digits)
└┴┴┴┴┴────────────────── Establishment number (7 digits, usually = sequentiel)
```

**Remedy:** Add format validation and separate fields.

```prisma
model Company {
  // ... existing fields ...
  matriculeFiscal      String?  @unique // Full: 1234567X/A/M/000/00
  matriculeSequential  String?  // 1234567
  matriculeControlKey  String?  // 00
  matriculeCategory    String?  // M
  matriculeVatCode     String?  // A
  matriculeTaxCenter   String?  // X
}
```

**Severity:** 🟡 Medium  
**Effort:** 1 day

---

## 3. Multi-Currency & International Operations

### 3.1 Currency Conversion — CONDITIONALLY ACCEPTABLE ⚠️

| Component | Status | Notes |
|-----------|--------|-------|
| Daily rate fetch (ECB) | ✅ Implemented | Frankfurter API, free, 33 currencies |
| Triangulation via USD | ✅ Implemented | Correct cross-rate math |
| Historical rate storage | ✅ Implemented | `DailyExchangeRate` per date |
| **Rate stored on transaction** | ❌ **Missing** | Applied rate **not persisted** on Invoice, Bill, Payment |

#### The Problem

```typescript
// Current: FK to a rate that can change
model Invoice {
  exchangeRateId String? // FK to manual ExchangeRate
  // But the actual daily rate used is NOT stored!
}
```

If a daily exchange rate is used to create an invoice, and the `DailyExchangeRate` table is later updated or pruned, the original applied rate is **lost forever**.

#### IAS 21 Requirements (The Effects of Changes in Foreign Exchange Rates)

| Requirement | Implementation |
|-------------|---------------|
| Record at spot rate on transaction date | ❌ Not enforced |
| Retranslate monetary items at closing rate | ❌ No period-end revaluation |
| Recognize FX differences in P&L | ❌ No FX gain/loss calculation |
| Disclose exchange rates used | ❌ Not supported |

#### Remedy

1. **Store applied rate on every financial transaction:**

```prisma
model Invoice {
  // ... existing fields ...
  appliedRate       Float    @default(1)
  rateSource        String   @default("MANUAL") // MANUAL | DAILY | ECB
  originalCurrency  String   // Currency of the transaction
  functionalAmount  Float?   // Amount in company's functional currency
}
```

2. **Implement FX gain/loss calculation:**

```typescript
export async function calculateFxGainLoss(
  companyId: string,
  fromDate: Date,
  toDate: Date
): Promise<FxGainLossReport> {
  // 1. Get all monetary items (AR, AP, Cash in foreign currency)
  // 2. Get exchange rates at fromDate and toDate
  // 3. Calculate unrealized gain/loss
  // 4. Generate journal entry for period-end adjustment
}
```

3. **Add period-end revaluation process:**

```typescript
export async function revalueMonetaryItems(companyId: string, asOfDate: Date) {
  // For each foreign-currency invoice/bill/cash account:
  //   revaluedAmount = originalAmount * (currentRate / originalRate)
  //   fxGainLoss = revaluedAmount - functionalAmount
  // Post adjustment journal entry
}
```

**Severity:** 🔴 High — audit trail incomplete.  
**Effort:** 5 days (rate storage: 1 day, FX calc: 2 days, revaluation: 2 days)  
**Priority for:** Tunisia ✅ (exporters) | International ✅

---

### 3.2 Multi-Currency Accounting — NOT IMPLEMENTED ❌

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-currency bank accounts | ❌ Missing | All accounts assumed single-currency |
| Cross-currency payments | ❌ Missing | Paying EUR invoice from USD bank account requires intermediary |
| Realized FX gain/loss | ❌ Missing | When payment settles at different rate than invoice |
| Unrealized FX gain/loss | ❌ Missing | Period-end revaluation of outstanding AR/AP |
| Currency triangulation for payments | ❌ Missing | EUR→USD→TND routing |

#### Tunisia-Specific Multi-Currency Rules

| Regulation | Detail |
|------------|--------|
| BCT foreign currency repatriation | Exporters must repatriate 80% of F/X earnings within 30 days |
| Foreign currency accounts | Require BCT approval |
| Transfer pricing documentation | Required for related-party cross-border transactions > 7.5M TND |
| Currency controls | TND is not freely convertible — restrictions apply |

#### Remedy

1. Add `foreignCurrency` and `functionalCurrency` to Company
2. Add FX gain/loss accounts to default chart of accounts (e.g., `676` — Pertes de change, `776` — Gains de change)
3. Implement cross-currency payment routing engine
4. Add transfer pricing note fields to cross-border invoices

**Severity:** 🔴 High  
**Effort:** 4 days  
**Priority for:** Tunisia ✅ (exporters) | International ✅

---

## 4. Tunisia-Specific Fiscal Requirements

### 4.1 Invoice Legal Compliance — UNSATISFACTORY ❌

#### Tunisian Invoice Requirements (Code de la TVA, Articles 28-32)

| Legal Requirement | LucaP Status | Details |
|------------------|-------------|---------|
| Sequential numbering by fiscal year | ❌ Missing | `Date.now()`-based numbering does not guarantee sequential |
| Matricule Fiscal of issuer | ⚠️ Partial | Stored on Company but not printed on invoice template |
| Matricule Fiscal of customer (B2B) | ❌ Missing | Not stored on Customer model |
| Legal form + share capital | ⚠️ Partial | `Company.companyType` exists but not on invoice |
| TVA breakdown by rate | ⚠️ Partial | Single tax rate per invoice, multi-rate not supported |
| Invoice date | ✅ Present | `createdAt` / `issueDate` |
| Delivery date | ❌ Missing | No `deliveryDate` on Invoice |
| Clear "TTC" or "HT" indication | ❌ Missing | No tax mode label on invoice |
| Droit de Timbre (if applicable) | ❌ Missing | Not calculated |
| Currency of transaction | ⚠️ Partial | `currency` field exists but no enforcement |
| Archival (10 years) | ❌ Missing | No export/archive mechanism for tax inspection |

#### Invoice Numbering by Fiscal Year

Tunisian law requires **sequential numbering restarting each fiscal year**:
- FY 2025: `INV-2025-00001`, `INV-2025-00002`, ...
- FY 2026: `INV-2026-00001`, `INV-2026-00002`, ...

Current implementation uses `IN-${Date.now()}-${random}` which is non-sequential and non-compliant.

**Remedy:**

```prisma
model Invoice {
  // ... existing fields ...
  fiscalYear    Int      // 2025, 2026
  sequenceNum   Int?     // 1, 2, 3... per fiscal year
}

// Auto-increment sequence per company per fiscal year
// Use a database sequence or Prisma transaction with retry:
export async function getNextInvoiceNumber(companyId: string, fiscalYear: number) {
  const max = await prisma.invoice.findFirst({
    where: { companyId, fiscalYear },
    orderBy: { sequenceNum: 'desc' },
    select: { sequenceNum: true }
  });
  const next = (max?.sequenceNum || 0) + 1;
  return {
    number: `INV-${fiscalYear}-${String(next).padStart(5, '0')}`,
    sequenceNum: next
  };
}
```

#### Invoice PDF Template Requirements

The existing `generatePdf.ts` (handlebars-based PDF generator) must be extended to include:

```handlebars
<!-- Mandatory Tunisia fields -->
<div class="issuer-matricule">Matricule Fiscal: {{company.matriculeFiscal}}</div>
<div class="issuer-legal-form">Forme Juridique: {{company.companyType}}</div>
<div class="issuer-capital">Capital: {{company.capital}} TND</div>
<div class="customer-matricule">Matricule Client: {{customer.matriculeFiscal}}</div>
<div class="tax-mode">Régime: {{#if isTaxInclusive}}TTC{{else}}HT{{/if}}</div>
<div class="invoice-sequence">Facture N°: {{invoiceNumber}}</div>
<div class="delivery-date">Date de Livraison: {{deliveryDate}}</div>
```

**Severity:** 🔴 Critical — invoices may not be legally compliant in Tunisia.  
**Effort:** 3 days  
**Priority for:** Tunisia ✅ | International — varies by jurisdiction

---

### 4.2 Withholding Tax (Retenue à la Source) — NOT IMPLEMENTED ❌

Tunisia requires withholding tax on certain payments:

| Transaction | Rate | Threshold |
|-------------|------|-----------|
| Dividends | 10% | None |
| Interest | 20% | None |
| Royalties | 15% | None |
| Professional services (honoraires) | 3% | > 1,000 TND per invoice |
| Rent (immovable) | 10% | None |
| International payments | 15-25% | Varies by treaty |

**No withholding tax calculation exists in LucaP.**

**Severity:** 🟡 Medium — affects dividend, interest, and royalty payors.  
**Effort:** 3 days

---

## 5. Audit Trail & Compliance

### 5.1 Immutable Audit Trail — NOT IMPLEMENTED ❌

| Requirement | Status | Reference |
|-------------|--------|-----------|
| Who created/modified each transaction | ❌ No `createdBy`, `modifiedBy` on most financial models | Article 10, Tunisian Accounting Law (Loi 96-112) |
| Optimistic concurrency (SyncToken) | ❌ Not implemented on any model | QBO standard pattern |
| Before/after values on modification | ❌ No change logging | Audit standard requirement |
| Soft delete on Payment | ❌ Missing `isActive` field | Payment can be hard-deleted |
| Immutable journal entries | ❌ Entries can be modified after posting | Accounting 101 |

#### QBO SyncToken Pattern

QBO uses a `SyncToken` integer that increments on every change. Before updating, the client must provide the current `SyncToken`. If another process has modified the record, the token won't match and the update is rejected (optimistic concurrency).

```typescript
// Required pattern for all financial models:
model Invoice {
  syncToken Int @default(0) // Incremented on every update
}

// Update must include current token:
await prisma.invoice.update({
  where: { id: invoiceId, syncToken: currentToken },
  data: { amount: newAmount, syncToken: { increment: 1 } }
});
// Fails if another process updated it first (P2025: RecordNotFound)
```

#### Remedy

1. **Add `syncToken` (Int, default 0) and `createdBy`/`updatedBy` (String?) to:**
   - Invoice, Bill, Payment, JournalEntry, Estimate
   - CreditMemo, SalesReceipt, RefundReceipt
   - DelayedCharge, DelayedCredit

2. **Add `ChangeLog` model:**

```prisma
model ChangeLog {
  id          String   @id @default(cuid())
  entityType  String   // "Invoice", "Payment", etc.
  entityId    String
  action      String   // "CREATE" | "UPDATE" | "DELETE" | "SOFT_DELETE"
  fieldName   String?
  oldValue    String?
  newValue    String?
  userId      String?
  timestamp   DateTime @default(now())
  companyId   String

  @@index([entityType, entityId])
  @@index([companyId, timestamp])
}
```

3. **Add `Payment.isActive` and `Payment.deactivatedAt`:**

```prisma
model Payment {
  // ... existing fields ...
  isActive            Boolean    @default(true)
  deactivatedAt       DateTime?
  deactivatedByUserId String?
}
```

**Severity:** 🔴 Critical — regulatory non-compliance risk.  
**Effort:** 5 days  
**Priority for:** Tunisia ✅ | International ✅

---

### 5.2 Revenue Recognition (IFRS 15 / ASC 606) — NOT IMPLEMENTED ❌

IFRS 15 requires revenue recognition when control transfers to the customer. Current implementation recognizes revenue at invoice date — incorrect for:

| Scenario | Current Behavior | Required Behavior |
|----------|-----------------|-------------------|
| Annual subscription billed upfront | Full revenue in month 1 | Deferred over 12 months |
| Construction milestone billing | Revenue at each invoice | Percentage-of-completion method |
| Retainage (holdback) | Full revenue | Defer retainage until acceptance |
| Agent vs. principal | Net revenue | Gross vs. net depends on control |

**Remedy:** Add `DeferredRevenue` and `RevenueRecognitionSchedule` models.

```prisma
model DeferredRevenue {
  id             String   @id @default(cuid())
  invoiceId      String
  totalAmount    Float
  recognizedAmount Float  @default(0)
  startDate      DateTime
  endDate        DateTime
  recognitionMethod String // "STRAIGHT_LINE" | "PERCENTAGE" | "MILESTONE"
  status         String   @default("ACTIVE") // ACTIVE | FULLY_RECOGNIZED
}
```

**Severity:** 🟡 Medium — material for SaaS, construction, and service firms.  
**Effort:** 5 days

---

## 6. Reporting & Disclosures

### 6.1 Missing Statutory Reports — Tunisia ❌

| Report | Purpose | Regulation | Status |
|--------|---------|-----------|--------|
| **Bilan** (Balance Sheet) | Annual statutory filing | Tunisian Accounting Law | ✅ Built |
| **État de Résultat** (P&L) | Annual statutory filing | Tunisian Accounting Law | ✅ Built |
| **FEC** (Fichier des Écritures Comptables) | Digital audit file for tax inspection | Code des Impôts Directs, Art. 54 | ❌ **Missing** |
| **Balance auxiliaire clients/fournisseurs** | Sub-ledger aging | Audit standard | ⚠️ Partial (AR exists) |
| **Livre Journal** (General Ledger) | Chronological entries | Tunisian Accounting Law | ✅ Built |
| **Grand Livre** (Per-account GL) | Account-level detail | Tunisian Accounting Law | ❌ Missing |
| **Déclaration TVA (CA3)** | Monthly TVA return | Code de la TVA | ❌ **Missing** |
| **DMF** (Monthly invoice listing) | Large firms | Code de la TVA | ❌ **Missing** |

#### FEC (Fichier des Écritures Comptables) Format

The FEC is an XML file with a specific schema required by the Tunisian tax authority (Direction Générale des Impôts). Required fields:

| Field | Description | LucaP Source |
|-------|-------------|-------------|
| `JournalCode` | Journal code | `JournalEntry.transactionType` |
| `JournalLib` | Journal label | Map transactionType to label |
| `EcritureNum` | Entry number | `JournalEntry.journalNo` |
| `EcritureDate` | Entry date | `JournalEntry.date` |
| `PieceRef` | Source document reference | `Invoice.number`, `Bill.number` |
| `PieceDate` | Source document date | `Invoice.createdAt` |
| `CompteNum` | Account number | `Account.number` |
| `CompteLib` | Account label | `Account.title` |
| `Debit` | Debit amount | `JournalEntryLine.debit` |
| `Credit` | Credit amount | `JournalEntryLine.credit` |
| `EcritureLet` | Reconciliation mark | Not implemented |
| `DateLet` | Reconciliation date | Not implemented |
| `ValidDate` | Validation date | `JournalEntry.createdAt` |
| `MontantDevise` | Foreign currency amount | Not stored on line |
| `Idevise` | Currency code | Not stored on line |

**Severity:** 🔴 Critical — statutory filing non-compliance.  
**Effort:** 3 days  
**Priority for:** Tunisia ✅ | International — varies

---

### 6.2 Transfer Pricing (OECD BEPS Action 13) — NOT IMPLEMENTED ❌

Firms with cross-border related-party transactions > 7.5M TND must maintain:

| Document | Content | LucaP Status |
|----------|---------|-------------|
| Master File | Global business overview, value chain, intangibles | ❌ Missing |
| Local File | Local entity transactions, functional analysis | ❌ Missing |
| CbCR (Country-by-Country Report) | Revenue, P&L, taxes paid by jurisdiction | ❌ Missing |
| TP Documentation | Benchmarking, transfer pricing method | ❌ Missing |

**Tunisia:** Required for firms with related-party international transactions exceeding 7.5M TND (2025 threshold).

**Remedy:** Add transfer pricing data fields to cross-border transactions.

```prisma
model Invoice {
  // ... existing fields ...
  isRelatedParty   Boolean  @default(false)
  tpMethod         String?  // "CUP" | "COST_PLUS" | "RESALE" | "TNMM" | "PSM"
  tpDocumentationRef String? // Reference to TP study
  beneficiaryCountry String? // ISO country code
}
```

**Severity:** 🟡 Medium  
**Effort:** 2 days

---

## 7. Localization

### 7.1 Multi-Locale Support — CONDITIONALLY ACCEPTABLE ⚠️

| Feature | Status | Notes |
|---------|--------|-------|
| i18n framework (next-intl) | ✅ Implemented | EN/FR available |
| Date format per locale | ❌ Uses `toLocaleDateString()` without explicit locale | Server renders in en-US |
| Arabic (ar-TN) support | ❌ Missing | Co-official language of Tunisia |
| Currency decimal places | ❌ Hard-coded `toFixed(2)` | TND uses 3 decimals, JPY uses 0, KWD uses 3 |
| Number format per locale | ⚠️ Partial | `Intl.NumberFormat` used in reports |
| RTL layout support | ❌ Missing | Arabic requires RTL UI |
| Hijri calendar | ❌ Missing | Used by some Tunisian firms |

#### Currency Decimal Places by Jurisdiction

| Currency | Code | Decimal Places |
|----------|------|---------------|
| Tunisian Dinar | TND | 3 |
| US Dollar | USD | 2 |
| Euro | EUR | 2 |
| Japanese Yen | JPY | 0 |
| Kuwaiti Dinar | KWD | 3 |
| Bahraini Dinar | BHD | 3 |

**Remedy:**

```typescript
export function formatAmount(amount: number, currency: string): string {
  const decimals = { TND: 3, USD: 2, EUR: 2, JPY: 0, KWD: 3, BHD: 3 };
  return amount.toFixed(decimals[currency] || 2);
}
```

**Severity:** 🟡 Medium  
**Effort:** 2 days  
**Priority for:** Tunisia ✅ (Arabic/TND) | International ✅ (per-currency decimals)

---

## 8. Priority Matrix

### Risk × Effort Quadrant

```
                    HIGH EFFORT (3-5 days)          LOW EFFORT (1-2 days)
                    ───────────────────────         ─────────────────────
HIGH RISK    │   • Audit trail / immutable ledger   • Double-entry enforcement
(🔴)        │   • TVA declaration export           • Store applied rate on transactions
            │   • FEC export (digital audit)        • Invoice legal compliance
            │   • FX gain/loss + revaluation        • Tax inclusive computation
            │
MEDIUM RISK │   • Multi-GAAP chart of accounts     • Matricule Fiscal validation
(🟡)        │   • Revenue recognition (IFRS 15)     • CbCR / transfer pricing
            │   • Withholding tax                   • Arabic locale + RTL
            │   • Fiscal year management            • Currency decimal config
```

### Recommended Sprint Plan

**Sprint 1 (5 days) — Critical Compliance**
1. Double-entry enforcement (Prisma middleware) — 1 day
2. Store applied rate + tax-inclusive computation — 1 day
3. Invoice legal compliance (Tunisia fields + PDF) — 3 days

**Sprint 2 (5 days) — Tax & Audit**
4. TVA declaration export (CA3 + DMF) — 3 days
5. Auditable journal entries (syncToken, changeLog, createdBy) — 2 days

**Sprint 3 (5 days) — Multi-Currency & Reporting**
6. FX gain/loss + period-end revaluation — 3 days
7. FEC export — 2 days

**Sprint 4 (5 days) — International Features**
8. Multi-GAAP chart of accounts — 3 days
9. Revenue recognition (IFRS 15) — 2 days

---

## Appendix: QBO Compliance Audit — Field Expertise Review

57 QBO constraints audited across 8 transaction entities. Summary below. Full detail in the QBO compliance section above.

### Compliance by Entity

| Entity | Constraints Audited | ✅ Implemented | ◐ Partial | ❌ Missing (High) | ❌ Missing (Med) |
|--------|-------------------|---------------|-----------|------------------|------------------|
| Invoice | 16 | 9 | 2 | 0 | 3 |
| JournalEntry | 5 | 2 | 0 | 2 | 0 |
| Bill | 5 | 4 | 1 | 0 | 1 |
| Payment | 7 | 3 | 0 | 0 | 3 |
| CreditMemo | 6 | 4 | 1 | 0 | 1 |
| Deposit | 5 | 0 | 0 | 4 | 1 |
| Transfer | 3 | 2 | 0 | 0 | 1 |
| Estimate | 7 | 6 | 1 | 0 | 0 |
| **Total** | **57** | **30** | **5** | **6** | **10** |

### Critical Gaps (Must Fix)

| # | Finding | Entity | QBO Rule | Risk |
|---|---------|--------|----------|------|
| 1 | AR/AP sub-ledger entity required | JournalEntry | AR lines must have Customer ref, AP lines must have Vendor ref | 🔴 AR/AP aging reports will show incorrect balances |
| 2 | Deposit line items missing | Deposit | Requires ≥1 line with DepositLineDetail.AccountRef and LinkedTxn | 🔴 Cannot clear Undeposited Funds; deposit is a flat amount with no audit trail |
| 3 | Payment doesn't use Undeposited Funds | Payment | Payments should deposit to Undeposited Funds; Deposit clears them to bank | 🔴 Breaks bank reconciliation workflow |
| 4 | Void operations use soft-delete | Invoice, Payment | QBO void preserves record, zeroes amounts, appends "Voided" to notes | 🟡 Soft-delete loses audit trail |
| 5 | Account type validation missing | Transfer | Both accounts must have Asset classification | 🟡 Could post transfers to Liability/Equity accounts |
| 6 | DepositToAccountRef type validation | Deposit, Payment | Must be Other Current Asset or Bank | 🟡 Could post deposits to wrong account type |

### Recommended Fix Priority

1. **Immediate (Week 1):** Add AR/AP entity validation to JournalEntry (prevents sub-ledger corruption)
2. **Immediate (Week 1):** Add line items + DepositToAccountRef to Deposit model (enables Undeposited Funds workflow)
3. **Short-term (Week 2):** Add Undeposited Funds routing for Payments (aligns with QBO cash flow)
4. **Short-term (Week 2):** Replace soft-delete with void operations on Invoice and Payment
5. **Medium-term (Week 3):** Add account type validation to Transfer, Deposit, Payment
6. **Ongoing:** Expand QBO constraint test coverage in compliance.spec.ts

---

## Appendix: Key Regulatory References

| Regulation | Jurisdiction | Relevance |
|------------|-------------|-----------|
| Code de la TVA (Articles 28-32) | Tunisia | Invoice legal requirements |
| Loi 96-112 (Système Comptable Tunisien) | Tunisia | Accounting law |
| Loi de Finances (annual) | Tunisia | TVA rate changes, tax thresholds |
| IFRS 15 / ASC 606 | International | Revenue recognition |
| IAS 21 | International | Foreign currency effects |
| OECD BEPS Action 13 | International | CbCR / transfer pricing |
| Code des Impôts Directs, Art. 54 | Tunisia | FEC requirement |
| BCT Circulars | Tunisia | Foreign currency regulations |
| Règlement ANC 2018-07 | France (influences Tunisia) | Chart of accounts structure |

---

## Conclusion

**LucaP is technically impressive but not yet compliant for a regulated accounting firm.** The gap between "QBO API parity" and "production-ready for Tunisia + 200 countries" is approximately 30 days of development focused on the critical compliance items identified above.

The most pressing issues are:
1. **Tunisia tax compliance** — Cannot produce legally valid invoices or TVA returns
2. **Audit trail** — Financial records can be modified without trace
3. **Multi-currency** — FX gain/loss and rate tracking incomplete

Once these are addressed, LucaP would be well-positioned as a QBO alternative for Tunisian and international firms.

---

*Audit conducted July 2026. Recommendations are advisory and do not constitute legal advice. Firms should consult their tax advisor for jurisdiction-specific requirements.*
