/*
  Warnings:

  - A unique constraint covering the columns `[optionValueId]` on the table `OptionValueVariant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OptionValueVariant_optionValueId_key" ON "OptionValueVariant"("optionValueId");
