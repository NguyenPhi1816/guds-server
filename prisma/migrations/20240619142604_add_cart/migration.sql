-- CreateTable
CREATE TABLE "Cart" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "CartDetail" (
    "Id" SERIAL NOT NULL,
    "CartId" INTEGER NOT NULL,
    "ProductVariantId" INTEGER NOT NULL,
    "Quantity" INTEGER NOT NULL,

    CONSTRAINT "CartDetail_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_UserId_key" ON "Cart"("UserId");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartDetail" ADD CONSTRAINT "CartDetail_CartId_fkey" FOREIGN KEY ("CartId") REFERENCES "Cart"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartDetail" ADD CONSTRAINT "CartDetail_ProductVariantId_fkey" FOREIGN KEY ("ProductVariantId") REFERENCES "ProductVariant"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
