# WebBazaar — Product Requirements Document (PRD)

## 1. Executive Summary

- **Product Name:** WebBazaar
- **Tagline:** Discover. Customize. Launch.
- **Mission:** An India-first all-in-one marketplace for buying and selling ready-made websites, premium templates, clean source code, profitable online businesses, and website customization services.
- **Target Geography:** India (Primary Currency: INR)
- **Target Audience:**
  - *Buyers:* Small business owners, entrepreneurs, marketing agencies, software engineers, and digital investors looking for turnkey assets.
  - *Sellers:* Full-stack developers, UI/UX designers, boutique agencies, and bootstrapped SaaS founders.
- **Development Strategy:** Phased modular monolith built with Next.js 14, Supabase, and Razorpay.

---

## 2. The Four Marketplace Verticals

| Vertical | Primary Purpose | Transaction Model | Key Unique Attributes |
| :--- | :--- | :--- | :--- |
| **Ready-Made Websites** | Turnkey web applications ready for rebranding and deployment | Instant Buy $\rightarrow$ Git repo & DB schema download | Live demo link, monthly hosting cost estimate, included asset bundle |
| **Templates & Source Code** | High-performance boilerplates, themes, and UI kits | Instant Buy $\rightarrow$ ZIP archive & commercial license | Supported breakpoints, included pages, documentation format |
| **Online Businesses** | Acquisition of cash-flowing SaaS, blogs, or e-commerce | Inquiry $\rightarrow$ Mutual NDA $\rightarrow$ Due Diligence $\rightarrow$ Deal Settlement | Monthly net profit, ARR, profit margin %, customer count, valuation multiple |
| **Custom Services** | Technical services (branding, payment setup, cloud deployment) | Fixed package or custom offer $\rightarrow$ Milestone release | Turnaround days, included revisions, scoped deliverables |

---

## 3. User Roles & Capabilities

1. **Buyer:**
   - Browse multi-vertical catalog with rich filters (category, vertical, price range in ₹, tech stack).
   - Test live website demos.
   - Purchase digital assets with instant download entitlements.
   - Initiate acquisition inquiries and sign NDAs for confidential business data.
   - Book customization services and review deliverables before releasing funds.
2. **Verified Seller:**
   - Onboarding via identity verification (PAN/GST in India) and code quality review.
   - Create, edit, and publish listings across all 4 verticals.
   - Respond to buyer inquiries, issue custom milestone offers, and manage orders.
   - Receive payouts to verified Indian bank accounts.
3. **Platform Administrator:**
   - Review and moderate listings before public publishing.
   - Audit seller KYC applications and verify business financial documentation.
   - Mediate order disputes and process refunds where warranted.
   - Monitor platform transaction health and system audit logs.

---

## 4. Phase 1 Scope & Status

- **Status:** **Completed**
- **Delivered Capabilities:**
  - Modern, responsive marketplace homepage with brand identity, search, and vertical showcases.
  - Interactive `/marketplace` catalog with keyword search, multi-factor filtering, and sorting.
  - Dedicated landing pages for each vertical: `/ready-websites`, `/templates`, `/businesses`, `/services`.
  - Dynamic listing detail pages (`/listings/[slug]`) tailored for each asset type.
  - Comprehensive seller info page (`/sell`) with transparent proposed commissions (12%, 15%, 12%, 5%).
  - Local typed demo dataset with 24 realistic marketplace assets.
  - Automated unit and browser test suites with zero defects.
