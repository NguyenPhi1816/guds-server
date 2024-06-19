/*
  Warnings:

  - A unique constraint covering the columns `[OrderDetailId]` on the table `Feedback` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `OrderDetailId` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "OrderDetailId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Order" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "Note" TEXT,
    "CreateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Status" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OrderDetail" (
    "Id" SERIAL NOT NULL,
    "ProductVariantId" INTEGER NOT NULL,
    "OrderId" INTEGER NOT NULL,
    "Quantity" INTEGER NOT NULL,

    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "Id" SERIAL NOT NULL,
    "OrderId" INTEGER NOT NULL,
    "PaymentMethod" TEXT NOT NULL,
    "Amount" DOUBLE PRECISION NOT NULL,
    "PaymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Status" TEXT NOT NULL,
    "TransactionId" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_OrderId_key" ON "Payment"("OrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_OrderDetailId_key" ON "Feedback"("OrderDetailId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_ProductVariantId_fkey" FOREIGN KEY ("ProductVariantId") REFERENCES "ProductVariant"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "Order"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "Order"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_OrderDetailId_fkey" FOREIGN KEY ("OrderDetailId") REFERENCES "OrderDetail"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
