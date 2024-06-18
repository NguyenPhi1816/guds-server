-- CreateTable
CREATE TABLE "ProductOption" (
    "Id" SERIAL NOT NULL,
    "CategoryId" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "Category"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
