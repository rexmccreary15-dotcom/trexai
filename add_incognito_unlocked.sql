-- Add incognito_unlocked column to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS incognito_unlocked BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_incognito_unlocked ON users(incognito_unlocked);

COMMENT ON COLUMN users.incognito_unlocked IS 'Whether this user has unlocked incognito mode with the code incog25';
