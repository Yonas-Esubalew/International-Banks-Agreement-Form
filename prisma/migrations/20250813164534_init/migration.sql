-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'PARTNER_USER');

-- CreateEnum
CREATE TYPE "public"."BankType" AS ENUM ('COMMERCIAL', 'MICROFINANCE', 'COOPERATIVE', 'INVESTMENT', 'DEVELOPMENT', 'CENTRAL', 'SWIFT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AgreementStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."AgreementType" AS ENUM ('LOAN', 'PARTNERSHIP', 'SERVICE', 'NDA', 'OTHER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "auth0Id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "picture" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'PARTNER_USER',
    "bankId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bank" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "registrationNumber" TEXT,
    "taxId" TEXT,
    "contactEmail" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100),
    "postalCode" VARCHAR(20),
    "bankType" "public"."BankType" NOT NULL DEFAULT 'MICROFINANCE',
    "ceoName" VARCHAR(100),
    "ceoEmail" VARCHAR(255),
    "ctoName" VARCHAR(100),
    "ctoEmail" VARCHAR(255),
    "licenseNumber" TEXT,
    "branchCount" INTEGER DEFAULT 0,
    "isKYCCompliant" BOOLEAN NOT NULL DEFAULT false,
    "isAMLCompliant" BOOLEAN NOT NULL DEFAULT false,
    "supportedCurrencies" JSONB,
    "swiftCode" VARCHAR(20),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Agreement" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "agreementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "status" "public"."AgreementStatus" NOT NULL DEFAULT 'PENDING',
    "agreementType" "public"."AgreementType" NOT NULL,
    "digitalSignature" TEXT,
    "pdfFilePath" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_AgreementBanks" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AgreementBanks_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_auth0Id_key" ON "public"."User"("auth0Id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_registrationNumber_key" ON "public"."Bank"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_taxId_key" ON "public"."Bank"("taxId");

-- CreateIndex
CREATE INDEX "_AgreementBanks_B_index" ON "public"."_AgreementBanks"("B");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "public"."Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Agreement" ADD CONSTRAINT "Agreement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AgreementBanks" ADD CONSTRAINT "_AgreementBanks_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Agreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AgreementBanks" ADD CONSTRAINT "_AgreementBanks_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;
