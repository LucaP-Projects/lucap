/*
  Warnings:

  - You are about to drop the column `counterparty` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `ht` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `kind` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `rs` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `ttc` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `tva` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `typeLabel` on the `Transaction` table. All the data in the column will be lost.
  - The `status` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reply` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tenant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `amount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('BILLING', 'SHIPPING');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "DiscountApplicationTime" AS ENUM ('BEFORE_TAX', 'AFTER_TAX');

-- CreateEnum
CREATE TYPE "IntervalUnit" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "TaxStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('SALES', 'VAT', 'GST', 'SERVICE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReceiptStatus" AS ENUM ('COMPLETED', 'VOIDED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AdjustmentStrategy" AS ENUM ('DISTRIBUTE_TO_FUTURE', 'APPEND_TO_REMAINING', 'LAST_INSTALLMENT', 'NEXT_INSTALLMENT', 'WEIGHTED_DISTRIBUTION', 'PROPORTIONAL_REMAINING', 'FIXED_FIRST', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PAYMENT_DUE', 'PAYMENT_RECEIVED', 'SUBSCRIPTION_EXPIRING', 'SUBSCRIPTION_CANCELLED', 'CUSTOMER_WELCOME');

-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('PENDING', 'INVOICED', 'CANCELED');

-- CreateEnum
CREATE TYPE "CreditStatus" AS ENUM ('PENDING', 'CREDITED', 'CANCELED');

-- CreateEnum
CREATE TYPE "VersionChangeType" AS ENUM ('PRICE_ADJUSTMENT', 'INTERVAL_CHANGE', 'INSTALLMENT_RESTRUCTURE', 'INITIAL_FEE_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DEPRECATED', 'PENDING_ACTIVATION');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('MANAGE_CUSTOMERS', 'MANAGE_SUBSCRIPTIONS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS', 'MANAGE_SETTINGS', 'MANAGE_STAFF', 'MANAGE_TEMPLATES', 'VIEW_DASHBOARD', 'MANAGE_FILES');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'CHECK', 'DIGITAL_WALLET', 'MOBILE_PAYMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'PARTIAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('ONE_TIME', 'SUBSCRIPTION', 'INSTALLMENTS');

-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('ADMIN', 'CUSTOMER', 'STAFF');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EXPENSE', 'REVENUE', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "CreditMemoStatus" AS ENUM ('DRAFT', 'ISSUED', 'APPLIED', 'VOID');

-- CreateEnum
CREATE TYPE "CreditMemoReason" AS ENUM ('RETURN', 'OVERPAYMENT', 'CANCELLATION', 'CORRECTION', 'DISCOUNT', 'DAMAGED_GOODS', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'VOID', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RefundReason" AS ENUM ('DEFECTIVE_PRODUCT', 'WRONG_ITEM', 'OTHER', 'NOT_SATISFIED', 'DUPLICATE_CHARGE', 'SHIPPING_ISSUE', 'PRICING_ERROR');

-- CreateEnum
CREATE TYPE "TableType" AS ENUM ('CUSTOMER', 'INVOICE', 'PAYMENT', 'TRANSACTION');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT_AND_NUMBER', 'NUMBER', 'DATE', 'DROPDOWN_LIST');

-- CreateEnum
CREATE TYPE "CustomFieldCategory" AS ENUM ('CUSTOMER', 'TRANSACTION', 'VENDOR', 'PROJECT');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('SERVICE', 'NON_INVENTORY', 'INVENTORY');

-- CreateEnum
CREATE TYPE "CustomFieldFormType" AS ENUM ('SALES_RECEIPT', 'INVOICE', 'ESTIMATE', 'CREDIT_MEMO', 'REFUND_RECEIPT', 'PURCHASE_ORDER', 'EXPENSE', 'BILL', 'CHECK', 'VENDOR_CREDIT', 'CREDIT_CARD_CREDIT');

-- CreateEnum
CREATE TYPE "CustomerPreferredPaymentMethod" AS ENUM ('PRINT', 'EMAIL', 'NONE');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('SARL', 'SUARL', 'SA', 'SCA');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_userId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_tenantId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "counterparty",
DROP COLUMN "ht",
DROP COLUMN "kind",
DROP COLUMN "reference",
DROP COLUMN "rs",
DROP COLUMN "tenantId",
DROP COLUMN "ttc",
DROP COLUMN "tva",
DROP COLUMN "typeLabel",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "creditMemoId" TEXT,
ADD COLUMN     "deactivatedAt" TIMESTAMP(3),
ADD COLUMN     "deactivatedByUserId" TEXT,
ADD COLUMN     "deactivationReason" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "invoicePaymentId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "referenceNumber" TEXT,
ADD COLUMN     "refundReceiptId" TEXT,
ADD COLUMN     "salesReceiptId" TEXT,
ADD COLUMN     "type" "TransactionType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "status",
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'INCOMPLETE';

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "Reply";

-- DropTable
DROP TABLE "Service";

-- DropTable
DROP TABLE "Tenant";

-- DropTable
DROP TABLE "Ticket";

-- DropTable
DROP TABLE "account";

-- DropTable
DROP TABLE "session";

-- DropTable
DROP TABLE "user";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activeCompanyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCompany" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "impersonatedBy" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "systemRole" "SystemRole",
    "permissions" "Permission"[],
    "companyId" TEXT NOT NULL,
    "parentRoleId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "displayName" VARCHAR(500) NOT NULL,
    "title" VARCHAR(16),
    "givenName" VARCHAR(100),
    "middleName" VARCHAR(100),
    "familyName" VARCHAR(100),
    "suffix" VARCHAR(16),
    "companyName" VARCHAR(100),
    "customerTypeId" TEXT,
    "primaryPhone" VARCHAR(30),
    "alternatePhone" VARCHAR(30),
    "mobile" VARCHAR(30),
    "fax" VARCHAR(30),
    "primaryEmail" TEXT,
    "webAddress" VARCHAR(1000),
    "billingAddress" JSONB,
    "shippingAddress" JSONB,
    "taxIdentifier" TEXT,
    "secondaryTaxId" TEXT,
    "resaleNumber" VARCHAR(16),
    "businessNumber" VARCHAR(10),
    "notes" VARCHAR(2000),
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditLimit" DOUBLE PRECISION,
    "preferredPaymentMethod" "CustomerPreferredPaymentMethod",
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "printOnCheckName" VARCHAR(110),
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "CustomerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "composed_number" TEXT NOT NULL,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "parent_id" TEXT,
    "templateId" TEXT,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL,
    "type" "PaymentFrequency" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "versionId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEventVersion" (
    "id" TEXT NOT NULL,
    "paymentEventId" TEXT,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PaymentFrequency" NOT NULL,
    "status" "VersionStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledActivationDate" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "paymentSettings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "PaymentEventVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPaymentEvent" (
    "id" TEXT NOT NULL,
    "paymentEventId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "customerId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "progress" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "CustomerPaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEventItem" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "sku" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "PaymentEventItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200),
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sku" VARCHAR(50),
    "categoryId" TEXT,
    "description" VARCHAR(1000),
    "salesDescription" VARCHAR(1000),
    "purchaseDescription" VARCHAR(1000),
    "sellable" BOOLEAN NOT NULL DEFAULT true,
    "salesPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "salesTaxable" BOOLEAN NOT NULL DEFAULT true,
    "salesStartDate" TIMESTAMP(3),
    "salesEndDate" TIMESTAMP(3),
    "discountType" "DiscountType",
    "discountValue" DOUBLE PRECISION,
    "discountApplicationTime" "DiscountApplicationTime",
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "purchasable" BOOLEAN NOT NULL DEFAULT false,
    "cost" DOUBLE PRECISION,
    "preferredVendorId" TEXT,
    "lastPurchasePrice" DOUBLE PRECISION,
    "lastPurchaseDate" TIMESTAMP(3),
    "trackInventory" BOOLEAN NOT NULL DEFAULT false,
    "quantityOnHand" INTEGER,
    "reorderPoint" INTEGER,
    "initialQuantity" INTEGER,
    "asOfDate" TIMESTAMP(3),
    "incomeAccountId" TEXT,
    "expenseAccountId" TEXT,
    "inventoryAssetAccountId" TEXT,
    "imageUrl" VARCHAR(2000),
    "metadata" JSONB,
    "status" "ItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "sku" TEXT,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "convertedFromEstimate" BOOLEAN NOT NULL DEFAULT false,
    "estimateId" TEXT,
    "number" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "paymentEventId" TEXT,
    "discountType" "DiscountType",
    "discountValue" DOUBLE PRECISION,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountApplicationTime" "DiscountApplicationTime",
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "emailCustomer" TEXT,
    "taxId" TEXT,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentEventSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isLinkedToVersion" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceAttachment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "InvoiceAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateItem" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "sku" TEXT,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "EstimateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountType" "DiscountType",
    "discountValue" DOUBLE PRECISION,
    "discountApplicationTime" "DiscountApplicationTime",
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "EstimateStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "emailCustomer" TEXT,
    "taxId" TEXT,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "convertedToInvoice" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" TEXT,
    "paymentEventSnapshot" JSONB NOT NULL,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateAttachment" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "EstimateAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditMemoItem" (
    "id" TEXT NOT NULL,
    "creditMemoId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "sku" TEXT,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "CreditMemoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditMemo" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "discountType" "DiscountType",
    "discountValue" DOUBLE PRECISION,
    "discountApplicationTime" "DiscountApplicationTime",
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "taxId" TEXT,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" "CreditMemoReason" NOT NULL DEFAULT 'OTHER',
    "status" "CreditMemoStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "paymentEventSnapshot" JSONB NOT NULL,
    "emailCustomer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "CreditMemo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditMemoAttachment" (
    "id" TEXT NOT NULL,
    "creditMemoId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "CreditMemoAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReceiptItem" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "sku" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "SalesReceiptItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReceipt" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "discountType" "DiscountType",
    "discountValue" DOUBLE PRECISION,
    "discountApplicationTime" "DiscountApplicationTime",
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxId" TEXT,
    "paymentEventSnapshot" JSONB NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentRef" TEXT,
    "notes" TEXT,
    "emailCustomer" TEXT,
    "status" "ReceiptStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "SalesReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptAttachment" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "ReceiptAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundReceiptItem" (
    "id" TEXT NOT NULL,
    "refundReceiptId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "sku" TEXT,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "RefundReceiptItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundReceipt" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "taxId" TEXT,
    "discountType" "DiscountType",
    "discountValue" DOUBLE PRECISION,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountApplicationTime" "DiscountApplicationTime",
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentEventSnapshot" JSONB NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "refundMethod" "PaymentMethod" NOT NULL,
    "originalPaymentMethod" "PaymentMethod",
    "refundRef" TEXT,
    "reason" "RefundReason" NOT NULL DEFAULT 'OTHER',
    "notes" TEXT,
    "emailCustomer" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "RefundReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundAttachment" (
    "id" TEXT NOT NULL,
    "refundReceiptId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "RefundAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DelayedChargeItem" (
    "id" TEXT NOT NULL,
    "chargeId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "sku" TEXT,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "DelayedChargeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DelayedCharge" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "taxId" TEXT,
    "discountType" "DiscountType",
    "discountValue" DOUBLE PRECISION,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountApplicationTime" "DiscountApplicationTime",
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentEventSnapshot" JSONB NOT NULL,
    "status" "ChargeStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "emailCustomer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "DelayedCharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChargeAttachment" (
    "id" TEXT NOT NULL,
    "chargeId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "ChargeAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DelayedCreditItem" (
    "id" TEXT NOT NULL,
    "creditId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "sku" TEXT,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "DelayedCreditItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DelayedCredit" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "discountType" "DiscountType",
    "discountValue" DOUBLE PRECISION,
    "discountApplicationTime" "DiscountApplicationTime",
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentEventSnapshot" JSONB NOT NULL,
    "taxId" TEXT,
    "status" "CreditStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "emailCustomer" TEXT,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "DelayedCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DelayedCreditAttachment" (
    "id" TEXT NOT NULL,
    "creditId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "DelayedCreditAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "metadata" JSONB,
    "discountType" "DiscountType",
    "discountValue" DOUBLE PRECISION,
    "discountApplicationTime" "DiscountApplicationTime",
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "TransactionCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionAttachment" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "TransactionAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionHistory" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "oldCategoryId" TEXT,
    "newCategoryId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "changeType" TEXT NOT NULL DEFAULT 'RECLASSIFICATION',

    CONSTRAINT "TransactionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "slug" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "compareAtPrice" DOUBLE PRECISION,
    "sku" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "inventory" INTEGER,
    "features" TEXT[],
    "metadata" JSONB,
    "isSubscription" BOOLEAN NOT NULL DEFAULT false,
    "billingInterval" TEXT,
    "billingIntervalCount" INTEGER,
    "trialDays" INTEGER DEFAULT 0,
    "itemId" TEXT,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "centralProductId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "price" DOUBLE PRECISION,
    "inventory" INTEGER,
    "metadata" JSONB,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryProduct" (
    "categoryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "CategoryProduct_pkey" PRIMARY KEY ("categoryId","productId")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "banner" TEXT,
    "primaryColor" TEXT,
    "accentColor" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "customDomain" TEXT,
    "companyId" TEXT NOT NULL,
    "allowGuests" BOOLEAN NOT NULL DEFAULT true,
    "stripeConnectedAccountId" TEXT,
    "paymentSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomField" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CustomFieldType" NOT NULL,
    "category" "CustomFieldCategory" NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "CustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomFieldForm" (
    "id" TEXT NOT NULL,
    "name" "CustomFieldFormType" NOT NULL,
    "printOnForm" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomFieldForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomFieldValue" (
    "id" TEXT NOT NULL,
    "customFieldId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableConfiguration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tableType" "TableType" NOT NULL,
    "columns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pageSize" INTEGER NOT NULL DEFAULT 50,
    "flags" JSONB,
    "sortField" TEXT,
    "sortOrder" TEXT,
    "filters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TableConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "parent_id" TEXT,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "number" TEXT NOT NULL,
    "composed_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "journalNo" TEXT,
    "transactionType" TEXT NOT NULL,
    "description" TEXT,
    "customerId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntryLine" (
    "id" TEXT NOT NULL,
    "debit" DOUBLE PRECISION,
    "credit" DOUBLE PRECISION,
    "description" TEXT,
    "accountId" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "JournalEntryLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "agencyName" TEXT NOT NULL,
    "type" "TaxType" NOT NULL DEFAULT 'SALES',
    "rate" DOUBLE PRECISION NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "TaxStatus" NOT NULL DEFAULT 'ACTIVE',
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedByUserId" TEXT,
    "deactivationReason" TEXT,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "companyType" "CompanyType",
    "legalName" TEXT,
    "taxId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" JSONB,
    "logo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "metadata" JSONB,
    "parentCompanyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "service" TEXT,
    "channel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "author" TEXT,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CustomFieldForm" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CustomFieldForm_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_activeCompanyId_idx" ON "users"("activeCompanyId");

-- CreateIndex
CREATE INDEX "UserAccount_userId_idx" ON "UserAccount"("userId");

-- CreateIndex
CREATE INDEX "UserAccount_accountId_idx" ON "UserAccount"("accountId");

-- CreateIndex
CREATE INDEX "UserAccount_providerId_idx" ON "UserAccount"("providerId");

-- CreateIndex
CREATE INDEX "UserCompany_userId_idx" ON "UserCompany"("userId");

-- CreateIndex
CREATE INDEX "UserCompany_companyId_idx" ON "UserCompany"("companyId");

-- CreateIndex
CREATE INDEX "UserCompany_roleId_idx" ON "UserCompany"("roleId");

-- CreateIndex
CREATE INDEX "UserCompany_isActive_idx" ON "UserCompany"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "UserCompany_userId_companyId_key" ON "UserCompany"("userId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "Role_companyId_idx" ON "Role"("companyId");

-- CreateIndex
CREATE INDEX "Role_isActive_idx" ON "Role"("isActive");

-- CreateIndex
CREATE INDEX "Role_parentRoleId_idx" ON "Role"("parentRoleId");

-- CreateIndex
CREATE INDEX "Role_systemRole_idx" ON "Role"("systemRole");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_companyId_key" ON "Role"("name", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE INDEX "Customer_parentId_idx" ON "Customer"("parentId");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "Customer"("status");

-- CreateIndex
CREATE INDEX "Customer_displayName_idx" ON "Customer"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_displayName_companyId_key" ON "Customer"("displayName", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerType_name_companyId_key" ON "CustomerType"("name", "companyId");

-- CreateIndex
CREATE INDEX "Account_parent_id_idx" ON "Account"("parent_id");

-- CreateIndex
CREATE INDEX "Account_templateId_idx" ON "Account"("templateId");

-- CreateIndex
CREATE INDEX "Account_companyId_idx" ON "Account"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_companyId_number_key" ON "Account"("companyId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Account_companyId_composed_number_key" ON "Account"("companyId", "composed_number");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_versionId_key" ON "PaymentEvent"("versionId");

-- CreateIndex
CREATE INDEX "PaymentEvent_active_idx" ON "PaymentEvent"("active");

-- CreateIndex
CREATE INDEX "PaymentEvent_versionId_idx" ON "PaymentEvent"("versionId");

-- CreateIndex
CREATE INDEX "PaymentEventVersion_paymentEventId_idx" ON "PaymentEventVersion"("paymentEventId");

-- CreateIndex
CREATE INDEX "PaymentEventVersion_type_idx" ON "PaymentEventVersion"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEventVersion_paymentEventId_version_key" ON "PaymentEventVersion"("paymentEventId", "version");

-- CreateIndex
CREATE INDEX "CustomerPaymentEvent_customerId_idx" ON "CustomerPaymentEvent"("customerId");

-- CreateIndex
CREATE INDEX "CustomerPaymentEvent_status_idx" ON "CustomerPaymentEvent"("status");

-- CreateIndex
CREATE INDEX "CustomerPaymentEvent_startDate_idx" ON "CustomerPaymentEvent"("startDate");

-- CreateIndex
CREATE INDEX "CustomerPaymentEvent_endDate_idx" ON "CustomerPaymentEvent"("endDate");

-- CreateIndex
CREATE INDEX "PaymentEventItem_versionId_idx" ON "PaymentEventItem"("versionId");

-- CreateIndex
CREATE INDEX "Category_name_companyId_idx" ON "Category"("name", "companyId");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_active_idx" ON "Category"("active");

-- CreateIndex
CREATE INDEX "Category_level_idx" ON "Category"("level");

-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

-- CreateIndex
CREATE INDEX "Item_type_idx" ON "Item"("type");

-- CreateIndex
CREATE INDEX "Item_status_idx" ON "Item"("status");

-- CreateIndex
CREATE INDEX "Item_categoryId_idx" ON "Item"("categoryId");

-- CreateIndex
CREATE INDEX "Item_sku_idx" ON "Item"("sku");

-- CreateIndex
CREATE INDEX "Item_sellable_idx" ON "Item"("sellable");

-- CreateIndex
CREATE INDEX "Item_purchasable_idx" ON "Item"("purchasable");

-- CreateIndex
CREATE INDEX "Item_trackInventory_idx" ON "Item"("trackInventory");

-- CreateIndex
CREATE INDEX "Item_name_description_idx" ON "Item"("name", "description");

-- CreateIndex
CREATE UNIQUE INDEX "Item_sku_companyId_key" ON "Item"("sku", "companyId");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "Invoice_estimateId_idx" ON "Invoice"("estimateId");

-- CreateIndex
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");

-- CreateIndex
CREATE INDEX "Invoice_paymentEventId_idx" ON "Invoice"("paymentEventId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_dueDate_idx" ON "Invoice"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_companyId_key" ON "Invoice"("number", "companyId");

-- CreateIndex
CREATE INDEX "InvoiceAttachment_invoiceId_idx" ON "InvoiceAttachment"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceAttachment_fileId_idx" ON "InvoiceAttachment"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceAttachment_invoiceId_fileId_key" ON "InvoiceAttachment"("invoiceId", "fileId");

-- CreateIndex
CREATE INDEX "EstimateItem_estimateId_idx" ON "EstimateItem"("estimateId");

-- CreateIndex
CREATE INDEX "Estimate_customerId_idx" ON "Estimate"("customerId");

-- CreateIndex
CREATE INDEX "Estimate_status_idx" ON "Estimate"("status");

-- CreateIndex
CREATE INDEX "Estimate_dueDate_idx" ON "Estimate"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_number_companyId_key" ON "Estimate"("number", "companyId");

-- CreateIndex
CREATE INDEX "EstimateAttachment_estimateId_idx" ON "EstimateAttachment"("estimateId");

-- CreateIndex
CREATE INDEX "EstimateAttachment_fileId_idx" ON "EstimateAttachment"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "EstimateAttachment_estimateId_fileId_key" ON "EstimateAttachment"("estimateId", "fileId");

-- CreateIndex
CREATE INDEX "CreditMemoItem_creditMemoId_idx" ON "CreditMemoItem"("creditMemoId");

-- CreateIndex
CREATE INDEX "CreditMemo_customerId_idx" ON "CreditMemo"("customerId");

-- CreateIndex
CREATE INDEX "CreditMemo_status_idx" ON "CreditMemo"("status");

-- CreateIndex
CREATE INDEX "CreditMemo_issueDate_idx" ON "CreditMemo"("issueDate");

-- CreateIndex
CREATE UNIQUE INDEX "CreditMemo_number_companyId_key" ON "CreditMemo"("number", "companyId");

-- CreateIndex
CREATE INDEX "CreditMemoAttachment_creditMemoId_idx" ON "CreditMemoAttachment"("creditMemoId");

-- CreateIndex
CREATE INDEX "CreditMemoAttachment_fileId_idx" ON "CreditMemoAttachment"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditMemoAttachment_creditMemoId_fileId_key" ON "CreditMemoAttachment"("creditMemoId", "fileId");

-- CreateIndex
CREATE INDEX "SalesReceiptItem_receiptId_idx" ON "SalesReceiptItem"("receiptId");

-- CreateIndex
CREATE INDEX "SalesReceipt_customerId_idx" ON "SalesReceipt"("customerId");

-- CreateIndex
CREATE INDEX "SalesReceipt_status_idx" ON "SalesReceipt"("status");

-- CreateIndex
CREATE INDEX "SalesReceipt_createdAt_idx" ON "SalesReceipt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SalesReceipt_number_companyId_key" ON "SalesReceipt"("number", "companyId");

-- CreateIndex
CREATE INDEX "ReceiptAttachment_receiptId_idx" ON "ReceiptAttachment"("receiptId");

-- CreateIndex
CREATE INDEX "ReceiptAttachment_fileId_idx" ON "ReceiptAttachment"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptAttachment_receiptId_fileId_key" ON "ReceiptAttachment"("receiptId", "fileId");

-- CreateIndex
CREATE INDEX "RefundReceiptItem_refundReceiptId_idx" ON "RefundReceiptItem"("refundReceiptId");

-- CreateIndex
CREATE INDEX "RefundReceipt_customerId_idx" ON "RefundReceipt"("customerId");

-- CreateIndex
CREATE INDEX "RefundReceipt_status_idx" ON "RefundReceipt"("status");

-- CreateIndex
CREATE INDEX "RefundReceipt_createdAt_idx" ON "RefundReceipt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefundReceipt_number_companyId_key" ON "RefundReceipt"("number", "companyId");

-- CreateIndex
CREATE INDEX "RefundAttachment_refundReceiptId_idx" ON "RefundAttachment"("refundReceiptId");

-- CreateIndex
CREATE INDEX "RefundAttachment_fileId_idx" ON "RefundAttachment"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "RefundAttachment_refundReceiptId_fileId_key" ON "RefundAttachment"("refundReceiptId", "fileId");

-- CreateIndex
CREATE INDEX "DelayedChargeItem_chargeId_idx" ON "DelayedChargeItem"("chargeId");

-- CreateIndex
CREATE INDEX "DelayedCharge_customerId_idx" ON "DelayedCharge"("customerId");

-- CreateIndex
CREATE INDEX "DelayedCharge_status_idx" ON "DelayedCharge"("status");

-- CreateIndex
CREATE INDEX "DelayedCharge_dueDate_idx" ON "DelayedCharge"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "DelayedCharge_number_companyId_key" ON "DelayedCharge"("number", "companyId");

-- CreateIndex
CREATE INDEX "ChargeAttachment_chargeId_idx" ON "ChargeAttachment"("chargeId");

-- CreateIndex
CREATE INDEX "ChargeAttachment_fileId_idx" ON "ChargeAttachment"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "ChargeAttachment_chargeId_fileId_key" ON "ChargeAttachment"("chargeId", "fileId");

-- CreateIndex
CREATE INDEX "DelayedCreditItem_creditId_idx" ON "DelayedCreditItem"("creditId");

-- CreateIndex
CREATE INDEX "DelayedCredit_customerId_idx" ON "DelayedCredit"("customerId");

-- CreateIndex
CREATE INDEX "DelayedCredit_status_idx" ON "DelayedCredit"("status");

-- CreateIndex
CREATE INDEX "DelayedCredit_dueDate_idx" ON "DelayedCredit"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "DelayedCredit_number_companyId_key" ON "DelayedCredit"("number", "companyId");

-- CreateIndex
CREATE INDEX "DelayedCreditAttachment_creditId_idx" ON "DelayedCreditAttachment"("creditId");

-- CreateIndex
CREATE INDEX "DelayedCreditAttachment_fileId_idx" ON "DelayedCreditAttachment"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "DelayedCreditAttachment_creditId_fileId_key" ON "DelayedCreditAttachment"("creditId", "fileId");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_customerId_idx" ON "Payment"("customerId");

-- CreateIndex
CREATE INDEX "Payment_paymentDate_idx" ON "Payment"("paymentDate");

-- CreateIndex
CREATE INDEX "Config_key_idx" ON "Config"("key");

-- CreateIndex
CREATE INDEX "TransactionCategory_type_idx" ON "TransactionCategory"("type");

-- CreateIndex
CREATE INDEX "TransactionCategory_active_idx" ON "TransactionCategory"("active");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionCategory_name_type_key" ON "TransactionCategory"("name", "type");

-- CreateIndex
CREATE INDEX "TransactionAttachment_transactionId_idx" ON "TransactionAttachment"("transactionId");

-- CreateIndex
CREATE INDEX "TransactionHistory_transactionId_idx" ON "TransactionHistory"("transactionId");

-- CreateIndex
CREATE INDEX "TransactionHistory_oldCategoryId_idx" ON "TransactionHistory"("oldCategoryId");

-- CreateIndex
CREATE INDEX "TransactionHistory_newCategoryId_idx" ON "TransactionHistory"("newCategoryId");

-- CreateIndex
CREATE INDEX "TransactionHistory_changedBy_idx" ON "TransactionHistory"("changedBy");

-- CreateIndex
CREATE INDEX "TransactionHistory_changedAt_idx" ON "TransactionHistory"("changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");

-- CreateIndex
CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "CategoryProduct_categoryId_idx" ON "CategoryProduct"("categoryId");

-- CreateIndex
CREATE INDEX "CategoryProduct_productId_idx" ON "CategoryProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- CreateIndex
CREATE INDEX "Store_companyId_idx" ON "Store"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_companyId_key" ON "Store"("companyId");

-- CreateIndex
CREATE INDEX "EmailTemplate_active_idx" ON "EmailTemplate"("active");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_companyId_key" ON "EmailTemplate"("name", "companyId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "File_purpose_idx" ON "File"("purpose");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "CustomField_category_idx" ON "CustomField"("category");

-- CreateIndex
CREATE INDEX "CustomField_active_idx" ON "CustomField"("active");

-- CreateIndex
CREATE UNIQUE INDEX "CustomField_name_category_companyId_key" ON "CustomField"("name", "category", "companyId");

-- CreateIndex
CREATE INDEX "CustomFieldValue_customFieldId_idx" ON "CustomFieldValue"("customFieldId");

-- CreateIndex
CREATE INDEX "CustomFieldValue_entityId_idx" ON "CustomFieldValue"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldValue_customFieldId_entityId_key" ON "CustomFieldValue"("customFieldId", "entityId");

-- CreateIndex
CREATE INDEX "TableConfiguration_userId_idx" ON "TableConfiguration"("userId");

-- CreateIndex
CREATE INDEX "TableConfiguration_tableType_idx" ON "TableConfiguration"("tableType");

-- CreateIndex
CREATE UNIQUE INDEX "TableConfiguration_userId_tableType_key" ON "TableConfiguration"("userId", "tableType");

-- CreateIndex
CREATE UNIQUE INDEX "AccountTemplate_number_key" ON "AccountTemplate"("number");

-- CreateIndex
CREATE UNIQUE INDEX "AccountTemplate_composed_number_key" ON "AccountTemplate"("composed_number");

-- CreateIndex
CREATE INDEX "AccountTemplate_parent_id_idx" ON "AccountTemplate"("parent_id");

-- CreateIndex
CREATE INDEX "JournalEntry_companyId_idx" ON "JournalEntry"("companyId");

-- CreateIndex
CREATE INDEX "JournalEntry_customerId_idx" ON "JournalEntry"("customerId");

-- CreateIndex
CREATE INDEX "JournalEntry_date_idx" ON "JournalEntry"("date");

-- CreateIndex
CREATE INDEX "JournalEntry_journalNo_idx" ON "JournalEntry"("journalNo");

-- CreateIndex
CREATE INDEX "JournalEntryLine_accountId_idx" ON "JournalEntryLine"("accountId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_journalEntryId_idx" ON "JournalEntryLine"("journalEntryId");

-- CreateIndex
CREATE INDEX "TaxRate_status_idx" ON "TaxRate"("status");

-- CreateIndex
CREATE INDEX "TaxRate_companyId_idx" ON "TaxRate"("companyId");

-- CreateIndex
CREATE INDEX "TaxRate_effectiveDate_idx" ON "TaxRate"("effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRate_name_companyId_key" ON "TaxRate"("name", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_isActive_idx" ON "Company"("isActive");

-- CreateIndex
CREATE INDEX "Company_parentCompanyId_idx" ON "Company"("parentCompanyId");

-- CreateIndex
CREATE INDEX "_CustomFieldForm_B_index" ON "_CustomFieldForm"("B");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_categoryId_idx" ON "Transaction"("categoryId");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");

-- CreateIndex
CREATE INDEX "Transaction_createdBy_idx" ON "Transaction"("createdBy");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_completed_idx" ON "Transaction"("completed");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_activeCompanyId_fkey" FOREIGN KEY ("activeCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccount" ADD CONSTRAINT "UserAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_parentRoleId_fkey" FOREIGN KEY ("parentRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_customerTypeId_fkey" FOREIGN KEY ("customerTypeId") REFERENCES "CustomerType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerType" ADD CONSTRAINT "CustomerType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "AccountTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PaymentEventVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEventVersion" ADD CONSTRAINT "PaymentEventVersion_paymentEventId_fkey" FOREIGN KEY ("paymentEventId") REFERENCES "PaymentEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPaymentEvent" ADD CONSTRAINT "CustomerPaymentEvent_paymentEventId_fkey" FOREIGN KEY ("paymentEventId") REFERENCES "PaymentEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPaymentEvent" ADD CONSTRAINT "CustomerPaymentEvent_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PaymentEventVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPaymentEvent" ADD CONSTRAINT "CustomerPaymentEvent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEventItem" ADD CONSTRAINT "PaymentEventItem_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PaymentEventVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEventItem" ADD CONSTRAINT "PaymentEventItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_incomeAccountId_fkey" FOREIGN KEY ("incomeAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_expenseAccountId_fkey" FOREIGN KEY ("expenseAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_inventoryAssetAccountId_fkey" FOREIGN KEY ("inventoryAssetAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_paymentEventId_fkey" FOREIGN KEY ("paymentEventId") REFERENCES "CustomerPaymentEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceAttachment" ADD CONSTRAINT "InvoiceAttachment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceAttachment" ADD CONSTRAINT "InvoiceAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateItem" ADD CONSTRAINT "EstimateItem_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateItem" ADD CONSTRAINT "EstimateItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateAttachment" ADD CONSTRAINT "EstimateAttachment_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateAttachment" ADD CONSTRAINT "EstimateAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditMemoItem" ADD CONSTRAINT "CreditMemoItem_creditMemoId_fkey" FOREIGN KEY ("creditMemoId") REFERENCES "CreditMemo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditMemoItem" ADD CONSTRAINT "CreditMemoItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditMemo" ADD CONSTRAINT "CreditMemo_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditMemo" ADD CONSTRAINT "CreditMemo_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditMemo" ADD CONSTRAINT "CreditMemo_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditMemo" ADD CONSTRAINT "CreditMemo_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditMemoAttachment" ADD CONSTRAINT "CreditMemoAttachment_creditMemoId_fkey" FOREIGN KEY ("creditMemoId") REFERENCES "CreditMemo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditMemoAttachment" ADD CONSTRAINT "CreditMemoAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReceiptItem" ADD CONSTRAINT "SalesReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "SalesReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReceiptItem" ADD CONSTRAINT "SalesReceiptItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReceipt" ADD CONSTRAINT "SalesReceipt_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReceipt" ADD CONSTRAINT "SalesReceipt_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReceipt" ADD CONSTRAINT "SalesReceipt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptAttachment" ADD CONSTRAINT "ReceiptAttachment_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "SalesReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptAttachment" ADD CONSTRAINT "ReceiptAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundReceiptItem" ADD CONSTRAINT "RefundReceiptItem_refundReceiptId_fkey" FOREIGN KEY ("refundReceiptId") REFERENCES "RefundReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundReceiptItem" ADD CONSTRAINT "RefundReceiptItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundReceipt" ADD CONSTRAINT "RefundReceipt_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundReceipt" ADD CONSTRAINT "RefundReceipt_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundReceipt" ADD CONSTRAINT "RefundReceipt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundAttachment" ADD CONSTRAINT "RefundAttachment_refundReceiptId_fkey" FOREIGN KEY ("refundReceiptId") REFERENCES "RefundReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundAttachment" ADD CONSTRAINT "RefundAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelayedChargeItem" ADD CONSTRAINT "DelayedChargeItem_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "DelayedCharge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelayedChargeItem" ADD CONSTRAINT "DelayedChargeItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelayedCharge" ADD CONSTRAINT "DelayedCharge_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelayedCharge" ADD CONSTRAINT "DelayedCharge_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelayedCharge" ADD CONSTRAINT "DelayedCharge_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeAttachment" ADD CONSTRAINT "ChargeAttachment_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "DelayedCharge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeAttachment" ADD CONSTRAINT "ChargeAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelayedCreditItem" ADD CONSTRAINT "DelayedCreditItem_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "DelayedCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelayedCreditItem" ADD CONSTRAINT "DelayedCreditItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelayedCredit" ADD CONSTRAINT "DelayedCredit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelayedCredit" ADD CONSTRAINT "DelayedCredit_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelayedCredit" ADD CONSTRAINT "DelayedCredit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelayedCreditAttachment" ADD CONSTRAINT "DelayedCreditAttachment_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "DelayedCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelayedCreditAttachment" ADD CONSTRAINT "DelayedCreditAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionAttachment" ADD CONSTRAINT "TransactionAttachment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionAttachment" ADD CONSTRAINT "TransactionAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionHistory" ADD CONSTRAINT "TransactionHistory_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionHistory" ADD CONSTRAINT "TransactionHistory_oldCategoryId_fkey" FOREIGN KEY ("oldCategoryId") REFERENCES "TransactionCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionHistory" ADD CONSTRAINT "TransactionHistory_newCategoryId_fkey" FOREIGN KEY ("newCategoryId") REFERENCES "TransactionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TransactionCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_invoicePaymentId_fkey" FOREIGN KEY ("invoicePaymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_salesReceiptId_fkey" FOREIGN KEY ("salesReceiptId") REFERENCES "SalesReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_creditMemoId_fkey" FOREIGN KEY ("creditMemoId") REFERENCES "CreditMemo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_refundReceiptId_fkey" FOREIGN KEY ("refundReceiptId") REFERENCES "RefundReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryProduct" ADD CONSTRAINT "CategoryProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryProduct" ADD CONSTRAINT "CategoryProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomField" ADD CONSTRAINT "CustomField_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomFieldValue" ADD CONSTRAINT "CustomFieldValue_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "CustomField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountTemplate" ADD CONSTRAINT "AccountTemplate_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "AccountTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_parentCompanyId_fkey" FOREIGN KEY ("parentCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomFieldForm" ADD CONSTRAINT "_CustomFieldForm_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomFieldForm" ADD CONSTRAINT "_CustomFieldForm_B_fkey" FOREIGN KEY ("B") REFERENCES "CustomFieldForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
