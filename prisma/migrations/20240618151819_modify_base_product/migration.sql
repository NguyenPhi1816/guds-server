/*
  Warnings:

  - A unique constraint covering the columns `[Slug]` on the table `BaseProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BaseProduct_Slug_key" ON "BaseProduct"("Slug");
