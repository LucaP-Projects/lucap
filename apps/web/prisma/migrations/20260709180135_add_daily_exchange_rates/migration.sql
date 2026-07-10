-- CreateTable
CREATE TABLE "DailyExchangeRate" (
    "id" TEXT NOT NULL,
    "rateDate" TIMESTAMP(3) NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "targetCurrency" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyExchangeRate_rateDate_targetCurrency_idx" ON "DailyExchangeRate"("rateDate", "targetCurrency");

-- CreateIndex
CREATE UNIQUE INDEX "DailyExchangeRate_rateDate_baseCurrency_targetCurrency_key" ON "DailyExchangeRate"("rateDate", "baseCurrency", "targetCurrency");
