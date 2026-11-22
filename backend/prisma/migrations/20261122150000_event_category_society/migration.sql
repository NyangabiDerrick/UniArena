-- Events are now Club, Society, Sports or University. Old SOCIAL and ACADEMIC rows are kept.
ALTER TYPE "EventCategory" ADD VALUE IF NOT EXISTS 'SOCIETY';
