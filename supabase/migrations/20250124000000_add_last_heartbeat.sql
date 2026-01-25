-- Add last_heartbeat for "actively has website open" presence
-- Active = last_heartbeat within ~90 seconds
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_users_last_heartbeat ON users(last_heartbeat);
