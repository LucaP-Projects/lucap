-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('DRAFT', 'OPEN', 'OVERDUE', 'PAID', 'PARTIALLY_PAID', 'VOID');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TableType" ADD VALUE 'BILL';
ALTER TYPE "TableType" ADD VALUE 'VENDOR';
ALTER TYPE "TableType" ADD VALUE 'BILL_PAYMENT';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "billId" TEXT,
ADD COLUMN     "billPaymentId" TEXT;

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "displayName" VARCHAR(500) NOT NULL,
    "companyName" VARCHAR(100),
    "primaryEmail" TEXT,
    "primaryPhone" VARCHAR(30),
    "website" VARCHAR(1000),
    "billingAddress" JSONB,
    "taxId" TEXT,
    "notes" VARCHAR(2000),
    "accountNumber" VARCHAR(100),
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "VendorStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "BillStatus" NOT NULL DEFAULT 'OPEN',
    "notes" VARCHAR(2000),
    "memo" VARCHAR(1000),
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillLineItem" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "description" VARCHAR(2000),
    "amount" DOUBLE PRECISION NOT NULL,
    "accountId" TEXT NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "taxRateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "BillLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillPayment" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "notes" VARCHAR(2000),
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "BillPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillPaymentAllocation" (
    "id" TEXT NOT NULL,
    "billPaymentId" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillPaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_formation_request" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "companyType" TEXT,
    "companyName" TEXT,
    "taxId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" JSONB,
    "taxRegime" TEXT,
    "vatRegime" TEXT,
    "capitalAmount" DOUBLE PRECISION,
    "numberOfShares" INTEGER,
    "shareholders" JSONB,
    "notes" TEXT,
    "userId" TEXT,
    "submitterName" TEXT,
    "submitterEmail" TEXT,
    "submitterPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_formation_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vendor_status_idx" ON "Vendor"("status");

-- CreateIndex
CREATE INDEX "Vendor_companyId_idx" ON "Vendor"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_displayName_companyId_key" ON "Vendor"("displayName", "companyId");

-- CreateIndex
CREATE INDEX "Bill_vendorId_idx" ON "Bill"("vendorId");

-- CreateIndex
CREATE INDEX "Bill_status_idx" ON "Bill"("status");

-- CreateIndex
CREATE INDEX "Bill_dueDate_idx" ON "Bill"("dueDate");

-- CreateIndex
CREATE INDEX "Bill_companyId_idx" ON "Bill"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_number_companyId_key" ON "Bill"("number", "companyId");

-- CreateIndex
CREATE INDEX "BillLineItem_billId_idx" ON "BillLineItem"("billId");

-- CreateIndex
CREATE INDEX "BillLineItem_accountId_idx" ON "BillLineItem"("accountId");

-- CreateIndex
CREATE INDEX "BillLineItem_taxRateId_idx" ON "BillLineItem"("taxRateId");

-- CreateIndex
CREATE INDEX "BillPayment_vendorId_idx" ON "BillPayment"("vendorId");

-- CreateIndex
CREATE INDEX "BillPayment_paymentDate_idx" ON "BillPayment"("paymentDate");

-- CreateIndex
CREATE INDEX "BillPayment_companyId_idx" ON "BillPayment"("companyId");

-- CreateIndex
CREATE INDEX "BillPaymentAllocation_billPaymentId_idx" ON "BillPaymentAllocation"("billPaymentId");

-- CreateIndex
CREATE INDEX "BillPaymentAllocation_billId_idx" ON "BillPaymentAllocation"("billId");

-- CreateIndex
CREATE UNIQUE INDEX "BillPaymentAllocation_billPaymentId_billId_key" ON "BillPaymentAllocation"("billPaymentId", "billId");

-- CreateIndex
CREATE INDEX "Transaction_billId_idx" ON "Transaction"("billId");

-- CreateIndex
CREATE INDEX "Transaction_billPaymentId_idx" ON "Transaction"("billPaymentId");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLineItem" ADD CONSTRAINT "BillLineItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLineItem" ADD CONSTRAINT "BillLineItem_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLineItem" ADD CONSTRAINT "BillLineItem_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPaymentAllocation" ADD CONSTRAINT "BillPaymentAllocation_billPaymentId_fkey" FOREIGN KEY ("billPaymentId") REFERENCES "BillPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPaymentAllocation" ADD CONSTRAINT "BillPaymentAllocation_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_billPaymentId_fkey" FOREIGN KEY ("billPaymentId") REFERENCES "BillPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_formation_request" ADD CONSTRAINT "company_formation_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
