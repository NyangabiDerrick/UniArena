-- CreateEnum
CREATE TYPE "ClubType" AS ENUM ('CLUB', 'SOCIETY');

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "type" "ClubType" NOT NULL DEFAULT 'CLUB';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "managedClubId" TEXT,
ADD COLUMN     "managedTeamId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managedClubId_fkey" FOREIGN KEY ("managedClubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managedTeamId_fkey" FOREIGN KEY ("managedTeamId") REFERENCES "SportsTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
