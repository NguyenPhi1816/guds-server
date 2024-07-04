/*
  Warnings:

  - Added the required column `create_at` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "create_at" TIMESTAMP(3) NOT NULL;
