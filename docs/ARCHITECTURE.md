# WebBazaar — Architecture Specification

## 1. System Philosophy: Modular Monolith

WebBazaar is designed as a **modular monolith** running on Next.js 14 App Router, TypeScript (Strict Mode), Tailwind CSS, and Supabase (PostgreSQL). 

```
                               ┌────────────────────────────────┐
                               │   Next.js 14 Web Application   │
                               │  (App Router, Server Actions,  │
                               │   React Server Components)     │
                               └───────────────┬────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
       ┌──────────────┐                ┌──────────────┐                ┌──────────────┐
       │ Public Views │                │ Domain Logic │                │ Client Hooks │
       │& Presentation│                │  (Services)  │                │& UI Controls │
       └───────┬──────┘                └───────┬──────┘                └───────┬──────┘
               │                               │                               │
               └───────────────────────┬───────┴───────────────────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      │    Data Access & Integrations   │
                      │  (Supabase RLS, Razorpay, GCS)  │
                      └─────────────────────────────────┘
```

### Key Architectural Tenets:
1. **Server-Side Authorization & Business Logic:** Never trust the browser. All security, price calculations, order transitions, and entitlement downloads are validated server-side.
2. **Unified Core with Specialized Verticals:** The four verticals (`READY_WEBSITE`, `TEMPLATE`, `BUSINESS`, `SERVICE`) share core modules (Authentication, Verification, Notifications, User Profiles, Reviews, Audit Logs), while maintaining specialized data extensions.
3. **Immutable Order Snapshots:** Prices, seller payouts, and item descriptions are snapshotted in the database upon order creation.

---

## 2. Directory Structure

```
WEBBAZAAR/
├── .env.example                  # Environment configuration blueprint
├── next.config.mjs               # Next.js runtime configuration
├── package.json                  # Dependencies & npm scripts
├── postcss.config.mjs            # PostCSS plugin pipeline
├── tailwind.config.ts            # Tailwind CSS design tokens
├── tsconfig.json                 # TypeScript strict compiler options
├── vitest.config.ts              # Vitest test configuration
├── docs/                         # Synchronized engineering documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── API_CONTRACTS.md
│   ├── DESIGN_SYSTEM.md
│   ├── SECURITY.md
│   ├── ROADMAP.md
│   ├── DECISIONS.md
│   ├── TEST_REPORT.md
│   └── CHANGELOG.md
├── src/
│   ├── app/                      # Next.js App Router routes
│   │   ├── globals.css           # Global CSS variables & Tailwind directives
│   │   ├── layout.tsx            # Root layout with banner, header, footer
│   │   ├── page.tsx              # Homepage
│   │   ├── marketplace/          # Catalog with live search & filters
│   │   ├── ready-websites/       # Turnkey websites vertical
│   │   ├── templates/            # Code & boilerplates vertical
│   │   ├── businesses/           # Business acquisitions vertical
│   │   ├── services/             # Customization services vertical
│   │   ├── sell/                 # Seller onboarding & commission info
│   │   ├── listings/[slug]/      # Dynamic listing detail views
│   │   ├── robots.ts             # Search engine robots rule
│   │   └── sitemap.ts            # Dynamic XML sitemap generator
│   ├── components/
│   │   ├── ui/                   # Reusable atomic UI (button, badge, card, dialog, input, etc.)
│   │   ├── layout/               # Header, Footer, DemoNoticeBanner
│   │   └── marketplace/          # ListingCard, CategoryCard, ListingFilters, ListingGrid
│   ├── data/
│   │   └── demo-listings.ts      # 24 typed realistic marketplace assets
│   ├── lib/
│   │   └── utils.ts              # Currency formatting, filter & sort engine, cn helper
│   └── types/
│       └── marketplace.ts        # Core TypeScript domain interfaces
└── tests/
    └── marketplace.test.ts       # Vitest automated test suite
```
