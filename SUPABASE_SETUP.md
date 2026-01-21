# Supabase Database Setup

## SQL Commands to Run in Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/hyvhhqidlyzvclczqlkk/editor

Run these SQL commands:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- Create policies for users table
CREATE POLICY "Users can view their own data" 
    ON users FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own data" 
    ON users FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can update their own data" 
    ON users FOR UPDATE 
    USING (true);

-- Create policies for shifts table
CREATE POLICY "Users can view their own shifts" 
    ON shifts FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own shifts" 
    ON shifts FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can update their own shifts" 
    ON shifts FOR UPDATE 
    USING (true);

CREATE POLICY "Users can delete their own shifts" 
    ON shifts FOR DELETE 
    USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_user_date ON shifts(user_id, shift_date);
```

## After Running SQL

1. Go to the SQL Editor in Supabase
2. Copy and paste the entire SQL code above
3. Click "Run" to execute
4. Verify tables are created by going to Table Editor

The tables are now ready for the app to use!
