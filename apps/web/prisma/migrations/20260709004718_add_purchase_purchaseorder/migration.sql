-- CreateEnum
CREATE TYPE "PurchasePaymentType" AS ENUM ('CASH', 'CHECK', 'CREDIT_CARD', 'DEBIT_CARD');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('OPEN', 'CLOSED', 'VOID');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('OPEN', 'CLOSED', 'VOID');

-- CreateEnum
CREATE TYPE "GlobalTaxCalculationEnum" AS ENUM ('TaxExcluded', 'TaxInclusive', 'NotApplicable');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "purchaseId" TEXT,
ADD COLUMN     "purchaseOrderId" TEXT;

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentType" "PurchasePaymentType" NOT NULL DEFAULT 'CHECK',
    "accountRefId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod",
    "txnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "privateNote" VARCHAR(4000),
    "globalTaxCalculation" "GlobalTaxCalculationEnum" NOT NULL DEFAULT 'NotApplicable',
    "notes" VARCHAR(2000),
    "status" "PurchaseStatus" NOT NULL DEFAULT 'OPEN',
    "credit" BOOLEAN NOT NULL DEFAULT false,
    "classId" TEXT,
    "departmentId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseLineItem" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
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

    CONSTRAINT "PurchaseLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3),
    "txnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'OPEN',
    "memo" VARCHAR(2000),
    "poEmail" TEXT,
    "apAccountRefId" TEXT,
    "classId" TEXT,
    "departmentId" TEXT,
    "termId" TEXT,
    "globalTaxCalculation" "GlobalTaxCalculationEnum" NOT NULL DEFAULT 'NotApplicable',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderLineItem" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
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

    CONSTRAINT "PurchaseOrderLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Purchase_vendorId_idx" ON "Purchase"("vendorId");

-- CreateIndex
CREATE INDEX "Purchase_status_idx" ON "Purchase"("status");

-- CreateIndex
CREATE INDEX "Purchase_txnDate_idx" ON "Purchase"("txnDate");

-- CreateIndex
CREATE INDEX "Purchase_companyId_idx" ON "Purchase"("companyId");

-- CreateIndex
CREATE INDEX "Purchase_classId_idx" ON "Purchase"("classId");

-- CreateIndex
CREATE INDEX "Purchase_departmentId_idx" ON "Purchase"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_number_companyId_key" ON "Purchase"("number", "companyId");

-- CreateIndex
CREATE INDEX "PurchaseLineItem_purchaseId_idx" ON "PurchaseLineItem"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseLineItem_accountId_idx" ON "PurchaseLineItem"("accountId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_vendorId_idx" ON "PurchaseOrder"("vendorId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_status_idx" ON "PurchaseOrder"("status");

-- CreateIndex
CREATE INDEX "PurchaseOrder_txnDate_idx" ON "PurchaseOrder"("txnDate");

-- CreateIndex
CREATE INDEX "PurchaseOrder_companyId_idx" ON "PurchaseOrder"("companyId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_classId_idx" ON "PurchaseOrder"("classId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_departmentId_idx" ON "PurchaseOrder"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_number_companyId_key" ON "PurchaseOrder"("number", "companyId");

-- CreateIndex
CREATE INDEX "PurchaseOrderLineItem_purchaseOrderId_idx" ON "PurchaseOrderLineItem"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "PurchaseOrderLineItem_accountId_idx" ON "PurchaseOrderLineItem"("accountId");

-- CreateIndex
CREATE INDEX "Transaction_purchaseId_idx" ON "Transaction"("purchaseId");

-- CreateIndex
CREATE INDEX "Transaction_purchaseOrderId_idx" ON "Transaction"("purchaseOrderId");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_accountRefId_fkey" FOREIGN KEY ("accountRefId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLineItem" ADD CONSTRAINT "PurchaseLineItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLineItem" ADD CONSTRAINT "PurchaseLineItem_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLineItem" ADD CONSTRAINT "PurchaseLineItem_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_apAccountRefId_fkey" FOREIGN KEY ("apAccountRefId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLineItem" ADD CONSTRAINT "PurchaseOrderLineItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLineItem" ADD CONSTRAINT "PurchaseOrderLineItem_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLineItem" ADD CONSTRAINT "PurchaseOrderLineItem_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
