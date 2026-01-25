-- Add creator_controls_unlocked column to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS creator_controls_unlocked BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_creator_controls_unlocked ON users(creator_controls_unlocked);

-- Add comment
COMMENT ON COLUMN users.creator_controls_unlocked IS 'Whether this user has unlocked creator controls with the code';
