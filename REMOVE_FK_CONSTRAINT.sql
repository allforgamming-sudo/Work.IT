-- Remove foreign key constraint from users table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hyvhhqidlyzvclczqlkk/editor

-- Drop the foreign key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Also disable email confirmation in Supabase:
-- Go to Authentication > Settings > Email Auth
-- Disable "Confirm email" option
