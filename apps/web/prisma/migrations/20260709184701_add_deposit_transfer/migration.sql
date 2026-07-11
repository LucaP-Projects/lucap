-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "depositNumber" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "depositDate" TIMESTAMP(3) NOT NULL,
    "cashBack" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cashBackAccountId" TEXT,
    "memo" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transferDate" TIMESTAMP(3) NOT NULL,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "memo" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Deposit_companyId_idx" ON "Deposit"("companyId");

-- CreateIndex
CREATE INDEX "Deposit_depositDate_idx" ON "Deposit"("depositDate");

-- CreateIndex
CREATE INDEX "Transfer_companyId_idx" ON "Transfer"("companyId");

-- CreateIndex
CREATE INDEX "Transfer_transferDate_idx" ON "Transfer"("transferDate");

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
