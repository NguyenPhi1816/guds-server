/*
  Warnings:

  - A unique constraint covering the columns `[Name]` on the table `BaseProduct` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BaseProduct_Name_key" ON "BaseProduct"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_Name_key" ON "Category"("Name");
