-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "nickname" TEXT;
