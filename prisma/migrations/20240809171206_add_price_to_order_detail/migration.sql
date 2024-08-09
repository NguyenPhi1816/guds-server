/*
  Warnings:

  - Added the required column `price` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderDetail" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
