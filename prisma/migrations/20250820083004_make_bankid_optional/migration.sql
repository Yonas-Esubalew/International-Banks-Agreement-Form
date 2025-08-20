/*
  Warnings:

  - The values [APPROVED] on the enum `AgreementStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `_AgreementBanks` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `description` on table `Agreement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expiryDate` on table `Agreement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `digitalSignature` on table `Agreement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pdfFilePath` on table `Agreement` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AgreementStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'EXPIRED');
ALTER TABLE "public"."Agreement" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Agreement" ALTER COLUMN "status" TYPE "public"."AgreementStatus_new" USING ("status"::text::"public"."AgreementStatus_new");
ALTER TYPE "public"."AgreementStatus" RENAME TO "AgreementStatus_old";
ALTER TYPE "public"."AgreementStatus_new" RENAME TO "AgreementStatus";
DROP TYPE "public"."AgreementStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."_AgreementBanks" DROP CONSTRAINT "_AgreementBanks_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AgreementBanks" DROP CONSTRAINT "_AgreementBanks_B_fkey";

-- AlterTable
ALTER TABLE "public"."Agreement" ADD COLUMN     "bankId" INTEGER,
ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "agreementDate" DROP DEFAULT,
ALTER COLUMN "expiryDate" SET NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "digitalSignature" SET NOT NULL,
ALTER COLUMN "pdfFilePath" SET NOT NULL;

-- DropTable
DROP TABLE "public"."_AgreementBanks";

-- AddForeignKey
ALTER TABLE "public"."Agreement" ADD CONSTRAINT "Agreement_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "public"."Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
