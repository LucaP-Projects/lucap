/*
  Warnings:

  - You are about to drop the `CustomField` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomFieldForm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomFieldValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CustomFieldForm` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CompanyCustomFieldType" AS ENUM ('TEXT_AND_NUMBER', 'NUMBER', 'DATE', 'DROPDOWN_LIST');

-- CreateEnum
CREATE TYPE "CompanyCustomFieldCategory" AS ENUM ('CUSTOMER', 'TRANSACTION', 'VENDOR', 'PROJECT');

-- CreateEnum
CREATE TYPE "CompanyCustomFieldFormType" AS ENUM ('SALES_RECEIPT', 'INVOICE', 'ESTIMATE', 'CREDIT_MEMO', 'REFUND_RECEIPT', 'PURCHASE_ORDER', 'EXPENSE', 'BILL', 'CHECK', 'VENDOR_CREDIT', 'CREDIT_CARD_CREDIT');

-- DropForeignKey
ALTER TABLE "CustomField" DROP CONSTRAINT "CustomField_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CustomFieldValue" DROP CONSTRAINT "CustomFieldValue_customFieldId_fkey";

-- DropForeignKey
ALTER TABLE "_CustomFieldForm" DROP CONSTRAINT "_CustomFieldForm_A_fkey";

-- DropForeignKey
ALTER TABLE "_CustomFieldForm" DROP CONSTRAINT "_CustomFieldForm_B_fkey";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "discountEnabled" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "CustomField";

-- DropTable
DROP TABLE "CustomFieldForm";

-- DropTable
DROP TABLE "CustomFieldValue";

-- DropTable
DROP TABLE "_CustomFieldForm";

-- DropEnum
DROP TYPE "CustomFieldCategory";

-- DropEnum
DROP TYPE "CustomFieldFormType";

-- DropEnum
DROP TYPE "CustomFieldType";

-- CreateTable
CREATE TABLE "CompanyCustomField" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CompanyCustomFieldType" NOT NULL,
    "category" "CompanyCustomFieldCategory" NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCustomFieldForm" (
    "id" TEXT NOT NULL,
    "name" "CompanyCustomFieldFormType" NOT NULL,
    "printOnForm" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompanyCustomFieldForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCustomFieldValue" (
    "id" TEXT NOT NULL,
    "customFieldId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyCustomFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompanyCustomFieldForm" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompanyCustomFieldForm_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "CompanyCustomField_category_idx" ON "CompanyCustomField"("category");

-- CreateIndex
CREATE INDEX "CompanyCustomField_active_idx" ON "CompanyCustomField"("active");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCustomField_name_category_companyId_key" ON "CompanyCustomField"("name", "category", "companyId");

-- CreateIndex
CREATE INDEX "CompanyCustomFieldValue_customFieldId_idx" ON "CompanyCustomFieldValue"("customFieldId");

-- CreateIndex
CREATE INDEX "CompanyCustomFieldValue_entityId_idx" ON "CompanyCustomFieldValue"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCustomFieldValue_customFieldId_entityId_key" ON "CompanyCustomFieldValue"("customFieldId", "entityId");

-- CreateIndex
CREATE INDEX "_CompanyCustomFieldForm_B_index" ON "_CompanyCustomFieldForm"("B");

-- AddForeignKey
ALTER TABLE "CompanyCustomField" ADD CONSTRAINT "CompanyCustomField_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCustomFieldValue" ADD CONSTRAINT "CompanyCustomFieldValue_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "CompanyCustomField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyCustomFieldForm" ADD CONSTRAINT "_CompanyCustomFieldForm_A_fkey" FOREIGN KEY ("A") REFERENCES "CompanyCustomField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyCustomFieldForm" ADD CONSTRAINT "_CompanyCustomFieldForm_B_fkey" FOREIGN KEY ("B") REFERENCES "CompanyCustomFieldForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
