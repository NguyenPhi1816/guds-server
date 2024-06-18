-- CreateTable
CREATE TABLE "BaseProduct" (
    "Id" SERIAL NOT NULL,
    "Slug" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "CategoryId" INTEGER NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "BaseProduct_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "BaseProductImage" (
    "Id" SERIAL NOT NULL,
    "BaseProductId" INTEGER NOT NULL,
    "Path" TEXT NOT NULL,
    "IsDefault" BOOLEAN NOT NULL,

    CONSTRAINT "BaseProductImage_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "BaseProduct" ADD CONSTRAINT "BaseProduct_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "Category"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseProductImage" ADD CONSTRAINT "BaseProductImage_BaseProductId_fkey" FOREIGN KEY ("BaseProductId") REFERENCES "BaseProduct"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
