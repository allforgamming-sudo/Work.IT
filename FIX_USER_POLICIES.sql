-- Fix users table RLS policies
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hyvhhqidlyzvclczqlkk/editor

-- Drop and recreate all users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for authenticated users"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
