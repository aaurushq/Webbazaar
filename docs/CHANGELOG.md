# WebBazaar — Changelog

## [0.2.0] - Phase 2: Authentication, User Profiles, Verified Seller Onboarding and Admin Approval

### Added
- **Supabase Integration:** Installed and configured `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, and `@hookform/resolvers`.
- **Supabase Clients:** Implemented browser client (`src/lib/supabase/client.ts`), server client with cookies (`src/lib/supabase/server.ts`), and server-only admin service-role client (`src/lib/supabase/admin.ts`).
- **SSR Session Refresh & Protected Middleware:** Implemented `src/middleware.ts` and `src/lib/supabase/middleware.ts` protecting `/dashboard/*` routes and verifying `ADMIN` role for `/dashboard/admin`.
- **Database Migrations:** Created version-controlled SQL migration `supabase/migrations/20241116000000_phase2_auth_roles_seller_onboarding.sql`:
  - `profiles` table with automatic insertion trigger on `auth.users` creation.
  - `user_roles` table enforcing RBAC roles (`BUYER`, `SELLER_APPLICANT`, `VERIFIED_SELLER`, `ADMIN`).
  - `seller_applications` table with status workflow (`draft`, `submitted`, `under_review`, `approved`, `rejected`, `suspended`).
  - `seller_profiles` table for verified stores.
  - `seller_verification_events` for chronological review history.
  - `audit_logs` table for administrative audit tracking.
  - Stored procedure `admin_process_seller_application` enforcing server-side permission checks.
  - Strict Row-Level Security (RLS) policies preventing cross-user data tampering.
- **Authentication Routes:**
  - `/login`: Email & password sign-in with safe redirect destination handling.
  - `/register`: User registration with password strength requirements and automatic profile creation.
  - `/forgot-password`: Password recovery request email flow.
  - `/reset-password`: Secure password update interface.
- **Seller Onboarding Flow (`/become-a-seller`):** Multi-step application collecting brand name, entity type, portfolio link, bio, product categories, and terms agreement.
- **Buyer Dashboard (`/dashboard/buyer`):** Profile overview, display name and phone number editing, purchases/downloads section, and saved wishlist.
- **Seller Dashboard (`/dashboard/seller`):** Storefront overview with verification badge, listing metrics, and pending application status view.
- **Admin Console (`/dashboard/admin`):** Applications moderation queue, dossier review modal, approval/rejection with mandatory feedback notes, and immutable audit logs.
- **Security Testing:** Open redirect mitigation testing, Zod input validation suite, role assignment validation, and browser automated E2E tests.

---

## [0.1.0] - Phase 1: Project Foundation and Premium Marketplace Frontend

### Added
- Next.js 14 App Router, TypeScript strict mode, Tailwind CSS design system.
- Responsive homepage, 4 category vertical landing pages, dynamic listing detail pages.
- Local typed demo dataset with 24 marketplace assets.
- Automated Vitest test suite and browser QA automation.
