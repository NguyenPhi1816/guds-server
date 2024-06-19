-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_BaseProductId_fkey" FOREIGN KEY ("BaseProductId") REFERENCES "BaseProduct"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
