-- CreateEnum
CREATE TYPE "AccountantUserRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "Accountant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accountant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountantUser" (
    "id" TEXT NOT NULL,
    "accountantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "AccountantUserRole" NOT NULL DEFAULT 'MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountantUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountantAssignment" (
    "id" TEXT NOT NULL,
    "accountantId" TEXT NOT NULL,
    "accountantUserId" TEXT,
    "companyId" TEXT NOT NULL,
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountantAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Accountant_slug_key" ON "Accountant"("slug");

-- CreateIndex
CREATE INDEX "Accountant_ownerId_idx" ON "Accountant"("ownerId");

-- CreateIndex
CREATE INDEX "AccountantUser_accountantId_idx" ON "AccountantUser"("accountantId");

-- CreateIndex
CREATE INDEX "AccountantUser_userId_idx" ON "AccountantUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountantUser_accountantId_userId_key" ON "AccountantUser"("accountantId", "userId");

-- CreateIndex
CREATE INDEX "AccountantAssignment_accountantId_idx" ON "AccountantAssignment"("accountantId");

-- CreateIndex
CREATE INDEX "AccountantAssignment_companyId_idx" ON "AccountantAssignment"("companyId");

-- CreateIndex
CREATE INDEX "AccountantAssignment_accountantUserId_idx" ON "AccountantAssignment"("accountantUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountantAssignment_accountantId_companyId_key" ON "AccountantAssignment"("accountantId", "companyId");

-- AddForeignKey
ALTER TABLE "Accountant" ADD CONSTRAINT "Accountant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountantUser" ADD CONSTRAINT "AccountantUser_accountantId_fkey" FOREIGN KEY ("accountantId") REFERENCES "Accountant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountantUser" ADD CONSTRAINT "AccountantUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountantAssignment" ADD CONSTRAINT "AccountantAssignment_accountantId_fkey" FOREIGN KEY ("accountantId") REFERENCES "Accountant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountantAssignment" ADD CONSTRAINT "AccountantAssignment_accountantUserId_fkey" FOREIGN KEY ("accountantUserId") REFERENCES "AccountantUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountantAssignment" ADD CONSTRAINT "AccountantAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
