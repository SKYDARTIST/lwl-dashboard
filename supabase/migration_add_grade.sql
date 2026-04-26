-- Run this once in Supabase SQL Editor before re-seeding
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS grade TEXT;
