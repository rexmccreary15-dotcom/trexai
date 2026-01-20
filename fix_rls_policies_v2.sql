-- Fix RLS Policies (Safe version - handles existing policies)
-- Run this in Supabase SQL Editor

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Service role can insert events" ON analytics_events;
DROP POLICY IF EXISTS "Users can insert own events" ON analytics_events;
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Service role full access chats" ON chats;
DROP POLICY IF EXISTS "Service role full access messages" ON messages;

-- Create a new policy that allows service role to insert analytics events
CREATE POLICY "Service role can insert events" ON analytics_events
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Also allow users to insert their own events (for future use)
CREATE POLICY "Users can insert own events" ON analytics_events
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE session_id = current_setting('app.session_id', true)
    )
  );

-- Ensure service role can do everything on users table
CREATE POLICY "Service role full access" ON users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Ensure service role can do everything on chats table  
CREATE POLICY "Service role full access chats" ON chats
  FOR ALL
  USING (auth.role() = 'service_role');

-- Ensure service role can do everything on messages table
CREATE POLICY "Service role full access messages" ON messages
  FOR ALL
  USING (auth.role() = 'service_role');
