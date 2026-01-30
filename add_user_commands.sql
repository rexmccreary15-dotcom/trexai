-- Store commands per user (logged-in only). Run in Supabase SQL Editor.
-- When logged in, commands load/save from this column; when not, they use sessionStorage only.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS commands JSONB DEFAULT '[]';

COMMENT ON COLUMN users.commands IS 'User slash-commands (e.g. /summarize) - only for authenticated users';
