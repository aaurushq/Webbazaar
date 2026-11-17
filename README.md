# WebBazaar — Discover. Customize. Launch.

> India's premier all-in-one marketplace for buying and selling ready-made websites, premium templates, clean source code, profitable online businesses, and website customization services.

---

## Overview

**WebBazaar** is an India-first digital asset ecosystem built to empower developers, entrepreneurs, agencies, and investors. The platform combines four distinct marketplace verticals into a unified, secure application:

1. **Ready-Made Websites:** Turnkey web applications with database schemas and deployment configs ready to brand and launch.
2. **Templates & Source Code:** High-performance Next.js 14 boilerplates, UI component libraries, and scripts with commercial licenses.
3. **Established Online Businesses:** Revenue-generating SaaS, content websites, and e-commerce stores available for direct acquisition with private due-diligence data rooms.
4. **Customization & Development Services:** Fixed-price packages and custom milestone offers provided by verified creators (branding, cloud deployments, payment gateways).

---

## Tech Stack (Modular Monolith)

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling & Design System:** Tailwind CSS, Radix UI Primitives, Lucide Icons
- **Primary Currency:** Indian Rupee (INR — ₹)
- **Authentication & Backend:** Supabase (PostgreSQL, Supabase Auth, Row-Level Security, Storage, Realtime)
- **Form Management & Validation:** React Hook Form & Zod
- **Payments:** Razorpay (Standard Checkout, Webhooks, Route Payouts) — *Phase 6*
- **Testing:** Vitest (23 Unit/Integration Tests) & Browser E2E Automation (Puppeteer-Core / Chrome Headless)
- **Deployment Target:** Vercel

---

## Getting Started

### Prerequisites

- Node.js >= 18 (Tested on v26)
- npm >= 10

### Installation

```bash
# Clone the repository
cd WEBBAZAAR

# Install dependencies
npm install

# Run unit tests
npm test

# Run ESLint
npm run lint

# Run TypeScript type check
npx tsc --noEmit

# Start development server
npm run dev
# Application will run on http://localhost:3000

# Or build and start production server
npm run build
npm start
```

---

## Marketplace & Dashboard Routes

| Route | Scope | Description |
| :--- | :--- | :--- |
| `/` | **Public** | Marketplace hero, vertical cards, featured assets, buyer workflow, seller promotion banner |
| `/marketplace` | **Public** | Comprehensive catalog with live keyword search, category, vertical, price range (INR), tech stack filters, and sorting |
| `/ready-websites` | **Public** | Turnkey web applications with hosting cost estimates and included asset bundles |
| `/templates` | **Public** | Developer starter kits, boilerplates, and UI kits with commercial licensing |
| `/businesses` | **Public** | Acquisition listings with ARR, monthly net profit, multiple, and NDA request workflow |
| `/services` | **Public** | Scoped customization packages with fixed delivery days and revisions |
| `/listings/[slug]` | **Public** | Dynamic listing detail page tailored for each vertical, interactive image gallery, seller bio, and demo preview |
| `/sell` | **Public** | Verification criteria, creator onboarding, and proposed commission breakdown (12%, 15%, 12%, 5%) |
| `/login` | **Auth** | Sign in with email and password with open-redirect mitigation |
| `/register` | **Auth** | User signup with password complexity validation and auto-profile trigger |
| `/forgot-password` | **Auth** | Secure recovery link dispatch |
| `/reset-password` | **Auth** | Password reset form |
| `/become-a-seller` | **Protected** | 3-step seller onboarding application |
| `/dashboard/buyer` | **Protected** | Buyer overview, profile editing, purchase history, and saved wishlist |
| `/dashboard/seller` | **Protected** | Verified seller storefront, active listing stats, and pending status view |
| `/dashboard/admin` | **Protected (Admin)** | Applications moderation queue, dossier review modal, approve/reject workflow, and immutable audit logs |

---

## Project Documentation

Detailed architecture, database schemas, security models, and test logs are maintained in `/docs`:

- [`docs/ARCHITECTURE.md`](file:///c:/Users/CHETAN%20PRAJAPAT/Desktop/WEBBAZAAR/docs/ARCHITECTURE.md)
- [`docs/PRODUCT_REQUIREMENTS.md`](file:///c:/Users/CHETAN%20PRAJAPAT/Desktop/WEBBAZAAR/docs/PRODUCT_REQUIREMENTS.md)
- [`docs/DATABASE.md`](file:///c:/Users/CHETAN%20PRAJAPAT/Desktop/WEBBAZAAR/docs/DATABASE.md)
- [`docs/API_CONTRACTS.md`](file:///c:/Users/CHETAN%20PRAJAPAT/Desktop/WEBBAZAAR/docs/API_CONTRACTS.md)
- [`docs/DESIGN_SYSTEM.md`](file:///c:/Users/CHETAN%20PRAJAPAT/Desktop/WEBBAZAAR/docs/DESIGN_SYSTEM.md)
- [`docs/SECURITY.md`](file:///c:/Users/CHETAN%20PRAJAPAT/Desktop/WEBBAZAAR/docs/SECURITY.md)
- [`docs/ROADMAP.md`](file:///c:/Users/CHETAN%20PRAJAPAT/Desktop/WEBBAZAAR/docs/ROADMAP.md)
- [`docs/DECISIONS.md`](file:///c:/Users/CHETAN%20PRAJAPAT/Desktop/WEBBAZAAR/docs/DECISIONS.md)
- [`docs/TEST_REPORT.md`](file:///c:/Users/CHETAN%20PRAJAPAT/Desktop/WEBBAZAAR/docs/TEST_REPORT.md)
- [`docs/CHANGELOG.md`](file:///c:/Users/CHETAN%20PRAJAPAT/Desktop/WEBBAZAAR/docs/CHANGELOG.md)

---

## Current Status: Phase 2 Completed

Phase 2 establishes full Supabase authentication architecture, user profile triggers, role management (`BUYER`, `SELLER_APPLICANT`, `VERIFIED_SELLER`, `ADMIN`), multi-step seller onboarding (`/become-a-seller`), protected Buyer & Seller dashboards, an Administrator moderation console (`/dashboard/admin`), and version-controlled SQL migrations with Row-Level Security.
