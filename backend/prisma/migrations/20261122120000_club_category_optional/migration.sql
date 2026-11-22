-- A category is optional for clubs and societies
ALTER TABLE "Club" ALTER COLUMN "category" DROP NOT NULL;
