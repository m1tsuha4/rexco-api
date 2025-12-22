/*
  Warnings:

  - You are about to drop the column `color` on the `ProductFeature` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "color" TEXT;

-- AlterTable
ALTER TABLE "ProductFeature" DROP COLUMN "color";
