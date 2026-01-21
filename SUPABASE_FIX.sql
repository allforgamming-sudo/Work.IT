-- Clean setup for users and shifts tables
-- First, manually delete the old tables in Supabase Table Editor
-- Then run this SQL in: https://supabase.com/dashboard/project/hyvhhqidlyzvclczqlkk/editor

-- Create users table with auth user ID as primary key
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shifts table
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    hours DECIMAL(10, 2) NOT NULL,
    normal_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
    weekend_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
    sanctions INTEGER DEFAULT 0,
    crimes INTEGER DEFAULT 0,
    wanted INTEGER DEFAULT 0,
    weekend_shift BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, shift_date)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for shifts table
CREATE POLICY "Users can view their own shifts"
    ON shifts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shifts"
    ON shifts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shifts"
    ON shifts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shifts"
    ON shifts FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_shifts_user_id ON shifts(user_id);
CREATE INDEX idx_shifts_date ON shifts(shift_date);
CREATE INDEX idx_shifts_user_date ON shifts(user_id, shift_date);
