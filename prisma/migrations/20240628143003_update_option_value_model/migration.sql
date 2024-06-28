/*
  Warnings:

  - A unique constraint covering the columns `[optionId,value]` on the table `OptionValue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OptionValue_optionId_value_key" ON "OptionValue"("optionId", "value");
