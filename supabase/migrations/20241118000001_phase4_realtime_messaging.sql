-- Migration: 20241118000001_phase4_realtime_messaging.sql
-- Description: WebBazaar MVP real-time buyer-seller messaging schema, RLS policies, rate limiting, and Realtime publication.

-- ============================================================================
-- 1. TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT conversations_no_self_messaging CHECK (buyer_id <> seller_id)
);

-- Prevent duplicate active conversations between the same buyer, seller, and listing
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique_active
  ON public.conversations (listing_id, buyer_id, seller_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_conversations_buyer_updated
  ON public.conversations (buyer_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_seller_updated
  ON public.conversations (seller_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_listing_id
  ON public.conversations (listing_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(btrim(body)) >= 1 AND char_length(body) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON public.messages (conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_created
  ON public.messages (sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_unread_lookup
  ON public.messages (conversation_id, sender_id)
  WHERE read_at IS NULL;

-- ============================================================================
-- 2. GRANTS (LEAST PRIVILEGE — AUTHENTICATED ONLY)
-- ============================================================================

REVOKE ALL ON public.conversations FROM anon, public;
REVOKE ALL ON public.messages FROM anon, public;

GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;

-- ============================================================================
-- 3. INTEGRITY, RATE-LIMITING & ACTIVITY TRIGGERS
-- ============================================================================

-- Prevent tampering with immutable columns on conversations
CREATE OR REPLACE FUNCTION public.protect_conversation_immutable_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.listing_id IS DISTINCT FROM OLD.listing_id
     OR NEW.buyer_id IS DISTINCT FROM OLD.buyer_id
     OR NEW.seller_id IS DISTINCT FROM OLD.seller_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Conversation ownership and listing references are immutable.';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_conversation_immutable ON public.conversations;
CREATE TRIGGER trg_protect_conversation_immutable
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_conversation_immutable_columns();

-- Prevent tampering with message content/sender/conversation on UPDATE (read_at only)
CREATE OR REPLACE FUNCTION public.protect_message_immutable_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
     OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.body IS DISTINCT FROM OLD.body
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Message content and metadata cannot be modified.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_message_immutable ON public.messages;
CREATE TRIGGER trg_protect_message_immutable
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_message_immutable_columns();

-- Per-sender message rate limit: max 15 messages per 60 seconds
CREATE OR REPLACE FUNCTION public.enforce_message_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO recent_count
  FROM public.messages
  WHERE sender_id = NEW.sender_id
    AND created_at > (now() - interval '60 seconds');

  IF recent_count >= 15 THEN
    RAISE EXCEPTION 'Rate limit exceeded: please wait a moment before sending more messages.'
      USING ERRCODE = 'P0001';
  END IF;

  -- Trim outer whitespace while preserving intentional internal line breaks
  NEW.body := btrim(NEW.body);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_message_rate_limit ON public.messages;
CREATE TRIGGER trg_enforce_message_rate_limit
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_message_rate_limit();

-- Keep conversations.updated_at synchronized when new messages arrive
CREATE OR REPLACE FUNCTION public.touch_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.touch_conversation_on_message() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_touch_conversation_on_message ON public.messages;
CREATE TRIGGER trg_touch_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_conversation_on_message();

-- ============================================================================
-- 4. TRUSTED SERVER/RPC HELPERS
-- ============================================================================

-- Create or reuse active conversation for an approved listing (derives buyer & seller securely)
CREATE OR REPLACE FUNCTION public.start_or_get_conversation(p_listing_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_buyer_id UUID;
  v_seller_id UUID;
  v_listing_status TEXT;
  v_conversation_id UUID;
BEGIN
  v_buyer_id := auth.uid();
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to start a conversation.' USING ERRCODE = '42501';
  END IF;

  SELECT seller_id, status
  INTO v_seller_id, v_listing_status
  FROM public.listings
  WHERE id = p_listing_id;

  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Listing not found.' USING ERRCODE = 'P0002';
  END IF;

  IF v_listing_status <> 'approved' THEN
    RAISE EXCEPTION 'Conversations can only be initiated for approved listings.' USING ERRCODE = '42501';
  END IF;

  IF v_seller_id = v_buyer_id THEN
    RAISE EXCEPTION 'You cannot start a conversation on your own listing.' USING ERRCODE = '22023';
  END IF;

  -- Reuse existing active conversation if present
  SELECT id
  INTO v_conversation_id
  FROM public.conversations
  WHERE listing_id = p_listing_id
    AND buyer_id = v_buyer_id
    AND seller_id = v_seller_id
    AND status = 'active'
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Insert new conversation safely handling race conditions
  BEGIN
    INSERT INTO public.conversations (listing_id, buyer_id, seller_id, status)
    VALUES (p_listing_id, v_buyer_id, v_seller_id, 'active')
    RETURNING id INTO v_conversation_id;
  EXCEPTION WHEN unique_violation THEN
    SELECT id
    INTO v_conversation_id
    FROM public.conversations
    WHERE listing_id = p_listing_id
      AND buyer_id = v_buyer_id
      AND seller_id = v_seller_id
      AND status = 'active'
    LIMIT 1;
  END;

  RETURN v_conversation_id;
END;
$$;

REVOKE ALL ON FUNCTION public.start_or_get_conversation(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_or_get_conversation(UUID) TO authenticated;

-- Mark incoming unread messages in a conversation as read (SECURITY INVOKER — honors RLS)
CREATE OR REPLACE FUNCTION public.mark_conversation_messages_read(p_conversation_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_updated INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.messages m
  SET read_at = now()
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id <> v_user_id
    AND m.read_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = m.conversation_id
        AND (c.buyer_id = v_user_id OR c.seller_id = v_user_id)
    );

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_conversation_messages_read(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_conversation_messages_read(UUID) TO authenticated;

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations: SELECT
DROP POLICY IF EXISTS "Participants and admins can view conversations" ON public.conversations;
CREATE POLICY "Participants and admins can view conversations"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = buyer_id
    OR (SELECT auth.uid()) = seller_id
    OR public.is_admin((SELECT auth.uid()))
  );

-- Conversations: INSERT (authenticated buyer on approved listing, seller derived from listing, no self-messaging)
DROP POLICY IF EXISTS "Buyers can initiate conversations for approved listings" ON public.conversations;
CREATE POLICY "Buyers can initiate conversations for approved listings"
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = buyer_id
    AND buyer_id <> seller_id
    AND status = 'active'
    AND EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = conversations.listing_id
        AND l.status = 'approved'
        AND l.seller_id = conversations.seller_id
    )
  );

-- Conversations: UPDATE (participants can archive/reactivate own conversation; immutable columns protected by trigger)
DROP POLICY IF EXISTS "Participants can update own conversation status" ON public.conversations;
CREATE POLICY "Participants can update own conversation status"
  ON public.conversations
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = buyer_id
    OR (SELECT auth.uid()) = seller_id
  )
  WITH CHECK (
    ((SELECT auth.uid()) = buyer_id OR (SELECT auth.uid()) = seller_id)
    AND status IN ('active', 'archived')
  );

-- Messages: SELECT (only conversation participants and authorized admins)
DROP POLICY IF EXISTS "Participants and admins can read messages" ON public.messages;
CREATE POLICY "Participants and admins can read messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.buyer_id = (SELECT auth.uid()) OR c.seller_id = (SELECT auth.uid()))
    )
    OR public.is_admin((SELECT auth.uid()))
  );

-- Messages: INSERT (only participants in active conversations, sender_id = auth.uid())
DROP POLICY IF EXISTS "Participants can send messages in active conversations" ON public.messages;
CREATE POLICY "Participants can send messages in active conversations"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND read_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND c.status = 'active'
        AND (c.buyer_id = (SELECT auth.uid()) OR c.seller_id = (SELECT auth.uid()))
    )
  );

-- Messages: UPDATE (only recipient participant can mark incoming message as read)
DROP POLICY IF EXISTS "Recipients can mark received messages as read" ON public.messages;
CREATE POLICY "Recipients can mark received messages as read"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (
    sender_id <> (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.buyer_id = (SELECT auth.uid()) OR c.seller_id = (SELECT auth.uid()))
    )
  )
  WITH CHECK (
    sender_id <> (SELECT auth.uid())
    AND read_at IS NOT NULL
  );

-- ============================================================================
-- 6. SUPABASE REALTIME PUBLICATION
-- ============================================================================

ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END;
$$;
