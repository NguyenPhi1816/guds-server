/*
  Warnings:

  - A unique constraint covering the columns `[name,baseProductId]` on the table `Option` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Option_name_baseProductId_key" ON "Option"("name", "baseProductId");
