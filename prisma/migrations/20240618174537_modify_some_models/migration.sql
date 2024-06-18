/*
  Warnings:

  - You are about to drop the column `ProductOptionId` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `Value` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the `BaseProductOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BaseProductOptionValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductPrice` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `Image` on table `Category` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Description` on table `Category` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "BaseProductOption" DROP CONSTRAINT "BaseProductOption_BaseProductId_fkey";

-- DropForeignKey
ALTER TABLE "BaseProductOption" DROP CONSTRAINT "BaseProductOption_ProductOptionId_fkey";

-- DropForeignKey
ALTER TABLE "BaseProductOptionValue" DROP CONSTRAINT "BaseProductOptionValue_BaseProductId_ProductOptionId_Value_fkey";

-- DropForeignKey
ALTER TABLE "BaseProductOptionValue" DROP CONSTRAINT "BaseProductOptionValue_BaseProductId_ProductOptionId_fkey";

-- DropForeignKey
ALTER TABLE "ProductOption" DROP CONSTRAINT "ProductOption_CategoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProductPrice" DROP CONSTRAINT "ProductPrice_ProductVariantId_fkey";

-- DropIndex
DROP INDEX "ProductVariant_BaseProductId_ProductOptionId_Value_key";

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "Image" SET NOT NULL,
ALTER COLUMN "Description" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "ProductOptionId",
DROP COLUMN "Value";

-- DropTable
DROP TABLE "BaseProductOption";

-- DropTable
DROP TABLE "BaseProductOptionValue";

-- DropTable
DROP TABLE "ProductOption";

-- DropTable
DROP TABLE "ProductPrice";

-- CreateTable
CREATE TABLE "Option" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OptionValue" (
    "Id" SERIAL NOT NULL,
    "OptionId" INTEGER NOT NULL,
    "Value" TEXT NOT NULL,

    CONSTRAINT "OptionValue_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OptionValueVariant" (
    "OptionValueId" INTEGER NOT NULL,
    "ProductVariantId" INTEGER NOT NULL,

    CONSTRAINT "OptionValueVariant_pkey" PRIMARY KEY ("OptionValueId","ProductVariantId")
);

-- CreateTable
CREATE TABLE "Price" (
    "ProductVariantId" INTEGER NOT NULL,
    "Price" INTEGER NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("ProductVariantId","Price","UpdatedAt")
);

-- AddForeignKey
ALTER TABLE "OptionValue" ADD CONSTRAINT "OptionValue_OptionId_fkey" FOREIGN KEY ("OptionId") REFERENCES "Option"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionValueVariant" ADD CONSTRAINT "OptionValueVariant_OptionValueId_fkey" FOREIGN KEY ("OptionValueId") REFERENCES "OptionValue"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionValueVariant" ADD CONSTRAINT "OptionValueVariant_ProductVariantId_fkey" FOREIGN KEY ("ProductVariantId") REFERENCES "ProductVariant"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_ProductVariantId_fkey" FOREIGN KEY ("ProductVariantId") REFERENCES "ProductVariant"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
