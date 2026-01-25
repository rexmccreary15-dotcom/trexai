-- Migration: Add creator_controls_unlocked column to users table
-- Created: 2025-01-24
-- Description: Allows users to unlock Creator Controls with code (requires login)

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS creator_controls_unlocked BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_creator_controls_unlocked ON users(creator_controls_unlocked);

COMMENT ON COLUMN users.creator_controls_unlocked IS 'Whether this user has unlocked creator controls with the code maker15';
