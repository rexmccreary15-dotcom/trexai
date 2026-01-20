-- Supabase Database Schema for TREXAI
-- Run this in the Supabase SQL Editor

-- Users table: Tracks all users (anonymous and authenticated)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE, -- For anonymous users (browser session)
  email TEXT, -- Optional, for authenticated users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  usage_limit_daily INTEGER DEFAULT NULL, -- NULL = no limit
  usage_limit_hourly INTEGER DEFAULT NULL
);

-- Chats table: Stores chat sessions
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  summary TEXT,
  ai_model TEXT,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_incognito BOOLEAN DEFAULT FALSE
);

-- Messages table: Stores individual messages within chats
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id TEXT REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sequence_number INTEGER NOT NULL -- Order within chat
);

-- Analytics events table: Tracks all user actions for analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'message_sent', 'chat_created', 'model_used', etc.
  ai_model TEXT,
  metadata JSONB, -- Flexible data storage (can store additional info)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creator settings table: Stores all creator control settings
CREATE TABLE IF NOT EXISTS creator_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL, -- 'branding', 'moderation', 'ai_config', etc.
  setting_value JSONB NOT NULL, -- Flexible JSON storage for any settings
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sequence ON messages(chat_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Allow users to read their own data (by session_id)
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (session_id = current_setting('app.session_id', true));

-- Allow service role to do everything (for admin operations)
CREATE POLICY "Service role full access" ON users
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for chats table
-- Allow users to read/write their own chats
CREATE POLICY "Users can manage own chats" ON chats
  FOR ALL
  USING (
    user_id IN (
      SELECT id FROM users WHERE session_id = current_setting('app.session_id', true)
    )
  );

-- Allow service role full access
CREATE POLICY "Service role full access chats" ON chats
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for messages table
-- Allow users to read/write messages in their own chats
CREATE POLICY "Users can manage own messages" ON messages
  FOR ALL
  USING (
    chat_id IN (
      SELECT id FROM chats WHERE user_id IN (
        SELECT id FROM users WHERE session_id = current_setting('app.session_id', true)
      )
    )
  );

-- Allow service role full access
CREATE POLICY "Service role full access messages" ON messages
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for analytics_events table
-- Allow users to insert their own events
CREATE POLICY "Users can insert own events" ON analytics_events
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE session_id = current_setting('app.session_id', true)
    )
  );

-- Allow service role to read everything (for analytics)
CREATE POLICY "Service role can read all events" ON analytics_events
  FOR SELECT
  USING (auth.role() = 'service_role');

-- RLS Policies for creator_settings table
-- Only service role can access (admin only)
CREATE POLICY "Service role only" ON creator_settings
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at on chats
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to auto-update updated_at on creator_settings
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON creator_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
