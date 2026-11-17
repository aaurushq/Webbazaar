# WebBazaar — Design System & Visual Identity

## 1. Brand Identity

- **Brand Name:** WebBazaar
- **Tagline:** Discover. Customize. Launch.
- **Brand Personality:** Premium, trustworthy, modern, developer-friendly, engineered specifically for the Indian commerce and tech ecosystem.

---

## 2. Color Palette & Design Tokens

### Primary Brand Colors
- **Primary (Indigo):** `#4F46E5` (`rgb(79, 70, 229)`)
  - `primary-50`: `#EEF2FF`
  - `primary-100`: `#E0E7FF`
  - `primary-600`: `#4F46E5` (Main CTA, brand marks)
  - `primary-700`: `#4338CA` (Active/hover states)
  - `primary-900`: `#312E81`

### Accent Colors
- **Accent (Teal):** `#0D9488` (`rgb(13, 148, 136)`)
  - `accent-50`: `#F0FDFA`
  - `accent-600`: `#0D9488` (Trust badges, secondary highlights)
  - `accent-700`: `#0F766E`

### Semantic Colors
- **Success / Verified:** Emerald `#10B981` / `#059669`
- **Business / Acquisitions:** Amber `#D97706` / `#92400E`
- **Services:** Sky `#0284C7` / `#0369A1`
- **Destructive / Error:** Rose/Red `#EF4444` / `#DC2626`

### Neutrals
- **Background:** White `#FFFFFF` and Slate-50 `#F8FAFC`
- **Card Background:** Pure White `#FFFFFF` with Slate-200 border `#E2E8F0`
- **Text Primary:** Slate-900 `#0F172A`
- **Text Secondary:** Slate-600 `#475569`
- **Muted Borders:** Slate-200 `#E2E8F0`

---

## 3. Typography

- **Primary Font Family:** Inter (`font-sans`), system-ui, -apple-system, sans-serif
- **Headings:**
  - H1: `text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight`
  - H2: `text-2xl sm:text-3xl font-extrabold tracking-tight`
  - H3: `text-lg sm:text-xl font-bold`
- **Body:** `text-sm sm:text-base leading-relaxed`
- **Badges & Microcopy:** `text-xs font-semibold uppercase tracking-wider`

---

## 4. Component Patterns

- **Buttons:** 4 variants (`default`, `outline`, `ghost`, `accent`), 3 sizes (`sm`, `default`, `lg`), subtle shadow, active depress effect.
- **Listing Cards:** 16:10 aspect ratio image, type badge top-left, demo tag bottom-right, INR pricing with compact Lakh/Crore notation, verified seller avatar.
- **Modals / Dialogs:** Centered backdrop blur (`bg-black/60`), spring entry animation, accessible keyboard Escape & focus trap.
- **Empty States:** Clean dotted outline container with descriptive icon and single-click reset filter action.
