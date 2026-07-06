/*
  Warnings:

  - You are about to drop the column `productId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the `CategoryProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductVariant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[storeSlug,companyId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StoreItemStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- Add store fields to Item
ALTER TABLE "Item" ADD COLUMN     "storeCategoryIds" TEXT[],
ADD COLUMN     "storeDescription" VARCHAR(2000),
ADD COLUMN     "storeFeatures" TEXT[],
ADD COLUMN     "storeImages" JSONB,
ADD COLUMN     "storeIsPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "storeShortDescription" VARCHAR(500),
ADD COLUMN     "storeSlug" TEXT,
ADD COLUMN     "storeStatus" "StoreItemStatus" NOT NULL DEFAULT 'DRAFT';

-- Add itemId columns as nullable first to allow data migration
ALTER TABLE "CartItem" ADD COLUMN "itemId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "itemId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "itemName" TEXT;

-- Migrate existing products into Items
DO $$
DECLARE
    p RECORD;
    target_item_id TEXT;
    product_images JSONB;
    product_category_ids TEXT[];
BEGIN
    FOR p IN SELECT * FROM "Product" LOOP
        IF p."itemId" IS NOT NULL THEN
            target_item_id := p."itemId";
        ELSE
            INSERT INTO "Item" (
                "id", "type", "name", "sku", "description", "salesDescription",
                "salesPrice", "sellable", "salesTaxable", "companyId", "status",
                "isActive", "createdAt", "updatedAt",
                "storeStatus", "storeSlug", "storeDescription", "storeShortDescription",
                "storeFeatures", "storeIsPublic"
            ) VALUES (
                gen_random_uuid(), 'NON_INVENTORY', p.name, p.sku, p.description, p."shortDescription",
                p.price, true, true, p."companyId", 'ACTIVE',
                true, p."createdAt", p."updatedAt",
                p.status::"StoreItemStatus", p.slug, p.description, p."shortDescription",
                p.features, p.status = 'ACTIVE'
            )
            RETURNING "id" INTO target_item_id;
        END IF;

        SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id', pi.id,
            'url', pi.url,
            'alt', pi.alt,
            'position', pi.position
        ) ORDER BY pi.position), '[]'::jsonb)
        INTO product_images
        FROM "ProductImage" pi
        WHERE pi."productId" = p.id;

        SELECT ARRAY(
            SELECT cp."categoryId"
            FROM "CategoryProduct" cp
            WHERE cp."productId" = p.id
        )
        INTO product_category_ids;

        UPDATE "Item" SET
            "storeStatus" = p.status::"StoreItemStatus",
            "storeSlug" = COALESCE("storeSlug", p.slug),
            "storeDescription" = COALESCE("storeDescription", p.description),
            "storeShortDescription" = COALESCE("storeShortDescription", p."shortDescription"),
            "storeImages" = COALESCE("storeImages", product_images),
            "storeFeatures" = COALESCE("storeFeatures", p.features),
            "storeIsPublic" = p.status = 'ACTIVE',
            "storeCategoryIds" = COALESCE("storeCategoryIds", product_category_ids)
        WHERE "id" = target_item_id;

        UPDATE "CartItem" SET "itemId" = target_item_id WHERE "productId" = p.id;

        UPDATE "OrderItem" SET
            "itemId" = target_item_id,
            "itemName" = p.name
        WHERE "productId" = p.id;
    END LOOP;
END $$;

-- Make itemId and itemName NOT NULL after migration
ALTER TABLE "CartItem" ALTER COLUMN "itemId" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "itemId" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "itemName" SET NOT NULL;

-- Drop old product-related foreign keys
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";
ALTER TABLE "CategoryProduct" DROP CONSTRAINT "CategoryProduct_categoryId_fkey";
ALTER TABLE "CategoryProduct" DROP CONSTRAINT "CategoryProduct_productId_fkey";
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";
ALTER TABLE "Product" DROP CONSTRAINT "Product_companyId_fkey";
ALTER TABLE "Product" DROP CONSTRAINT "Product_itemId_fkey";
ALTER TABLE "Product" DROP CONSTRAINT "Product_storeId_fkey";
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- Drop old indexes
DROP INDEX "CartItem_productId_idx";
DROP INDEX "OrderItem_productId_idx";

-- Drop old columns
ALTER TABLE "CartItem" DROP COLUMN "productId";
ALTER TABLE "OrderItem" DROP COLUMN "productId";
ALTER TABLE "OrderItem" DROP COLUMN "productName";

-- Drop old tables
DROP TABLE "CategoryProduct";
DROP TABLE "ProductImage";
DROP TABLE "ProductVariant";
DROP TABLE "Product";

-- Drop old enum
DROP TYPE "ProductStatus";

-- Create new indexes
CREATE INDEX "CartItem_itemId_idx" ON "CartItem"("itemId");
CREATE INDEX "Item_companyId_idx" ON "Item"("companyId");
CREATE INDEX "Item_storeStatus_idx" ON "Item"("storeStatus");
CREATE INDEX "Item_storeIsPublic_idx" ON "Item"("storeIsPublic");
CREATE INDEX "Item_storeSlug_idx" ON "Item"("storeSlug");
CREATE UNIQUE INDEX "Item_storeSlug_companyId_key" ON "Item"("storeSlug", "companyId");
CREATE INDEX "OrderItem_itemId_idx" ON "OrderItem"("itemId");

-- Add new foreign keys
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
