-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TND',
ADD COLUMN     "exchangeRateId" TEXT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "baseCurrency" TEXT NOT NULL DEFAULT 'TND';

-- AlterTable
ALTER TABLE "CreditMemo" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TND',
ADD COLUMN     "exchangeRateId" TEXT;

-- AlterTable
ALTER TABLE "Estimate" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TND',
ADD COLUMN     "exchangeRateId" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TND',
ADD COLUMN     "exchangeRateId" TEXT;

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TND',
ADD COLUMN     "exchangeRateId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TND',
ADD COLUMN     "exchangeRateId" TEXT;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TND',
ADD COLUMN     "exchangeRateId" TEXT;

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TND',
ADD COLUMN     "exchangeRateId" TEXT;

-- AlterTable
ALTER TABLE "RefundReceipt" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TND',
ADD COLUMN     "exchangeRateId" TEXT;

-- AlterTable
ALTER TABLE "SalesReceipt" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TND',
ADD COLUMN     "exchangeRateId" TEXT;

-- AlterTable
ALTER TABLE "VendorCredit" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TND',
ADD COLUMN     "exchangeRateId" TEXT;

-- CreateTable
CREATE TABLE "CompanyCurrency" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyCurrency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "sourceCurrency" TEXT NOT NULL,
    "targetCurrency" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyCurrency_companyId_idx" ON "CompanyCurrency"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCurrency_companyId_currency_key" ON "CompanyCurrency"("companyId", "currency");

-- CreateIndex
CREATE INDEX "ExchangeRate_companyId_sourceCurrency_targetCurrency_asOfDa_idx" ON "ExchangeRate"("companyId", "sourceCurrency", "targetCurrency", "asOfDate");

-- CreateIndex
CREATE INDEX "ExchangeRate_companyId_idx" ON "ExchangeRate"("companyId");

-- CreateIndex
CREATE INDEX "VendorCreditLineItem_accountId_idx" ON "VendorCreditLineItem"("accountId");

-- CreateIndex
CREATE INDEX "VendorCreditLineItem_taxRateId_idx" ON "VendorCreditLineItem"("taxRateId");

-- AddForeignKey
ALTER TABLE "VendorCreditLineItem" ADD CONSTRAINT "VendorCreditLineItem_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCurrency" ADD CONSTRAINT "CompanyCurrency_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
