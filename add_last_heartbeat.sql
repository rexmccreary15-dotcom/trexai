-- Run in Supabase SQL Editor: Creator Controls > User Management "Active" status
-- Active = last_heartbeat within 90 seconds (website open). Otherwise Inactive.

ALTER TABLE users ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_users_last_heartbeat ON users(last_heartbeat);
