-- CreateEnum
CREATE TYPE "VendorCreditStatus" AS ENUM ('OPEN', 'CLOSED', 'VOID', 'PARTIALLY_APPLIED');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "vendorCreditId" TEXT;

-- CreateTable
CREATE TABLE "VendorCredit" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "remainingCredit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" VARCHAR(2000),
    "notes" VARCHAR(2000),
    "status" "VendorCreditStatus" NOT NULL DEFAULT 'OPEN',
    "classId" TEXT,
    "departmentId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "VendorCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorCreditLineItem" (
    "id" TEXT NOT NULL,
    "vendorCreditId" TEXT NOT NULL,
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

    CONSTRAINT "VendorCreditLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "discountPercent" DOUBLE PRECISION,
    "discountDays" INTEGER,
    "dueDays" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorCredit_vendorId_idx" ON "VendorCredit"("vendorId");

-- CreateIndex
CREATE INDEX "VendorCredit_status_idx" ON "VendorCredit"("status");

-- CreateIndex
CREATE INDEX "VendorCredit_creditDate_idx" ON "VendorCredit"("creditDate");

-- CreateIndex
CREATE INDEX "VendorCredit_companyId_idx" ON "VendorCredit"("companyId");

-- CreateIndex
CREATE INDEX "VendorCredit_classId_idx" ON "VendorCredit"("classId");

-- CreateIndex
CREATE INDEX "VendorCredit_departmentId_idx" ON "VendorCredit"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorCredit_number_companyId_key" ON "VendorCredit"("number", "companyId");

-- CreateIndex
CREATE INDEX "VendorCreditLineItem_vendorCreditId_idx" ON "VendorCreditLineItem"("vendorCreditId");

-- CreateIndex
CREATE INDEX "Term_active_idx" ON "Term"("active");

-- CreateIndex
CREATE INDEX "Term_companyId_idx" ON "Term"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Term_name_companyId_key" ON "Term"("name", "companyId");

-- CreateIndex
CREATE INDEX "Transaction_vendorCreditId_idx" ON "Transaction"("vendorCreditId");

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCreditLineItem" ADD CONSTRAINT "VendorCreditLineItem_vendorCreditId_fkey" FOREIGN KEY ("vendorCreditId") REFERENCES "VendorCredit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCreditLineItem" ADD CONSTRAINT "VendorCreditLineItem_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_vendorCreditId_fkey" FOREIGN KEY ("vendorCreditId") REFERENCES "VendorCredit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
