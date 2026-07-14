-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "isStoreItem" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Item_isStoreItem_idx" ON "Item"("isStoreItem");
