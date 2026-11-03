-- AlterEnum
ALTER TYPE "FixtureStatus" ADD VALUE 'SUSPENDED';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "moderationNote" TEXT,
ADD COLUMN     "suspendedByAdmin" BOOLEAN NOT NULL DEFAULT false;
