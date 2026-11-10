-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ArticleStatus" ADD VALUE 'HIDDEN';
ALTER TYPE "ArticleStatus" ADD VALUE 'REMOVED';

-- AlterEnum
ALTER TYPE "EventStatus" ADD VALUE 'SUSPENDED';

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "moderationNote" TEXT,
ADD COLUMN     "removedByAdmin" BOOLEAN NOT NULL DEFAULT false;
