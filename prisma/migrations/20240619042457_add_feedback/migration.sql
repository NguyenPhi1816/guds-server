-- CreateTable
CREATE TABLE "Feedback" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "ProductVariantId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Comment" TEXT,
    "Rating" INTEGER NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_ProductVariantId_fkey" FOREIGN KEY ("ProductVariantId") REFERENCES "ProductVariant"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
