# WebBazaar — Application Security Architecture

## 1. Threat Modeling & Safeguards

WebBazaar operates on a strict **Secure-by-Default** engineering model:

| Threat Vector | Potential Impact | WebBazaar Architectural Control |
| :--- | :--- | :--- |
| **Open Redirect Attacks** | Phishing users to external malicious domains | `sanitizeRedirect()` enforces that redirect targets must start with `/` and rejects protocol-relative `//` or absolute URLs. |
| **Unauthorized Role Escalation** | Users granting themselves Admin or Verified Seller | Role mutations restricted to server stored procedures and admin RLS. `user_roles` cannot be modified by ordinary users. |
| **Cross-User Profile Tampering** | Malicious users modifying other users' profiles | PostgreSQL RLS policy `auth.uid() = id` strictly allows users to update only their own profile record. |
| **Unverified Seller Publishing** | Spam / trojans published directly to catalog | Publishing restricted to accounts with `is_verified = TRUE` and `VERIFIED_SELLER` role granted through admin review. |
| **Malicious Source Code Uploads** | Web shells, backdoors, trojans | Stored in isolated Supabase private storage. Archives are never unpacked or executed on the host server. Downloads gated by expiring signed URLs (`expiresIn: 300`). |
| **Client-Side Price Manipulation** | Buyers altering prices in POST requests | Server-side price resolution only. Checkout session builder reads prices directly from the database based on immutable `listing_id`. |
| **Confidential Business Data Exposure** | P&L tax statements leaked | Stored in private `business-vault` bucket. Gated strictly by verified countersigned NDA records and admin role RLS. |
| **Phishing via Demo Links** | Sellers linking to malicious domains | Sanitized external links (`rel="noopener noreferrer nofollow"`) with security interstitials and sandboxed iframes. |
| **Webhook Forgery (Razorpay)** | Fake payment notifications | Mandatory HMAC-SHA256 signature verification over raw request body before state change. Idempotency table prevents duplicate credits. |

---

## 2. Row-Level Security (RLS) Implementation (Phase 2)

All database tables have RLS enabled:
- `profiles`: Public can read display name & avatar. Only `auth.uid() = id` can update.
- `user_roles`: Read accessible to self or admin. Mutations restricted exclusively to administrators.
- `seller_applications`: Applicants can view and edit drafts. Status transitions to `approved`, `rejected`, or `suspended` strictly require `is_admin() = true`.
- `seller_profiles`: Publicly readable when `is_verified = TRUE` and `status = 'active'`. Updates to verification or status restricted to administrators.
- `audit_logs`: Immutable insertion; readable strictly by administrators.
