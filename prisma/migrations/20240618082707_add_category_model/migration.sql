-- CreateTable
CREATE TABLE "Category" (
    "Id" SERIAL NOT NULL,
    "Slug" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Image" TEXT,
    "Description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_Slug_key" ON "Category"("Slug");
