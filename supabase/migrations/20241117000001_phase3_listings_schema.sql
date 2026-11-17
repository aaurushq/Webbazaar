-- Migration: 20241117000001_phase3_listings_schema.sql
-- Description: WebBazaar Phase 3 complete listings schema, specialized details tables, storage buckets, RLS, and moderation RPCs.

-- 1. Create listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('READY_WEBSITE', 'TEMPLATE', 'BUSINESS', 'SERVICE')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  price_inr BIGINT NOT NULL CHECK (price_inr >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'archived')),
  featured_image_path TEXT,
  demo_url TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performant filtering and searching
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON public.listings(slug);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_listing_type ON public.listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- 2. Create listing_media table
CREATE TABLE IF NOT EXISTS public.listing_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_media_listing_id ON public.listing_media(listing_id, sort_order);

-- 3. Create listing_files table (Private digital assets)
CREATE TABLE IF NOT EXISTS public.listing_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_files_listing_id ON public.listing_files(listing_id);

-- 4. Specialized listing details tables
-- 4a. Ready-Made Websites
CREATE TABLE IF NOT EXISTS public.ready_website_details (
  listing_id UUID PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
  website_category TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  key_features TEXT[] DEFAULT '{}',
  is_responsive BOOLEAN DEFAULT true,
  installation_requirements TEXT,
  included_pages TEXT,
  demo_url TEXT,
  delivery_method TEXT,
  license_type TEXT
);

-- 4b. Templates & Source Code
CREATE TABLE IF NOT EXISTS public.template_details (
  listing_id UUID PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
  framework TEXT,
  programming_language TEXT,
  compatible_versions TEXT,
  included_files TEXT,
  has_documentation BOOLEAN DEFAULT true,
  license_type TEXT,
  installation_instructions TEXT,
  support_duration_days INTEGER DEFAULT 30
);

-- 4c. Online Businesses
CREATE TABLE IF NOT EXISTS public.business_details (
  listing_id UUID PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
  business_model TEXT,
  asking_price_inr BIGINT,
  industry TEXT,
  operating_history_months INTEGER,
  monthly_revenue_inr BIGINT,
  monthly_profit_inr BIGINT,
  monthly_traffic BIGINT,
  monetization_methods TEXT,
  included_assets TEXT,
  reason_for_sale TEXT,
  is_financials_verified BOOLEAN DEFAULT false,
  confidential_notes TEXT
);

-- 4d. Development Services
CREATE TABLE IF NOT EXISTS public.service_details (
  listing_id UUID PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
  service_category TEXT,
  deliverables TEXT,
  starting_price_inr BIGINT,
  estimated_delivery_days INTEGER DEFAULT 7,
  revision_policy TEXT,
  supported_technologies TEXT,
  buyer_requirements TEXT
);

-- 5. Updated_at auto-trigger for listings
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_listings_updated_at ON public.listings;
CREATE TRIGGER trigger_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Storage Buckets Setup
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('listing-images', 'listing-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('listing-files', 'listing-files', false, 104857600, ARRAY['application/zip', 'application/x-zip-compressed', 'application/octet-stream', 'application/pdf']),
  ('business-documents', 'business-documents', false, 52428800, ARRAY['application/pdf', 'application/zip', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 7. Row Level Security Policies
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ready_website_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_details ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.listings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listings TO authenticated;

GRANT SELECT ON public.listing_media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listing_media TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.listing_files TO authenticated;

GRANT SELECT ON public.ready_website_details TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ready_website_details TO authenticated;

GRANT SELECT ON public.template_details TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.template_details TO authenticated;

GRANT SELECT ON public.business_details TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.business_details TO authenticated;

GRANT SELECT ON public.service_details TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_details TO authenticated;

-- LISTINGS RLS
DROP POLICY IF EXISTS "Public can view approved listings" ON public.listings;
CREATE POLICY "Public can view approved listings"
  ON public.listings FOR SELECT
  USING (
    status = 'approved' 
    OR (auth.uid() IS NOT NULL AND seller_id = auth.uid())
    OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()))
  );

DROP POLICY IF EXISTS "Verified sellers can insert own listings" ON public.listings;
CREATE POLICY "Verified sellers can insert own listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id = auth.uid() 
    AND (public.has_role(auth.uid(), 'VERIFIED_SELLER') OR public.is_admin(auth.uid()))
    AND status IN ('draft', 'pending_review')
  );

DROP POLICY IF EXISTS "Sellers can update own draft or rejected listings" ON public.listings;
CREATE POLICY "Sellers can update own draft or rejected listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (
    (seller_id = auth.uid() AND status IN ('draft', 'rejected', 'pending_review'))
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    (
      seller_id = auth.uid() 
      AND (
        -- Seller cannot self-approve
        (status IN ('draft', 'pending_review', 'archived') AND status != 'approved')
      )
    )
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Sellers can delete own draft listings" ON public.listings;
CREATE POLICY "Sellers can delete own draft listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (
    (seller_id = auth.uid() AND status IN ('draft', 'rejected'))
    OR public.is_admin(auth.uid())
  );

-- LISTING MEDIA RLS
DROP POLICY IF EXISTS "Public can view media of accessible listings" ON public.listing_media;
CREATE POLICY "Public can view media of accessible listings"
  ON public.listing_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l 
      WHERE l.id = listing_id 
      AND (l.status = 'approved' OR l.seller_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Sellers can manage media of own listings" ON public.listing_media;
CREATE POLICY "Sellers can manage media of own listings"
  ON public.listing_media FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l 
      WHERE l.id = listing_id 
      AND ((l.seller_id = auth.uid() AND l.status IN ('draft', 'rejected', 'pending_review')) OR public.is_admin(auth.uid()))
    )
  );

-- LISTING FILES RLS (Strictly Private)
DROP POLICY IF EXISTS "Only sellers and admins can access product files" ON public.listing_files;
CREATE POLICY "Only sellers and admins can access product files"
  ON public.listing_files FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l 
      WHERE l.id = listing_id 
      AND (l.seller_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

-- READY WEBSITE DETAILS RLS
DROP POLICY IF EXISTS "Public can view website details of accessible listings" ON public.ready_website_details;
CREATE POLICY "Public can view website details of accessible listings"
  ON public.ready_website_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l 
      WHERE l.id = listing_id 
      AND (l.status = 'approved' OR l.seller_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Sellers can manage website details of own listings" ON public.ready_website_details;
CREATE POLICY "Sellers can manage website details of own listings"
  ON public.ready_website_details FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l 
      WHERE l.id = listing_id 
      AND ((l.seller_id = auth.uid() AND l.status IN ('draft', 'rejected', 'pending_review')) OR public.is_admin(auth.uid()))
    )
  );

-- TEMPLATE DETAILS RLS
DROP POLICY IF EXISTS "Public can view template details of accessible listings" ON public.template_details;
CREATE POLICY "Public can view template details of accessible listings"
  ON public.template_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l 
      WHERE l.id = listing_id 
      AND (l.status = 'approved' OR l.seller_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Sellers can manage template details of own listings" ON public.template_details;
CREATE POLICY "Sellers can manage template details of own listings"
  ON public.template_details FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l 
      WHERE l.id = listing_id 
      AND ((l.seller_id = auth.uid() AND l.status IN ('draft', 'rejected', 'pending_review')) OR public.is_admin(auth.uid()))
    )
  );

-- BUSINESS DETAILS RLS
DROP POLICY IF EXISTS "Public can view non-confidential business details" ON public.business_details;
CREATE POLICY "Public can view non-confidential business details"
  ON public.business_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l 
      WHERE l.id = listing_id 
      AND (l.status = 'approved' OR l.seller_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Sellers can manage business details of own listings" ON public.business_details;
CREATE POLICY "Sellers can manage business details of own listings"
  ON public.business_details FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l 
      WHERE l.id = listing_id 
      AND ((l.seller_id = auth.uid() AND l.status IN ('draft', 'rejected', 'pending_review')) OR public.is_admin(auth.uid()))
    )
  );

-- SERVICE DETAILS RLS
DROP POLICY IF EXISTS "Public can view service details of accessible listings" ON public.service_details;
CREATE POLICY "Public can view service details of accessible listings"
  ON public.service_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l 
      WHERE l.id = listing_id 
      AND (l.status = 'approved' OR l.seller_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Sellers can manage service details of own listings" ON public.service_details;
CREATE POLICY "Sellers can manage service details of own listings"
  ON public.service_details FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l 
      WHERE l.id = listing_id 
      AND ((l.seller_id = auth.uid() AND l.status IN ('draft', 'rejected', 'pending_review')) OR public.is_admin(auth.uid()))
    )
  );

-- 8. Storage RLS Policies
DROP POLICY IF EXISTS "Listing images are publicly readable" ON storage.objects;
CREATE POLICY "Listing images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "Verified sellers can upload listing images" ON storage.objects;
CREATE POLICY "Verified sellers can upload listing images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'listing-images' 
    AND (public.has_role(auth.uid(), 'VERIFIED_SELLER') OR public.is_admin(auth.uid()))
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can manage own listing images" ON storage.objects;
CREATE POLICY "Users can manage own listing images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'listing-images' 
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin(auth.uid()))
  );

DROP POLICY IF EXISTS "Only sellers and admins can access listing files" ON storage.objects;
CREATE POLICY "Only sellers and admins can access listing files"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id IN ('listing-files', 'business-documents') 
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin(auth.uid()))
  );

-- 9. Stored Procedures / RPCs for Safe Status Transitions & Moderation

-- 9a. Submit listing for admin review
CREATE OR REPLACE FUNCTION public.seller_submit_listing_for_review(p_listing_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_listing RECORD;
BEGIN
  -- Verify caller owns listing
  SELECT * INTO v_listing FROM public.listings WHERE id = p_listing_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;

  IF v_listing.seller_id != auth.uid() AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only submit your own listings';
  END IF;

  IF v_listing.status NOT IN ('draft', 'rejected') THEN
    RAISE EXCEPTION 'Only draft or rejected listings can be submitted for review';
  END IF;

  UPDATE public.listings
  SET status = 'pending_review',
      rejection_reason = NULL,
      updated_at = now()
  WHERE id = p_listing_id;

  -- Create audit log
  INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(),
    'LISTING_SUBMITTED_FOR_REVIEW',
    'listings',
    p_listing_id::text,
    jsonb_build_object('title', v_listing.title, 'type', v_listing.listing_type)
  );

  RETURN jsonb_build_object('success', true, 'status', 'pending_review');
END;
$$;

-- 9b. Admin moderate listing (Approve / Reject)
CREATE OR REPLACE FUNCTION public.admin_moderate_listing(
  p_listing_id UUID,
  p_action TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_listing RECORD;
  v_new_status TEXT;
BEGIN
  -- Enforce admin privilege
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Administrator privileges required to moderate listings';
  END IF;

  SELECT * INTO v_listing FROM public.listings WHERE id = p_listing_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;

  IF p_action = 'approve' THEN
    v_new_status := 'approved';
    UPDATE public.listings
    SET status = 'approved',
        published_at = now(),
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        rejection_reason = NULL,
        updated_at = now()
    WHERE id = p_listing_id;
  ELSIF p_action = 'reject' THEN
    v_new_status := 'rejected';
    UPDATE public.listings
    SET status = 'rejected',
        rejection_reason = p_reason,
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        updated_at = now()
    WHERE id = p_listing_id;
  ELSE
    RAISE EXCEPTION 'Invalid moderation action: Must be approve or reject';
  END IF;

  -- Create audit log
  INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(),
    'LISTING_' || UPPER(p_action),
    'listings',
    p_listing_id::text,
    jsonb_build_object(
      'title', v_listing.title,
      'seller_id', v_listing.seller_id,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object('success', true, 'status', v_new_status);
END;
$$;

-- Revoke dangerous privileges
REVOKE EXECUTE ON FUNCTION public.seller_submit_listing_for_review(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seller_submit_listing_for_review(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_moderate_listing(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_moderate_listing(UUID, TEXT, TEXT) TO authenticated;
