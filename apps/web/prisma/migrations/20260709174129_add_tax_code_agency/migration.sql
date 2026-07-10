-- AlterTable
ALTER TABLE "TaxRate" ADD COLUMN     "taxAgencyId" TEXT,
ADD COLUMN     "taxCodeId" TEXT;

-- CreateTable
CREATE TABLE "TaxCode" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "TaxCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxAgency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "taxTrackedOnSales" BOOLEAN NOT NULL DEFAULT true,
    "taxTrackedOnPurchases" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "TaxAgency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaxCode_companyId_idx" ON "TaxCode"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxCode_name_companyId_key" ON "TaxCode"("name", "companyId");

-- CreateIndex
CREATE INDEX "TaxAgency_companyId_idx" ON "TaxAgency"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxAgency_name_companyId_key" ON "TaxAgency"("name", "companyId");

-- AddForeignKey
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_taxAgencyId_fkey" FOREIGN KEY ("taxAgencyId") REFERENCES "TaxAgency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCode" ADD CONSTRAINT "TaxCode_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAgency" ADD CONSTRAINT "TaxAgency_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
