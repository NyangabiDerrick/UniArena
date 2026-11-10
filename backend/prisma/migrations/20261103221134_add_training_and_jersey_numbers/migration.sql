/*
  Warnings:

  - A unique constraint covering the columns `[teamId,jerseyNumber]` on the table `SquadMember` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SquadMember" ADD COLUMN     "jerseyNumber" INTEGER;

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingSession_teamId_idx" ON "TrainingSession"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "SquadMember_teamId_jerseyNumber_key" ON "SquadMember"("teamId", "jerseyNumber");

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "SportsTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
