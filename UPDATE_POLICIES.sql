-- Update RLS policies only (don't recreate tables)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hyvhhqidlyzvclczqlkk/editor

-- Drop and recreate the shift policies
DROP POLICY IF EXISTS "Users can insert their own shifts" ON shifts;
DROP POLICY IF EXISTS "Users can update their own shifts" ON shifts;

CREATE POLICY "Users can insert their own shifts"
    ON shifts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shifts"
    ON shifts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
