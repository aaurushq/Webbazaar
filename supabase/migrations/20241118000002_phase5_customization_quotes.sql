-- Migration: 20241118000002_phase5_customization_quotes.sql
-- Description: WebBazaar MVP customization requests, versioned seller quotations, strict RLS hardening, audited admin moderation access, and Realtime publication.

-- ============================================================================
-- 1. HARDEN EXISTING MESSAGING RLS (RESTRICT ADMIN TO AUDITED MODERATION RPC)
-- ============================================================================

ALTER POLICY "Participants and admins can view conversations"
  ON public.conversations
  USING (
    (SELECT auth.uid()) = buyer_id
    OR (SELECT auth.uid()) = seller_id
  );

ALTER POLICY "Participants and admins can read messages"
  ON public.messages
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.buyer_id = (SELECT auth.uid()) OR c.seller_id = (SELECT auth.uid()))
    )
  );

-- ============================================================================
-- 2. CUSTOMIZATION REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customization_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(btrim(title)) >= 5 AND char_length(title) <= 140),
  requirements TEXT NOT NULL CHECK (char_length(btrim(requirements)) >= 15 AND char_length(requirements) <= 4000),
  requested_features TEXT[] NOT NULL DEFAULT '{}',
  optional_budget BIGINT CHECK (optional_budget IS NULL OR optional_budget >= 0),
  desired_delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'discussing', 'quoted', 'cancelled', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT customization_requests_no_self CHECK (buyer_id <> seller_id)
);

CREATE INDEX IF NOT EXISTS idx_cust_req_conversation
  ON public.customization_requests (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cust_req_buyer_status
  ON public.customization_requests (buyer_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_cust_req_seller_status
  ON public.customization_requests (seller_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_cust_req_listing
  ON public.customization_requests (listing_id);

-- ============================================================================
-- 3. QUOTES TABLE (PRECISE INTEGER INR MONETARY REPRESENTATION)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customization_request_id UUID NOT NULL REFERENCES public.customization_requests(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  base_product_price BIGINT NOT NULL CHECK (base_product_price >= 0),
  customization_price BIGINT NOT NULL CHECK (customization_price >= 0),
  total_price BIGINT NOT NULL CHECK (total_price = base_product_price + customization_price),
  scope_of_work TEXT NOT NULL CHECK (char_length(btrim(scope_of_work)) >= 15 AND char_length(scope_of_work) <= 4000),
  estimated_delivery_days INTEGER NOT NULL CHECK (estimated_delivery_days >= 1 AND estimated_delivery_days <= 365),
  revision_policy TEXT NOT NULL CHECK (char_length(btrim(revision_policy)) >= 3 AND char_length(revision_policy) <= 500),
  payment_terms TEXT NOT NULL CHECK (char_length(btrim(payment_terms)) >= 5 AND char_length(payment_terms) <= 1000),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'withdrawn', 'expired')),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT quotes_no_self CHECK (seller_id <> buyer_id),
  CONSTRAINT quotes_valid_expiry CHECK (expires_at > created_at)
);

-- Monotonic version per request
CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_request_version
  ON public.quotes (customization_request_id, version);

-- Guarantee at most ONE accepted quote per customization request (prevents duplicate acceptance)
CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_single_accepted_per_request
  ON public.quotes (customization_request_id)
  WHERE status = 'accepted';

CREATE INDEX IF NOT EXISTS idx_quotes_request_created
  ON public.quotes (customization_request_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quotes_buyer_status
  ON public.quotes (buyer_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quotes_seller_status
  ON public.quotes (seller_id, status, created_at DESC);

-- ============================================================================
-- 4. LEAST-PRIVILEGE GRANTS
-- ============================================================================

REVOKE ALL ON public.customization_requests FROM anon, public;
REVOKE ALL ON public.quotes FROM anon, public;

GRANT SELECT, INSERT, UPDATE ON public.customization_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.quotes TO authenticated;

-- ============================================================================
-- 5. INTEGRITY, ANTI-SPAM & STATE-MACHINE TRIGGERS
-- ============================================================================

-- Anti-spam & normalization on customization_requests INSERT
CREATE OR REPLACE FUNCTION public.enforce_customization_request_guardrails()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  recent_buyer_requests INTEGER;
  open_conv_requests INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO recent_buyer_requests
  FROM public.customization_requests
  WHERE buyer_id = NEW.buyer_id
    AND created_at > (now() - interval '10 minutes');

  IF recent_buyer_requests >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: please wait before submitting more customization requests.'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT COUNT(*)
  INTO open_conv_requests
  FROM public.customization_requests
  WHERE conversation_id = NEW.conversation_id
    AND status IN ('submitted', 'discussing', 'quoted');

  IF open_conv_requests >= 5 THEN
    RAISE EXCEPTION 'Too many active customization requests on this conversation.'
      USING ERRCODE = 'P0001';
  END IF;

  NEW.title := btrim(NEW.title);
  NEW.requirements := btrim(NEW.requirements);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_customization_request_guardrails
  BEFORE INSERT ON public.customization_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_customization_request_guardrails();

-- Protect customization_requests ownership & enforce eligible edits
CREATE OR REPLACE FUNCTION public.protect_customization_request_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_actor UUID;
BEGIN
  v_actor := auth.uid();

  IF NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
     OR NEW.listing_id IS DISTINCT FROM OLD.listing_id
     OR NEW.buyer_id IS DISTINCT FROM OLD.buyer_id
     OR NEW.seller_id IS DISTINCT FROM OLD.seller_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Customization request ownership and references are immutable.'
      USING ERRCODE = '42501';
  END IF;

  IF current_setting('app.internal_quote_sync', true) = 'on' THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- If an authenticated user is editing content fields directly (not system trigger), enforce buyer-only eligible status
  IF v_actor IS NOT NULL THEN
    IF NEW.title IS DISTINCT FROM OLD.title
       OR NEW.requirements IS DISTINCT FROM OLD.requirements
       OR NEW.requested_features IS DISTINCT FROM OLD.requested_features
       OR NEW.optional_budget IS DISTINCT FROM OLD.optional_budget
       OR NEW.desired_delivery_date IS DISTINCT FROM OLD.desired_delivery_date THEN
      IF v_actor <> OLD.buyer_id THEN
        RAISE EXCEPTION 'Only the buyer can edit customization request details.'
          USING ERRCODE = '42501';
      END IF;
      IF OLD.status NOT IN ('submitted', 'discussing') THEN
        RAISE EXCEPTION 'Customization requests can only be edited while submitted or under discussion.'
          USING ERRCODE = '42501';
      END IF;
    END IF;

    -- Seller may only mark a submitted request as discussing directly
    IF v_actor = OLD.seller_id AND NEW.status IS DISTINCT FROM OLD.status THEN
      IF NOT (OLD.status = 'submitted' AND NEW.status = 'discussing') THEN
        RAISE EXCEPTION 'Sellers can only transition submitted requests to discussing directly.'
          USING ERRCODE = '42501';
      END IF;
    END IF;

    -- Buyer may only cancel eligible requests directly
    IF v_actor = OLD.buyer_id AND NEW.status IS DISTINCT FROM OLD.status THEN
      IF NOT (OLD.status IN ('submitted', 'discussing', 'quoted') AND NEW.status = 'cancelled') THEN
        RAISE EXCEPTION 'Buyers can only cancel open customization requests.'
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;

  NEW.title := btrim(NEW.title);
  NEW.requirements := btrim(NEW.requirements);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_customization_request_updates
  BEFORE UPDATE ON public.customization_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_customization_request_updates();

-- Touch conversation updated_at when a customization request is created
CREATE OR REPLACE FUNCTION public.touch_conversation_on_request()
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

REVOKE ALL ON FUNCTION public.touch_conversation_on_request() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_touch_conversation_on_request
  AFTER INSERT ON public.customization_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_conversation_on_request();

-- Server-side quote total calculation, version assignment, and spam guard on INSERT
CREATE OR REPLACE FUNCTION public.prepare_new_quote()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  recent_quotes INTEGER;
  has_accepted BOOLEAN;
  next_version INTEGER;
  expected_total BIGINT;
BEGIN
  SELECT COUNT(*)
  INTO recent_quotes
  FROM public.quotes
  WHERE seller_id = NEW.seller_id
    AND created_at > (now() - interval '10 minutes');

  IF recent_quotes >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: please wait before creating more quotations.'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.quotes
    WHERE customization_request_id = NEW.customization_request_id
      AND status = 'accepted'
  ) INTO has_accepted;

  IF has_accepted THEN
    RAISE EXCEPTION 'This customization request already has an accepted quotation.'
      USING ERRCODE = '22023';
  END IF;

  -- Reject forged total_price and compute server-side
  expected_total := NEW.base_product_price + NEW.customization_price;
  IF NEW.total_price IS NOT NULL AND NEW.total_price <> expected_total THEN
    RAISE EXCEPTION 'Quotation total_price cannot be forged (expected %, received %).', expected_total, NEW.total_price
      USING ERRCODE = '22023';
  END IF;
  NEW.total_price := expected_total;

  -- Monotonic version per request
  SELECT COALESCE(MAX(version), 0) + 1
  INTO next_version
  FROM public.quotes
  WHERE customization_request_id = NEW.customization_request_id;
  NEW.version := next_version;

  NEW.scope_of_work := btrim(NEW.scope_of_work);
  NEW.revision_policy := btrim(NEW.revision_policy);
  NEW.payment_terms := btrim(NEW.payment_terms);
  NEW.accepted_at := NULL;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prepare_new_quote
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.prepare_new_quote();

-- Enforce strict immutability on accepted/sent quotes & authorized state transitions on UPDATE
CREATE OR REPLACE FUNCTION public.enforce_quote_immutability_and_transitions()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_actor UUID;
BEGIN
  v_actor := auth.uid();

  -- Accepted quotes are strictly immutable forever
  IF OLD.status = 'accepted' THEN
    RAISE EXCEPTION 'Accepted quotations are immutable and cannot be modified.'
      USING ERRCODE = '42501';
  END IF;

  -- Terminal statuses cannot be mutated
  IF OLD.status IN ('declined', 'withdrawn', 'expired') THEN
    RAISE EXCEPTION 'Terminal quotations (%) cannot be modified.', OLD.status
      USING ERRCODE = '42501';
  END IF;

  -- Ownership and identity columns are always immutable
  IF NEW.customization_request_id IS DISTINCT FROM OLD.customization_request_id
     OR NEW.version IS DISTINCT FROM OLD.version
     OR NEW.seller_id IS DISTINCT FROM OLD.seller_id
     OR NEW.buyer_id IS DISTINCT FROM OLD.buyer_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Quotation ownership and version metadata cannot be modified.'
      USING ERRCODE = '42501';
  END IF;

  IF current_setting('app.internal_quote_sync', true) = 'on' THEN
    RETURN NEW;
  END IF;

  -- Once sent, all commercial terms are immutable (revisions require creating a new quote version)
  IF OLD.status = 'sent' THEN
    IF NEW.base_product_price IS DISTINCT FROM OLD.base_product_price
       OR NEW.customization_price IS DISTINCT FROM OLD.customization_price
       OR NEW.total_price IS DISTINCT FROM OLD.total_price
       OR NEW.scope_of_work IS DISTINCT FROM OLD.scope_of_work
       OR NEW.estimated_delivery_days IS DISTINCT FROM OLD.estimated_delivery_days
       OR NEW.revision_policy IS DISTINCT FROM OLD.revision_policy
       OR NEW.payment_terms IS DISTINCT FROM OLD.payment_terms
       OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
      RAISE EXCEPTION 'Sent quotation terms cannot be edited. Withdraw and send a revised quotation version instead.'
        USING ERRCODE = '42501';
    END IF;
  ELSE
    -- Draft quote recomputes total_price server-side
    NEW.total_price := NEW.base_product_price + NEW.customization_price;
  END IF;

  -- Role-bound transition validation for authenticated callers
  IF v_actor IS NOT NULL AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status IN ('accepted', 'declined') THEN
      IF v_actor <> OLD.buyer_id THEN
        RAISE EXCEPTION 'Only the buyer can accept or decline a quotation.'
          USING ERRCODE = '42501';
      END IF;
      IF OLD.status <> 'sent' THEN
        RAISE EXCEPTION 'Only sent quotations can be accepted or declined.'
          USING ERRCODE = '22023';
      END IF;
      IF NEW.status = 'accepted' AND OLD.expires_at <= now() THEN
        RAISE EXCEPTION 'Cannot accept an expired quotation.'
          USING ERRCODE = '22023';
      END IF;
    ELSIF NEW.status = 'withdrawn' THEN
      IF v_actor <> OLD.seller_id THEN
        RAISE EXCEPTION 'Only the seller can withdraw a quotation.'
          USING ERRCODE = '42501';
      END IF;
    ELSIF NEW.status = 'sent' THEN
      IF v_actor <> OLD.seller_id OR OLD.status <> 'draft' THEN
        RAISE EXCEPTION 'Only the seller can send a draft quotation.'
          USING ERRCODE = '42501';
      END IF;
    ELSIF NEW.status = 'expired' THEN
      IF OLD.expires_at > now() THEN
        RAISE EXCEPTION 'Quotation has not reached its expiration timestamp yet.'
          USING ERRCODE = '22023';
      END IF;
    END IF;
  END IF;

  IF NEW.status = 'accepted' THEN
    NEW.accepted_at := now();
  ELSE
    NEW.accepted_at := OLD.accepted_at;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_quote_immutability_and_transitions
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_quote_immutability_and_transitions();

-- Synchronize customization_request status & conversation updated_at when quotes change
CREATE OR REPLACE FUNCTION public.sync_request_on_quote_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv_id UUID;
BEGIN
  PERFORM set_config('app.internal_quote_sync', 'on', true);

  SELECT conversation_id INTO v_conv_id
  FROM public.customization_requests
  WHERE id = NEW.customization_request_id;

  IF NEW.status = 'sent' THEN
    UPDATE public.customization_requests
    SET status = 'quoted', updated_at = now()
    WHERE id = NEW.customization_request_id
      AND status IN ('submitted', 'discussing');
  ELSIF NEW.status = 'accepted' THEN
    -- Withdraw any other pending quotes for the same request
    UPDATE public.quotes
    SET status = 'withdrawn'
    WHERE customization_request_id = NEW.customization_request_id
      AND id <> NEW.id
      AND status IN ('draft', 'sent');

    UPDATE public.customization_requests
    SET status = 'closed', updated_at = now()
    WHERE id = NEW.customization_request_id;
  ELSIF NEW.status = 'declined' THEN
    UPDATE public.customization_requests
    SET status = 'discussing', updated_at = now()
    WHERE id = NEW.customization_request_id
      AND status = 'quoted';
  END IF;

  IF v_conv_id IS NOT NULL THEN
    UPDATE public.conversations
    SET updated_at = now()
    WHERE id = v_conv_id;
  END IF;

  PERFORM set_config('app.internal_quote_sync', 'off', true);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_request_on_quote_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_sync_request_on_quote_change
  AFTER INSERT OR UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_request_on_quote_change();

-- ============================================================================
-- 6. TRUSTED RPC HELPERS (SECURITY INVOKER FOR BUYER/SELLER; AUDITED FOR ADMIN)
-- ============================================================================

-- Buyer creates customization request inside an active conversation
CREATE OR REPLACE FUNCTION public.create_customization_request(
  p_conversation_id UUID,
  p_title TEXT,
  p_requirements TEXT,
  p_requested_features TEXT[] DEFAULT '{}',
  p_optional_budget BIGINT DEFAULT NULL,
  p_desired_delivery_date DATE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_buyer_id UUID;
  v_seller_id UUID;
  v_listing_id UUID;
  v_conv_status TEXT;
  v_listing_status TEXT;
  v_request_id UUID;
BEGIN
  v_buyer_id := auth.uid();
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '42501';
  END IF;

  SELECT c.seller_id, c.listing_id, c.status, l.status
  INTO v_seller_id, v_listing_id, v_conv_status, v_listing_status
  FROM public.conversations c
  JOIN public.listings l ON l.id = c.listing_id
  WHERE c.id = p_conversation_id
    AND c.buyer_id = v_buyer_id;

  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Conversation not found or you are not the buyer on this conversation.'
      USING ERRCODE = '42501';
  END IF;

  IF v_conv_status <> 'active' THEN
    RAISE EXCEPTION 'Customization requests can only be submitted in active conversations.'
      USING ERRCODE = '22023';
  END IF;

  IF v_listing_status <> 'approved' THEN
    RAISE EXCEPTION 'Customization requests can only be submitted for approved listings.'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.customization_requests (
    conversation_id,
    listing_id,
    buyer_id,
    seller_id,
    title,
    requirements,
    requested_features,
    optional_budget,
    desired_delivery_date,
    status
  )
  VALUES (
    p_conversation_id,
    v_listing_id,
    v_buyer_id,
    v_seller_id,
    p_title,
    p_requirements,
    COALESCE(p_requested_features, '{}'),
    p_optional_budget,
    p_desired_delivery_date,
    'submitted'
  )
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_customization_request(UUID, TEXT, TEXT, TEXT[], BIGINT, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_customization_request(UUID, TEXT, TEXT, TEXT[], BIGINT, DATE) TO authenticated;

-- Seller creates & sends a versioned quotation (server-side total calculation)
CREATE OR REPLACE FUNCTION public.create_seller_quote(
  p_customization_request_id UUID,
  p_base_product_price BIGINT,
  p_customization_price BIGINT,
  p_scope_of_work TEXT,
  p_estimated_delivery_days INTEGER,
  p_revision_policy TEXT,
  p_payment_terms TEXT,
  p_valid_days INTEGER DEFAULT 7,
  p_status TEXT DEFAULT 'sent'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_seller_id UUID;
  v_buyer_id UUID;
  v_req_status TEXT;
  v_quote_id UUID;
  v_total_price BIGINT;
  v_valid_days INTEGER;
BEGIN
  v_seller_id := auth.uid();
  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '42501';
  END IF;

  IF p_status NOT IN ('draft', 'sent') THEN
    RAISE EXCEPTION 'New quotations must be created as draft or sent.' USING ERRCODE = '22023';
  END IF;

  IF p_base_product_price < 0 OR p_customization_price < 0 THEN
    RAISE EXCEPTION 'Quotation prices must be non-negative INR amounts.' USING ERRCODE = '22023';
  END IF;

  v_valid_days := GREATEST(1, LEAST(COALESCE(p_valid_days, 7), 90));
  v_total_price := p_base_product_price + p_customization_price;

  SELECT buyer_id, status
  INTO v_buyer_id, v_req_status
  FROM public.customization_requests
  WHERE id = p_customization_request_id
    AND seller_id = v_seller_id;

  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Customization request not found or you are not the listing seller.'
      USING ERRCODE = '42501';
  END IF;

  IF v_req_status NOT IN ('submitted', 'discussing', 'quoted') THEN
    RAISE EXCEPTION 'Cannot quote a closed or cancelled customization request.'
      USING ERRCODE = '22023';
  END IF;

  -- If sending a revised offer, withdraw prior active sent offers on the same request
  IF p_status = 'sent' THEN
    UPDATE public.quotes
    SET status = 'withdrawn'
    WHERE customization_request_id = p_customization_request_id
      AND seller_id = v_seller_id
      AND status = 'sent';
  END IF;

  INSERT INTO public.quotes (
    customization_request_id,
    seller_id,
    buyer_id,
    base_product_price,
    customization_price,
    total_price,
    scope_of_work,
    estimated_delivery_days,
    revision_policy,
    payment_terms,
    status,
    expires_at
  )
  VALUES (
    p_customization_request_id,
    v_seller_id,
    v_buyer_id,
    p_base_product_price,
    p_customization_price,
    v_total_price,
    p_scope_of_work,
    p_estimated_delivery_days,
    p_revision_policy,
    p_payment_terms,
    p_status,
    now() + make_interval(days => v_valid_days)
  )
  RETURNING id INTO v_quote_id;

  RETURN v_quote_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_seller_quote(UUID, BIGINT, BIGINT, TEXT, INTEGER, TEXT, TEXT, INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_seller_quote(UUID, BIGINT, BIGINT, TEXT, INTEGER, TEXT, TEXT, INTEGER, TEXT) TO authenticated;

-- Buyer responds to a sent quotation (accept or decline) with expiration and duplicate-action safety
CREATE OR REPLACE FUNCTION public.respond_to_quote(
  p_quote_id UUID,
  p_decision TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_buyer_id UUID;
  v_quote RECORD;
BEGIN
  v_buyer_id := auth.uid();
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '42501';
  END IF;

  IF p_decision NOT IN ('accepted', 'declined') THEN
    RAISE EXCEPTION 'Decision must be accepted or declined.' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_quote
  FROM public.quotes
  WHERE id = p_quote_id
  FOR UPDATE;

  IF v_quote.id IS NULL THEN
    RAISE EXCEPTION 'Quotation not found or access denied.' USING ERRCODE = '42501';
  END IF;

  IF v_quote.buyer_id <> v_buyer_id THEN
    RAISE EXCEPTION 'Only the buyer can accept or decline this quotation.' USING ERRCODE = '42501';
  END IF;

  IF v_quote.status = 'accepted' THEN
    RAISE EXCEPTION 'This quotation has already been accepted.' USING ERRCODE = '22023';
  END IF;

  IF v_quote.status <> 'sent' THEN
    RAISE EXCEPTION 'Only active sent quotations can be responded to (current status: %).', v_quote.status
      USING ERRCODE = '22023';
  END IF;

  IF p_decision = 'accepted' AND v_quote.expires_at <= now() THEN
    UPDATE public.quotes SET status = 'expired' WHERE id = p_quote_id;
    RAISE EXCEPTION 'This quotation has expired and can no longer be accepted.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.quotes
  SET status = p_decision
  WHERE id = p_quote_id;

  RETURN p_decision;
END;
$$;

REVOKE ALL ON FUNCTION public.respond_to_quote(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.respond_to_quote(UUID, TEXT) TO authenticated;

-- Audited Admin Moderation Inspection RPC (replaces unrestricted admin private-chat browsing)
CREATE OR REPLACE FUNCTION public.admin_inspect_conversation_for_moderation(
  p_conversation_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_result JSONB;
BEGIN
  v_admin_id := auth.uid();
  IF v_admin_id IS NULL OR NOT public.is_admin(v_admin_id) THEN
    RAISE EXCEPTION 'Administrator moderation authorization required.' USING ERRCODE = '42501';
  END IF;

  IF p_reason IS NULL OR char_length(btrim(p_reason)) < 10 THEN
    RAISE EXCEPTION 'A detailed moderation reason (min 10 chars) is required for audit compliance.'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, details)
  VALUES (
    v_admin_id,
    'moderation_inspect_conversation',
    'conversation',
    p_conversation_id::TEXT,
    jsonb_build_object('reason', btrim(p_reason))
  );

  SELECT jsonb_build_object(
    'conversation', (SELECT to_jsonb(c) FROM public.conversations c WHERE c.id = p_conversation_id),
    'messages', COALESCE((SELECT jsonb_agg(to_jsonb(m) ORDER BY m.created_at ASC) FROM public.messages m WHERE m.conversation_id = p_conversation_id), '[]'::JSONB),
    'customization_requests', COALESCE((SELECT jsonb_agg(to_jsonb(cr) ORDER BY cr.created_at DESC) FROM public.customization_requests cr WHERE cr.conversation_id = p_conversation_id), '[]'::JSONB)
  )
  INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_inspect_conversation_for_moderation(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_inspect_conversation_for_moderation(UUID, TEXT) TO authenticated;

-- ============================================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE public.customization_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- customization_requests: SELECT (participants only)
CREATE POLICY "Participants can view customization requests"
  ON public.customization_requests
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = buyer_id
    OR (SELECT auth.uid()) = seller_id
  );

-- customization_requests: INSERT (buyer only on own active conversation for approved listing)
CREATE POLICY "Buyers can create customization requests"
  ON public.customization_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = buyer_id
    AND buyer_id <> seller_id
    AND status = 'submitted'
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.listings l ON l.id = c.listing_id
      WHERE c.id = customization_requests.conversation_id
        AND c.status = 'active'
        AND c.buyer_id = (SELECT auth.uid())
        AND c.seller_id = customization_requests.seller_id
        AND c.listing_id = customization_requests.listing_id
        AND l.status = 'approved'
    )
  );

-- customization_requests: UPDATE (buyer edits/cancels own eligible request; seller marks discussing)
CREATE POLICY "Participants can update eligible customization requests"
  ON public.customization_requests
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = buyer_id
    OR (SELECT auth.uid()) = seller_id
  )
  WITH CHECK (
    ((SELECT auth.uid()) = buyer_id AND status IN ('submitted', 'discussing', 'cancelled'))
    OR ((SELECT auth.uid()) = seller_id AND status = 'discussing')
  );

-- quotes: SELECT (seller sees all own quotes; buyer sees sent/terminal quotes, never unfinished drafts)
CREATE POLICY "Participants can view quotations"
  ON public.quotes
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = seller_id
    OR ((SELECT auth.uid()) = buyer_id AND status <> 'draft')
  );

-- quotes: INSERT (seller only on own open customization request; total_price verified)
CREATE POLICY "Sellers can create quotations for own requests"
  ON public.quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = seller_id
    AND seller_id <> buyer_id
    AND status IN ('draft', 'sent')
    AND total_price = base_product_price + customization_price
    AND EXISTS (
      SELECT 1
      FROM public.customization_requests cr
      WHERE cr.id = quotes.customization_request_id
        AND cr.seller_id = (SELECT auth.uid())
        AND cr.buyer_id = quotes.buyer_id
        AND cr.status IN ('submitted', 'discussing', 'quoted')
    )
  );

-- quotes: UPDATE (strict participant-bound transitions; immutability enforced in trigger)
CREATE POLICY "Participants can update permitted quotation statuses"
  ON public.quotes
  FOR UPDATE
  TO authenticated
  USING (
    ((SELECT auth.uid()) = seller_id AND status IN ('draft', 'sent'))
    OR ((SELECT auth.uid()) = buyer_id AND status = 'sent')
  )
  WITH CHECK (
    ((SELECT auth.uid()) = seller_id AND status IN ('draft', 'sent', 'withdrawn'))
    OR ((SELECT auth.uid()) = buyer_id AND status IN ('accepted', 'declined', 'expired'))
  );

-- ============================================================================
-- 8. SUPABASE REALTIME PUBLICATION
-- ============================================================================

ALTER TABLE public.customization_requests REPLICA IDENTITY FULL;
ALTER TABLE public.quotes REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'customization_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.customization_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'quotes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
  END IF;
END;
$$;
