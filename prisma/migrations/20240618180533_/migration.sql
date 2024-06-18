/*
  Warnings:

  - A unique constraint covering the columns `[Name]` on the table `Option` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Option_Name_key" ON "Option"("Name");
