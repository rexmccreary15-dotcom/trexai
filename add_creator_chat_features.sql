-- Run in Supabase SQL Editor (one-time).
-- 1) Chats: soft-delete so creator still sees them when user "deletes"
ALTER TABLE chats ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
COMMENT ON COLUMN chats.deleted_at IS 'When set, user has deleted this chat from their list; creator can still see it';

-- 2) Users: display name, API keys per account, default AI
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_ai TEXT DEFAULT 'myai';
COMMENT ON COLUMN users.display_name IS 'Name shown for first-time / profile';
COMMENT ON COLUMN users.api_keys IS 'OpenAI, Gemini, Claude keys stored per account when logged in';
COMMENT ON COLUMN users.default_ai IS 'Default AI model (myai, openai, gemini, claude)';
