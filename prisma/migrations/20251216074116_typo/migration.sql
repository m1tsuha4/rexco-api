/*
  Warnings:

  - You are about to drop the column `producStoreId` on the `Store` table. All the data in the column will be lost.
  - Added the required column `productStoreId` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_producStoreId_fkey";

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "producStoreId",
ADD COLUMN     "productStoreId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_productStoreId_fkey" FOREIGN KEY ("productStoreId") REFERENCES "ProductStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
