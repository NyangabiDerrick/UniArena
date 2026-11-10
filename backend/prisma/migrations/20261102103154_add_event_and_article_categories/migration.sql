-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('SOCIAL', 'CLUB', 'SPORTS', 'UNIVERSITY', 'ACADEMIC');

-- CreateEnum
CREATE TYPE "ArticleCategory" AS ENUM ('CLUB', 'SPORTS', 'UNIVERSITY');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "category" "ArticleCategory" NOT NULL DEFAULT 'UNIVERSITY';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "category" "EventCategory" NOT NULL DEFAULT 'SOCIAL';
