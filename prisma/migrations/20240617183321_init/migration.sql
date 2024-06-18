-- CreateTable
CREATE TABLE "Account" (
    "Id" SERIAL NOT NULL,
    "UserPhoneNumber" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "UserRoleId" INTEGER NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "User" (
    "Id" SERIAL NOT NULL,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "Address" TEXT NOT NULL,
    "PhoneNumber" TEXT NOT NULL,
    "Gender" TEXT NOT NULL,
    "DateOfBirth" TIMESTAMP(3) NOT NULL,
    "Avatar" TEXT,
    "Email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_UserPhoneNumber_key" ON "Account"("UserPhoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_PhoneNumber_key" ON "User"("PhoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_UserRoleId_fkey" FOREIGN KEY ("UserRoleId") REFERENCES "UserRole"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_UserPhoneNumber_fkey" FOREIGN KEY ("UserPhoneNumber") REFERENCES "User"("PhoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
