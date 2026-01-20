-- Add auth_user_id column to users table for Supabase Auth integration
-- Run this in Supabase SQL Editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- Add comment
COMMENT ON COLUMN users.auth_user_id IS 'Supabase Auth user ID (from auth.users table)';
