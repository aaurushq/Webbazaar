-- ====================================================================
-- WebBazaar Phase 2 Hardening: Least-Privilege Role Grants & Routine Hardening
-- ====================================================================

-- 1. DROP TEST FUNCTIONS
DROP FUNCTION IF EXISTS public.test_func();
DROP FUNCTION IF EXISTS public.test_func2();

-- 2. REVOKE ALL DEFAULT AND EXISTING PRIVILEGES FROM PUBLIC, ANON & AUTHENTICATED
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM PUBLIC, anon, authenticated;

-- Ensure schema usage is allowed
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 3. APPLY LEAST-PRIVILEGE TABLE GRANTS

-- Profiles: Anon can view; Authenticated can view and update their own
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- User Roles: Read-only for authenticated (subject to RLS); mutations handled exclusively via triggers/admin functions
GRANT SELECT ON public.user_roles TO authenticated;

-- Seller Applications: Authenticated only (subject to RLS)
GRANT SELECT, INSERT, UPDATE ON public.seller_applications TO authenticated;

-- Seller Profiles: Public can view verified sellers; Authenticated can update their own
GRANT SELECT ON public.seller_profiles TO anon;
GRANT SELECT, UPDATE ON public.seller_profiles TO authenticated;

-- Verification Events: Authenticated can view and log verification events
GRANT SELECT, INSERT ON public.seller_verification_events TO authenticated;

-- Audit Logs: Authenticated can only SELECT (RLS strictly enforces is_admin()); only service/functions insert
GRANT SELECT ON public.audit_logs TO authenticated;

-- Service role retains full administrative privileges for background jobs / migrations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- 4. HARDEN SECURITY DEFINER & RPC FUNCTIONS

-- Trigger function: Only Postgres needs to execute on auth.users insert
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Admin Application Review RPC: Only authenticated users can call (function body enforces is_admin())
REVOKE EXECUTE ON FUNCTION public.admin_process_seller_application(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_process_seller_application(UUID, TEXT, TEXT) TO authenticated, service_role;

-- Helper Functions
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated, service_role;

-- 5. RESET DEFAULT PRIVILEGES TO LEAST-PRIVILEGE
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM PUBLIC, anon, authenticated;
