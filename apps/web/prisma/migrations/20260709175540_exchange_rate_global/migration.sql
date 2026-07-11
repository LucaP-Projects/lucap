/*
  Warnings:

  - You are about to drop the column `companyId` on the `ExchangeRate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExchangeRate" DROP CONSTRAINT "ExchangeRate_companyId_fkey";

-- DropIndex
DROP INDEX "ExchangeRate_companyId_idx";

-- DropIndex
DROP INDEX "ExchangeRate_companyId_sourceCurrency_targetCurrency_asOfDa_idx";

-- AlterTable
ALTER TABLE "ExchangeRate" DROP COLUMN "companyId";

-- CreateIndex
CREATE INDEX "ExchangeRate_sourceCurrency_targetCurrency_asOfDate_idx" ON "ExchangeRate"("sourceCurrency", "targetCurrency", "asOfDate");
