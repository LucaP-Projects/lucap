-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('ANNUAL', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "RecurringFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_OVERDUE';
ALTER TYPE "NotificationType" ADD VALUE 'INVOICE_SENT';
ALTER TYPE "NotificationType" ADD VALUE 'INVOICE_VIEWED';
ALTER TYPE "NotificationType" ADD VALUE 'ESTIMATE_EXPIRING';
ALTER TYPE "NotificationType" ADD VALUE 'DOCUMENT_SHARED';
ALTER TYPE "NotificationType" ADD VALUE 'SYSTEM_ALERT';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_READY';

-- DropIndex
DROP INDEX "BudgetEntry_budgetId_accountId_key";

-- DropIndex
DROP INDEX "JournalEntry_journalNo_idx";

-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "appliedRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "rateSource" TEXT NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "budgetType" "BudgetType" NOT NULL DEFAULT 'ANNUAL';

-- AlterTable
ALTER TABLE "BudgetEntry" ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "accountingStandard" TEXT NOT NULL DEFAULT 'PCN_TUNISIE',
ADD COLUMN     "countryCode" TEXT NOT NULL DEFAULT 'TN';

-- AlterTable
ALTER TABLE "CompanyCurrency" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "Deposit" DROP COLUMN "cashBackAccountId",
ADD COLUMN     "depositToAccountId" TEXT;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "costRate" DOUBLE PRECISION,
ADD COLUMN     "primaryAddr" JSONB,
ADD COLUMN     "printOnCheckName" TEXT,
ADD COLUMN     "ssn" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "appliedRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "functionalAmount" DOUBLE PRECISION,
ADD COLUMN     "isTaxInclusive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalCurrency" TEXT,
ADD COLUMN     "rateSource" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "taxMode" TEXT NOT NULL DEFAULT 'EXCLUSIVE';

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "depositedAt" TIMESTAMP(3),
ADD COLUMN     "isUndeposited" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TaxCode" ADD COLUMN     "description" TEXT,
ADD COLUMN     "taxGroup" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TaxRate" ADD COLUMN     "taxClassification" TEXT;

-- AlterTable
ALTER TABLE "TimeActivity" ADD COLUMN     "costRate" DOUBLE PRECISION,
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "itemId" TEXT,
ADD COLUMN     "startTime" TIMESTAMP(3),
ADD COLUMN     "vendorId" TEXT;

-- CreateTable
CREATE TABLE "TaxPayment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "taxAgencyId" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobQueue" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositLineItem" (
    "id" TEXT NOT NULL,
    "depositId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "linkedPaymentId" TEXT,

    CONSTRAINT "DepositLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditCardPayment" (
    "id" TEXT NOT NULL,
    "txnDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "creditCardAccountId" TEXT NOT NULL,
    "vendorId" TEXT,
    "privateNote" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditCardPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAdjustment" (
    "id" TEXT NOT NULL,
    "docNumber" TEXT,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "adjustAccountId" TEXT,
    "privateNote" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringTransaction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "frequency" "RecurringFrequency" NOT NULL DEFAULT 'MONTHLY',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "nextDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "numberOfDays" INTEGER,
    "numberOfOccurrences" INTEGER,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeOrder" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReimburseCharge" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReimburseCharge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaxPayment_companyId_idx" ON "TaxPayment"("companyId");

-- CreateIndex
CREATE INDEX "TaxPayment_paymentDate_idx" ON "TaxPayment"("paymentDate");

-- CreateIndex
CREATE INDEX "JobQueue_status_priority_createdAt_idx" ON "JobQueue"("status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "JobQueue_type_idx" ON "JobQueue"("type");

-- CreateIndex
CREATE INDEX "JobQueue_companyId_idx" ON "JobQueue"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DepositLineItem_linkedPaymentId_key" ON "DepositLineItem"("linkedPaymentId");

-- CreateIndex
CREATE INDEX "DepositLineItem_depositId_idx" ON "DepositLineItem"("depositId");

-- CreateIndex
CREATE INDEX "CreditCardPayment_companyId_idx" ON "CreditCardPayment"("companyId");

-- CreateIndex
CREATE INDEX "CreditCardPayment_txnDate_idx" ON "CreditCardPayment"("txnDate");

-- CreateIndex
CREATE INDEX "InventoryAdjustment_companyId_idx" ON "InventoryAdjustment"("companyId");

-- CreateIndex
CREATE INDEX "InventoryAdjustment_itemId_idx" ON "InventoryAdjustment"("itemId");

-- CreateIndex
CREATE INDEX "InventoryAdjustment_date_idx" ON "InventoryAdjustment"("date");

-- CreateIndex
CREATE INDEX "RecurringTransaction_companyId_idx" ON "RecurringTransaction"("companyId");

-- CreateIndex
CREATE INDEX "RecurringTransaction_nextDate_idx" ON "RecurringTransaction"("nextDate");

-- CreateIndex
CREATE INDEX "ChangeOrder_companyId_idx" ON "ChangeOrder"("companyId");

-- CreateIndex
CREATE INDEX "ReimburseCharge_companyId_idx" ON "ReimburseCharge"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetEntry_budgetId_accountId_customerId_key" ON "BudgetEntry"("budgetId", "accountId", "customerId");

-- CreateIndex
CREATE INDEX "JournalEntry_vendorId_idx" ON "JournalEntry"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_journalNo_companyId_key" ON "JournalEntry"("journalNo", "companyId");

-- CreateIndex
CREATE INDEX "TimeActivity_vendorId_idx" ON "TimeActivity"("vendorId");

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxPayment" ADD CONSTRAINT "TaxPayment_taxAgencyId_fkey" FOREIGN KEY ("taxAgencyId") REFERENCES "TaxAgency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxPayment" ADD CONSTRAINT "TaxPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetEntry" ADD CONSTRAINT "BudgetEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeActivity" ADD CONSTRAINT "TimeActivity_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_depositToAccountId_fkey" FOREIGN KEY ("depositToAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositLineItem" ADD CONSTRAINT "DepositLineItem_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositLineItem" ADD CONSTRAINT "DepositLineItem_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositLineItem" ADD CONSTRAINT "DepositLineItem_linkedPaymentId_fkey" FOREIGN KEY ("linkedPaymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCardPayment" ADD CONSTRAINT "CreditCardPayment_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCardPayment" ADD CONSTRAINT "CreditCardPayment_creditCardAccountId_fkey" FOREIGN KEY ("creditCardAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCardPayment" ADD CONSTRAINT "CreditCardPayment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCardPayment" ADD CONSTRAINT "CreditCardPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_adjustAccountId_fkey" FOREIGN KEY ("adjustAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeOrder" ADD CONSTRAINT "ChangeOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReimburseCharge" ADD CONSTRAINT "ReimburseCharge_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReimburseCharge" ADD CONSTRAINT "ReimburseCharge_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

