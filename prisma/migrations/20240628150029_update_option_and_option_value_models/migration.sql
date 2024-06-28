/*
  Warnings:

  - Added the required column `status` to the `Option` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `OptionValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OptionValue" ADD COLUMN     "status" TEXT NOT NULL;
