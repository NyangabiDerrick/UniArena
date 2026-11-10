-- CreateEnum
CREATE TYPE "ExitReason" AS ENUM ('SCHEDULE_CLASH', 'NO_LONGER_INTERESTED', 'MOVING_ON', 'COST', 'NOT_WELCOMING', 'OTHER', 'PREFER_NOT_TO_SAY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT;

-- CreateTable
CREATE TABLE "MembershipExit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "reason" "ExitReason" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipExit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MembershipExit_clubId_idx" ON "MembershipExit"("clubId");
