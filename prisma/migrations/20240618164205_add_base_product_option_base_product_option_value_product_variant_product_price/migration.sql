-- CreateTable
CREATE TABLE "BaseProductOption" (
    "BaseProductId" INTEGER NOT NULL,
    "ProductOptionId" INTEGER NOT NULL,

    CONSTRAINT "BaseProductOption_pkey" PRIMARY KEY ("BaseProductId","ProductOptionId")
);

-- CreateTable
CREATE TABLE "BaseProductOptionValue" (
    "BaseProductId" INTEGER NOT NULL,
    "ProductOptionId" INTEGER NOT NULL,
    "Value" TEXT NOT NULL,

    CONSTRAINT "BaseProductOptionValue_pkey" PRIMARY KEY ("BaseProductId","ProductOptionId","Value")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "Id" SERIAL NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Image" TEXT NOT NULL,
    "BaseProductId" INTEGER NOT NULL,
    "ProductOptionId" INTEGER NOT NULL,
    "Value" TEXT NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProductPrice" (
    "ProductVariantId" INTEGER NOT NULL,
    "Price" INTEGER NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("ProductVariantId","Price","UpdatedAt")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_BaseProductId_ProductOptionId_Value_key" ON "ProductVariant"("BaseProductId", "ProductOptionId", "Value");

-- AddForeignKey
ALTER TABLE "BaseProductOption" ADD CONSTRAINT "BaseProductOption_BaseProductId_fkey" FOREIGN KEY ("BaseProductId") REFERENCES "BaseProduct"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseProductOption" ADD CONSTRAINT "BaseProductOption_ProductOptionId_fkey" FOREIGN KEY ("ProductOptionId") REFERENCES "ProductOption"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseProductOptionValue" ADD CONSTRAINT "BaseProductOptionValue_BaseProductId_ProductOptionId_fkey" FOREIGN KEY ("BaseProductId", "ProductOptionId") REFERENCES "BaseProductOption"("BaseProductId", "ProductOptionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseProductOptionValue" ADD CONSTRAINT "BaseProductOptionValue_BaseProductId_ProductOptionId_Value_fkey" FOREIGN KEY ("BaseProductId", "ProductOptionId", "Value") REFERENCES "ProductVariant"("BaseProductId", "ProductOptionId", "Value") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_ProductVariantId_fkey" FOREIGN KEY ("ProductVariantId") REFERENCES "ProductVariant"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
