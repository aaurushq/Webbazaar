# WebBazaar — Architecture Decision Records (ADR)

## ADR 001: Next.js 14 App Router as Modular Monolith
- **Date:** 2024-11-16
- **Context:** Deciding between microservices and a unified full-stack framework.
- **Decision:** Adopt Next.js 14 App Router with React Server Components, TypeScript Strict Mode, and Server Actions.
- **Rationale:** Minimizes operational complexity, keeps deployment single-tenant and Vercel-compatible, allows sharing types directly between frontend and backend.

---

## ADR 002: Four Distinct Listing Models with Shared Core
- **Date:** 2024-11-16
- **Context:** Handling ready websites, code templates, running businesses, and customization services.
- **Decision:** Use a shared core `listings` table combined with 4 specialized extension tables (`ready_website_details`, `template_details`, `business_details`, `service_details`).
- **Rationale:** Prevents a sparse table anti-pattern while avoiding completely disparate systems for cart, discovery, and reviews.

---

## ADR 003: No Regulated Escrow Claims & Separation of Acquisition Workflow
- **Date:** 2024-11-16
- **Context:** Online business acquisitions involve high ticket transactions and regulatory scrutiny under Indian banking laws (RBI PA/PG guidelines).
- **Decision:** Separate the business acquisition workflow from standard instant checkout. Businesses require an inquiry $\rightarrow$ NDA $\rightarrow$ data room $\rightarrow$ manual assisted closing workflow. Instant checkout is reserved for digital downloads and fixed service packages.
- **Rationale:** Ensures strict compliance with Indian payment regulations and prevents fraudulent chargebacks on large asset transfers.

---

## ADR 004: Self-Contained Font Fallback Pipeline for Offline/Build Resilience
- **Date:** 2024-11-16
- **Context:** `next/font/google` attempts to fetch font definitions from Google servers during production builds, failing in restricted network environments.
- **Decision:** Utilize standard CSS font family stacks (`Inter, system-ui, -apple-system, sans-serif`) with system fallbacks defined in `tailwind.config.ts`.
- **Rationale:** Zero build-time external network dependencies, instant rendering, zero layout shifts.

---

## ADR 005: Server-Enforced Role-Based Access Control and Controlled Seller Verification
- **Date:** 2024-11-16
- **Context:** Enforcing roles (`BUYER`, `SELLER_APPLICANT`, `VERIFIED_SELLER`, `ADMIN`) and preventing self-promotion or unverified publishing.
- **Decision:** Use a dedicated `user_roles` table with database helper functions (`is_admin()`, `has_role()`) and a PostgreSQL stored procedure (`admin_process_seller_application`).
- **Rationale:** Never trust user input submitted by browser clients. Verification and administrator permissions are enforced at the database level via RLS policies.
