-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "classId" TEXT,
ADD COLUMN     "departmentId" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "classId" TEXT,
ADD COLUMN     "departmentId" TEXT;

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "classId" TEXT,
ADD COLUMN     "departmentId" TEXT;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "classId" TEXT,
ADD COLUMN     "departmentId" TEXT;

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "fullyQualifiedName" VARCHAR(500),
    "parentId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "fullyQualifiedName" VARCHAR(500),
    "parentId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Class_parentId_idx" ON "Class"("parentId");

-- CreateIndex
CREATE INDEX "Class_active_idx" ON "Class"("active");

-- CreateIndex
CREATE INDEX "Class_companyId_idx" ON "Class"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_companyId_key" ON "Class"("name", "companyId");

-- CreateIndex
CREATE INDEX "Department_parentId_idx" ON "Department"("parentId");

-- CreateIndex
CREATE INDEX "Department_active_idx" ON "Department"("active");

-- CreateIndex
CREATE INDEX "Department_companyId_idx" ON "Department"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_companyId_key" ON "Department"("name", "companyId");

-- CreateIndex
CREATE INDEX "Bill_classId_idx" ON "Bill"("classId");

-- CreateIndex
CREATE INDEX "Bill_departmentId_idx" ON "Bill"("departmentId");

-- CreateIndex
CREATE INDEX "Invoice_classId_idx" ON "Invoice"("classId");

-- CreateIndex
CREATE INDEX "Invoice_departmentId_idx" ON "Invoice"("departmentId");

-- CreateIndex
CREATE INDEX "JournalEntry_classId_idx" ON "JournalEntry"("classId");

-- CreateIndex
CREATE INDEX "JournalEntry_departmentId_idx" ON "JournalEntry"("departmentId");

-- CreateIndex
CREATE INDEX "Vendor_classId_idx" ON "Vendor"("classId");

-- CreateIndex
CREATE INDEX "Vendor_departmentId_idx" ON "Vendor"("departmentId");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
