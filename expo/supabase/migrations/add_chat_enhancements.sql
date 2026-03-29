-- =====================================================
-- CHAT ENHANCEMENTS MIGRATION
-- Adds: moderation, presence, typing indicators, reactions
-- =====================================================

-- =====================================================
-- 1. MESSAGE MODERATION
-- =====================================================

-- Add moderation fields to event_messages
ALTER TABLE event_messages
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Create banned_users table for chat moderation
CREATE TABLE IF NOT EXISTS chat_banned_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES profiles(id),
  banned_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  expires_at TIMESTAMPTZ,

  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_banned_users_event_id ON chat_banned_users(event_id);
CREATE INDEX IF NOT EXISTS idx_chat_banned_users_user_id ON chat_banned_users(user_id);

-- =====================================================
-- 2. PRESENCE TRACKING
-- =====================================================

-- Create chat_presence table for online users
CREATE TABLE IF NOT EXISTS chat_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_presence_event_id ON chat_presence(event_id);
CREATE INDEX IF NOT EXISTS idx_chat_presence_last_seen ON chat_presence(last_seen_at);

-- =====================================================
-- 3. TYPING INDICATORS
-- =====================================================

-- Create typing_indicators table
CREATE TABLE IF NOT EXISTS chat_typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_typing_indicators_event_id ON chat_typing_indicators(event_id);

-- =====================================================
-- 4. MESSAGE REACTIONS
-- =====================================================

-- Create message_reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES event_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('❤️', '👍', '😂', '🎵', '🔥', '👏')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(message_id, user_id, reaction)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);

-- =====================================================
-- 5. RPC FUNCTIONS
-- =====================================================

-- Function to delete a message (moderation)
CREATE OR REPLACE FUNCTION delete_chat_message(
  p_message_id UUID,
  p_deleted_by UUID,
  p_reason TEXT
) RETURNS JSONB AS $$
DECLARE
  v_message RECORD;
BEGIN
  -- Get message details
  SELECT * INTO v_message FROM event_messages WHERE id = p_message_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Message not found');
  END IF;

  -- Check if user is artist (owner of event)
  IF NOT EXISTS (
    SELECT 1 FROM events
    WHERE id = v_message.event_id AND artist_id = p_deleted_by
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Mark message as deleted
  UPDATE event_messages
  SET
    is_deleted = TRUE,
    deleted_by = p_deleted_by,
    deleted_at = NOW(),
    deletion_reason = p_reason
  WHERE id = p_message_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ban a user from chat
CREATE OR REPLACE FUNCTION ban_chat_user(
  p_event_id UUID,
  p_user_id UUID,
  p_banned_by UUID,
  p_reason TEXT,
  p_duration_minutes INTEGER DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Check if banner is the artist
  IF NOT EXISTS (
    SELECT 1 FROM events
    WHERE id = p_event_id AND artist_id = p_banned_by
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Calculate expiration
  IF p_duration_minutes IS NOT NULL THEN
    v_expires_at := NOW() + (p_duration_minutes || ' minutes')::INTERVAL;
  END IF;

  -- Insert or update ban
  INSERT INTO chat_banned_users (event_id, user_id, banned_by, reason, expires_at)
  VALUES (p_event_id, p_user_id, p_banned_by, p_reason, v_expires_at)
  ON CONFLICT (event_id, user_id)
  DO UPDATE SET
    banned_by = p_banned_by,
    banned_at = NOW(),
    reason = p_reason,
    expires_at = v_expires_at;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update presence
CREATE OR REPLACE FUNCTION update_chat_presence(
  p_event_id UUID,
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO chat_presence (event_id, user_id, last_seen_at)
  VALUES (p_event_id, p_user_id, NOW())
  ON CONFLICT (event_id, user_id)
  DO UPDATE SET last_seen_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to set typing indicator
CREATE OR REPLACE FUNCTION set_typing_indicator(
  p_event_id UUID,
  p_user_id UUID,
  p_is_typing BOOLEAN
) RETURNS VOID AS $$
BEGIN
  IF p_is_typing THEN
    INSERT INTO chat_typing_indicators (event_id, user_id, started_at)
    VALUES (p_event_id, p_user_id, NOW())
    ON CONFLICT (event_id, user_id)
    DO UPDATE SET started_at = NOW();
  ELSE
    DELETE FROM chat_typing_indicators
    WHERE event_id = p_event_id AND user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get online users count
CREATE OR REPLACE FUNCTION get_online_users_count(
  p_event_id UUID
) RETURNS INTEGER AS $$
BEGIN
  -- Users online in last 5 minutes
  RETURN (
    SELECT COUNT(*)
    FROM chat_presence
    WHERE event_id = p_event_id
    AND last_seen_at > NOW() - INTERVAL '5 minutes'
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE chat_banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for chat_banned_users
CREATE POLICY "Artists can view bans for their events" ON chat_banned_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND artist_id = auth.uid()
    )
  );

CREATE POLICY "Artists can ban users" ON chat_banned_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND artist_id = auth.uid()
    )
  );

-- Policies for chat_presence
CREATE POLICY "Users can view presence in events" ON chat_presence
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own presence" ON chat_presence
  FOR ALL USING (user_id = auth.uid());

-- Policies for typing_indicators
CREATE POLICY "Users can view typing indicators" ON chat_typing_indicators
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage own typing indicator" ON chat_typing_indicators
  FOR ALL USING (user_id = auth.uid());

-- Policies for message_reactions
CREATE POLICY "Users can view reactions" ON message_reactions
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can add reactions" ON message_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own reactions" ON message_reactions
  FOR DELETE USING (user_id = auth.uid());

-- Update event_messages policy to hide deleted messages
DROP POLICY IF EXISTS "Users can view event messages" ON event_messages;
CREATE POLICY "Users can view event messages" ON event_messages
  FOR SELECT USING (is_deleted = FALSE);

-- Prevent banned users from sending messages
DROP POLICY IF EXISTS "Users can send messages" ON event_messages;
CREATE POLICY "Users can send messages" ON event_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    NOT EXISTS (
      SELECT 1 FROM chat_banned_users
      WHERE event_id = event_messages.event_id
      AND user_id = auth.uid()
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- =====================================================
-- 7. AUTOMATIC CLEANUP
-- =====================================================

-- Function to cleanup old typing indicators (older than 10 seconds)
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM chat_typing_indicators
  WHERE started_at < NOW() - INTERVAL '10 seconds';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old presence records (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_presence()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM chat_presence
  WHERE last_seen_at < NOW() - INTERVAL '1 hour';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to cleanup on insert (runs periodically)
CREATE TRIGGER trigger_cleanup_typing_indicators
  AFTER INSERT ON chat_typing_indicators
  EXECUTE FUNCTION cleanup_old_typing_indicators();

CREATE TRIGGER trigger_cleanup_presence
  AFTER INSERT ON chat_presence
  EXECUTE FUNCTION cleanup_old_presence();

COMMENT ON TABLE chat_banned_users IS 'Stores banned users per event for chat moderation';
COMMENT ON TABLE chat_presence IS 'Tracks online users in event chats (5min timeout)';
COMMENT ON TABLE chat_typing_indicators IS 'Real-time typing indicators (10s timeout)';
COMMENT ON TABLE message_reactions IS 'Emoji reactions on chat messages';
