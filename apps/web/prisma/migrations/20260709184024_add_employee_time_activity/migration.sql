-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "title" TEXT,
    "givenName" TEXT,
    "middleName" TEXT,
    "familyName" TEXT,
    "suffix" TEXT,
    "primaryEmail" TEXT,
    "primaryPhone" TEXT,
    "mobilePhone" TEXT,
    "employeeNumber" TEXT,
    "billableTime" BOOLEAN NOT NULL DEFAULT false,
    "billRate" DOUBLE PRECISION,
    "hiredDate" TIMESTAMP(3),
    "releaseDate" TIMESTAMP(3),
    "birthDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeActivity" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "customerId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "hourlyRate" DOUBLE PRECISION,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "TimeActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Employee_companyId_idx" ON "Employee"("companyId");

-- CreateIndex
CREATE INDEX "TimeActivity_employeeId_idx" ON "TimeActivity"("employeeId");

-- CreateIndex
CREATE INDEX "TimeActivity_customerId_idx" ON "TimeActivity"("customerId");

-- CreateIndex
CREATE INDEX "TimeActivity_companyId_idx" ON "TimeActivity"("companyId");

-- CreateIndex
CREATE INDEX "TimeActivity_date_idx" ON "TimeActivity"("date");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeActivity" ADD CONSTRAINT "TimeActivity_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeActivity" ADD CONSTRAINT "TimeActivity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeActivity" ADD CONSTRAINT "TimeActivity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
