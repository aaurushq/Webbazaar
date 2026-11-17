-- ====================================================================
-- WebBazaar Phase 2: Authentication, User Profiles, Role Management,
-- Seller Onboarding & Audit Logging Migrations
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_path TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

-- 2. USER ROLES TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('BUYER', 'SELLER_APPLICANT', 'VERIFIED_SELLER', 'ADMIN')),
  granted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  granted_by UUID REFERENCES public.profiles(id),
  CONSTRAINT uq_user_roles UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Helper function: Check if current authenticated user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = check_role
  );
$$;

-- Helper function: Check if current authenticated session is an Administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- 3. AUTOMATIC PROFILE & DEFAULT ROLE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_name TEXT;
BEGIN
  -- Derive initial display name from user metadata or email prefix
  default_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Insert profile
  INSERT INTO public.profiles (id, display_name, avatar_path)
  VALUES (
    NEW.id,
    default_name,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      updated_at = now();

  -- Assign default BUYER role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'BUYER')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. SELLER APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.seller_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  seller_type TEXT NOT NULL CHECK (seller_type IN ('individual', 'developer', 'agency', 'business')),
  portfolio_url TEXT NOT NULL,
  professional_bio TEXT NOT NULL,
  product_categories TEXT[] NOT NULL DEFAULT '{}',
  country TEXT NOT NULL DEFAULT 'India',
  contact_email TEXT NOT NULL,
  terms_agreed BOOLEAN NOT NULL DEFAULT FALSE CHECK (terms_agreed = TRUE),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_seller_apps_user_id ON public.seller_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_apps_status ON public.seller_applications(status);

-- 5. SELLER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  store_name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  seller_type TEXT NOT NULL CHECK (seller_type IN ('individual', 'developer', 'agency', 'business')),
  bio TEXT,
  portfolio_url TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  application_id UUID REFERENCES public.seller_applications(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_seller_profiles_handle ON public.seller_profiles(handle);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_is_verified ON public.seller_profiles(is_verified);

-- 6. SELLER VERIFICATION EVENTS
CREATE TABLE IF NOT EXISTS public.seller_verification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.seller_applications(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('submitted', 'moved_to_review', 'approved', 'rejected', 'suspended', 'reinstated')),
  actor_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verification_events_app_id ON public.seller_verification_events(application_id);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 8. CONTROLLED STORED PROCEDURE FOR ADMIN SELLER APPLICATION REVIEW
CREATE OR REPLACE FUNCTION public.admin_process_seller_application(
  target_app_id UUID,
  new_status TEXT,
  admin_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_app RECORD;
  sanitized_handle TEXT;
BEGIN
  -- Strict permission check: Actor must be an Admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Administrator privileges required to process seller applications.';
  END IF;

  -- Validate target status
  IF new_status NOT IN ('under_review', 'approved', 'rejected', 'suspended') THEN
    RAISE EXCEPTION 'Invalid status transition: %', new_status;
  END IF;

  -- Fetch existing application
  SELECT * INTO current_app
  FROM public.seller_applications
  WHERE id = target_app_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seller application not found: %', target_app_id;
  END IF;

  -- Update application record
  UPDATE public.seller_applications
  SET status = new_status,
      rejection_reason = CASE WHEN new_status = 'rejected' THEN admin_reason ELSE rejection_reason END,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  WHERE id = target_app_id;

  -- Process State Changes
  IF new_status = 'approved' THEN
    -- Generate unique slug handle from store name
    sanitized_handle := lower(regexp_replace(current_app.store_name, '[^a-zA-Z0-9]', '', 'g'));
    IF sanitized_handle = '' THEN
      sanitized_handle := 'seller_' || substr(current_app.user_id::text, 1, 8);
    END IF;

    -- Upsert seller profile
    INSERT INTO public.seller_profiles (
      user_id,
      store_name,
      handle,
      seller_type,
      bio,
      portfolio_url,
      country,
      is_verified,
      status,
      application_id,
      approved_by,
      approved_at
    )
    VALUES (
      current_app.user_id,
      current_app.store_name,
      sanitized_handle || '_' || substr(gen_random_uuid()::text, 1, 4),
      current_app.seller_type,
      current_app.professional_bio,
      current_app.portfolio_url,
      current_app.country,
      TRUE,
      'active',
      target_app_id,
      auth.uid(),
      now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET is_verified = TRUE,
        status = 'active',
        store_name = EXCLUDED.store_name,
        bio = EXCLUDED.bio,
        approved_by = auth.uid(),
        approved_at = now(),
        updated_at = now();

    -- Grant VERIFIED_SELLER role and remove SELLER_APPLICANT
    INSERT INTO public.user_roles (user_id, role, granted_by)
    VALUES (current_app.user_id, 'VERIFIED_SELLER', auth.uid())
    ON CONFLICT (user_id, role) DO NOTHING;

    DELETE FROM public.user_roles
    WHERE user_id = current_app.user_id AND role = 'SELLER_APPLICANT';

  ELSIF new_status = 'suspended' THEN
    -- Deactivate seller profile
    UPDATE public.seller_profiles
    SET is_verified = FALSE,
        status = 'suspended',
        updated_at = now()
    WHERE user_id = current_app.user_id;

    -- Revoke VERIFIED_SELLER role
    DELETE FROM public.user_roles
    WHERE user_id = current_app.user_id AND role = 'VERIFIED_SELLER';

  ELSIF new_status = 'rejected' THEN
    -- Revoke seller applicant role
    DELETE FROM public.user_roles
    WHERE user_id = current_app.user_id AND role = 'SELLER_APPLICANT';
  END IF;

  -- Record Verification Event
  INSERT INTO public.seller_verification_events (
    seller_id,
    application_id,
    event_type,
    actor_id,
    notes
  )
  SELECT
    sp.id,
    target_app_id,
    new_status,
    auth.uid(),
    admin_reason
  FROM public.seller_applications sa
  LEFT JOIN public.seller_profiles sp ON sp.user_id = sa.user_id
  WHERE sa.id = target_app_id;

  -- Record Audit Log
  INSERT INTO public.audit_logs (
    actor_id,
    action,
    target_type,
    target_id,
    details
  )
  VALUES (
    auth.uid(),
    'SELLER_APPLICATION_' || upper(new_status),
    'seller_application',
    target_app_id::text,
    jsonb_build_object(
      'user_id', current_app.user_id,
      'store_name', current_app.store_name,
      'reason', admin_reason
    )
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'application_id', target_app_id,
    'status', new_status
  );
END;
$$;

-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_verification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User Roles Policies
CREATE POLICY "Users can view their own roles, admins can view all"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Only admins can modify user roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seller Applications Policies
CREATE POLICY "Applicants can view their own applications, admins can view all"
  ON public.seller_applications FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can submit a seller application"
  ON public.seller_applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    status IN ('draft', 'submitted')
  );

CREATE POLICY "Applicants can edit their draft applications"
  ON public.seller_applications FOR UPDATE
  USING (
    (auth.uid() = user_id AND status = 'draft') OR
    public.is_admin()
  )
  WITH CHECK (
    (auth.uid() = user_id AND status IN ('draft', 'submitted')) OR
    public.is_admin()
  );

-- Seller Profiles Policies
CREATE POLICY "Verified active seller profiles are viewable by everyone"
  ON public.seller_profiles FOR SELECT
  USING (
    (is_verified = TRUE AND status = 'active') OR
    auth.uid() = user_id OR
    public.is_admin()
  );

CREATE POLICY "Sellers can update their own bio and portfolio"
  ON public.seller_profiles FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (
    (auth.uid() = user_id AND is_verified = (SELECT is_verified FROM public.seller_profiles WHERE id = public.seller_profiles.id)) OR
    public.is_admin()
  );

-- Verification Events Policies
CREATE POLICY "Sellers and Admins can view verification events"
  ON public.seller_verification_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.seller_applications sa
      WHERE sa.id = public.seller_verification_events.application_id AND sa.user_id = auth.uid()
    ) OR
    public.is_admin()
  );

-- Audit Logs Policies
CREATE POLICY "Audit logs are strictly readable by administrators only"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());
