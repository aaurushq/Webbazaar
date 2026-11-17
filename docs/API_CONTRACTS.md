# WebBazaar — API Contracts & Domain Interfaces

This document outlines the standard contracts and payloads across the WebBazaar modular monolith.

---

## 1. Catalog & Discovery Contracts

### `GET /api/listings` (Phase 4 Database Hook)
- **Query Parameters:**
  - `q`: Search keyword (string)
  - `type`: `READY_WEBSITE` | `TEMPLATE` | `BUSINESS` | `SERVICE` | `ALL`
  - `category`: Category string
  - `minPrice`: number (INR)
  - `maxPrice`: number (INR)
  - `tech`: comma-separated string
  - `sort`: `newest` | `price-asc` | `price-desc` | `profit-desc` | `featured`
- **Response Payload:**
  ```json
  {
    "data": [
      {
        "id": "rw-01",
        "slug": "curry-leaf-complete-cloud-kitchen-restaurant-platform",
        "title": "CurryLeaf — Turnkey Multi-Outlet Cloud Kitchen & Restaurant Platform",
        "listingType": "READY_WEBSITE",
        "category": "Restaurant & Food",
        "priceINR": 18999,
        "techStack": ["Next.js 14", "Tailwind CSS", "Supabase", "Razorpay"],
        "seller": {
          "id": "sel-01",
          "name": "Aarav Sharma",
          "isVerified": true
        }
      }
    ],
    "meta": {
      "total": 24,
      "page": 1,
      "limit": 20
    }
  }
  ```

---

## 2. Order & Checkout Contracts (Phase 6 Preview)

### `POST /api/orders/create`
- **Request Payload:**
  ```json
  {
    "listingId": "rw-01",
    "licenseTier": "Single Commercial"
  }
  ```
- **Validation Rules:**
  - Price submitted by client is ignored.
  - Server fetches official price from `listings` table.
  - Razorpay order ID generated and linked to database `orders` record in `PENDING` state.

---

## 3. Webhook Contract (Razorpay)

### `POST /api/webhooks/razorpay`
- **Headers:** `X-Razorpay-Signature: <hmac_sha256_hash>`
- **Handler Logic:**
  1. Validate signature against `process.env.RAZORPAY_WEBHOOK_SECRET`.
  2. Check `payment_events` table for duplicate event ID (idempotency).
  3. If event is `order.paid`, transition order status to `PAID`.
  4. Generate signed digital entitlement record.
