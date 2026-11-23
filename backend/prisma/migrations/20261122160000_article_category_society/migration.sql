-- News can now be posted as a Society
ALTER TYPE "ArticleCategory" ADD VALUE IF NOT EXISTS 'SOCIETY';
