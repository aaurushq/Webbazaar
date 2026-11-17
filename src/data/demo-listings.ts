import { Listing } from "@/types/marketplace";

export const DEMO_LISTINGS: Listing[] = [
  // ==========================================
  // 1. READY-MADE WEBSITES (8 items)
  // ==========================================
  {
    id: "rw-01",
    slug: "curry-leaf-complete-cloud-kitchen-restaurant-platform",
    title: "CurryLeaf — Turnkey Multi-Outlet Cloud Kitchen & Restaurant Platform",
    shortDescription: "Complete online food ordering website with WhatsApp order alerts, live table reservation, and Razorpay checkout.",
    fullDescription: "CurryLeaf is a battle-tested restaurant and cloud kitchen platform built for Indian F&B brands. Includes a high-converting customer ordering frontend, kitchen display system (KDS) dashboard, instant WhatsApp order notifications via Twilio, and integrated Razorpay payment gateway. Ready to rebrand and deploy to Vercel and Supabase in under 2 hours.",
    listingType: "READY_WEBSITE",
    category: "Restaurant & Food",
    priceINR: 18999,
    originalPriceINR: 24999,
    isFeatured: true,
    isTrending: true,
    tags: ["Turnkey", "Food Delivery", "WhatsApp Ordering", "Razorpay"],
    techStack: ["Next.js 14", "Tailwind CSS", "Supabase", "Razorpay", "TypeScript"],
    previewImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-01",
      name: "Aarav Sharma (Demo Profile)",
      handle: "@aarav_codes",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      bio: "Senior full-stack dev specializing in modern Next.js and e-commerce solutions for Indian D2C businesses.",
      location: "Bengaluru, India",
      memberSince: "Jan 2024",
      isVerifiedDemo: true,
      salesCountDemo: 42,
      ratingDemo: 4.9,
      reviewCountDemo: 38,
      responseRateDemo: "Under 1 hour"
    },
    createdAt: "2024-10-15T09:00:00Z",
    updatedAt: "2024-11-01T12:00:00Z",
    readyWebsiteDetails: {
      liveUrl: "https://demo-curryleaf.example.com",
      adminDemoUrl: "https://demo-curryleaf.example.com/admin",
      monthlyHostingCostEstimateINR: 1500,
      cmsOrFramework: "Next.js 14 App Router",
      databaseUsed: "Supabase PostgreSQL",
      includedAssets: ["Complete Git Repository", "Figma Design System", "Supabase DB Schema & Seed Data", "Deployment Video Tutorial"],
      deploymentGuideIncluded: true
    }
  },
  {
    id: "rw-02",
    slug: "gharsetu-modern-real-estate-portal-and-crm",
    title: "GharSetu — Verified Real Estate Listing Portal with Lead CRM",
    shortDescription: "Property portal optimized for tier 1 & 2 Indian cities with 3D virtual tour support and WhatsApp lead routing.",
    fullDescription: "GharSetu offers property dealers, developers, and broker networks an end-to-end portal. Features verified badges, locality price trends, EMI calculator, schedule site visit modal, and an agent lead CRM with automated WhatsApp inquiries.",
    listingType: "READY_WEBSITE",
    category: "Real Estate",
    priceINR: 29999,
    originalPriceINR: 35000,
    isFeatured: true,
    tags: ["Real Estate", "Property Portal", "Lead Gen", "Maps API"],
    techStack: ["Next.js", "React", "PostgreSQL", "Prisma", "Tailwind CSS"],
    previewImageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-02",
      name: "Priya Patel (Demo Profile)",
      handle: "@priyatech",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
      bio: "Ex-proptech frontend lead building niche portal solutions for brokers and builders.",
      location: "Ahmedabad, India",
      memberSince: "Mar 2024",
      isVerifiedDemo: true,
      salesCountDemo: 19,
      ratingDemo: 4.8,
      reviewCountDemo: 15,
      responseRateDemo: "Under 3 hours"
    },
    createdAt: "2024-10-18T10:30:00Z",
    updatedAt: "2024-11-04T15:00:00Z",
    readyWebsiteDetails: {
      liveUrl: "https://demo-gharsetu.example.com",
      monthlyHostingCostEstimateINR: 2000,
      cmsOrFramework: "Next.js App Router",
      databaseUsed: "PostgreSQL",
      includedAssets: ["Source Code", "Admin CRM Panel", "SQL Migrations", "Documentation PDF"],
      deploymentGuideIncluded: true
    }
  },
  {
    id: "rw-03",
    slug: "swasthyaplus-clinic-and-telemedicine-booking-site",
    title: "SwasthyaPlus — Multi-Doctor Clinic & Telemedicine Consultation Portal",
    shortDescription: "HIPAA-compliant ready website for healthcare clinics with slot booking, patient history, and prescription manager.",
    fullDescription: "Complete clinical practice management frontend with doctor profile pages, date/time slot picker, video consultation link integration via Jitsi, automated SMS reminders, and Razorpay appointment fees.",
    listingType: "READY_WEBSITE",
    category: "Healthcare & Wellness",
    priceINR: 22499,
    tags: ["Healthcare", "Telemedicine", "Appointment Booking", "Doctor CRM"],
    techStack: ["Next.js 14", "Tailwind CSS", "Supabase", "TypeScript", "Lucide"],
    previewImageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-03",
      name: "Vikram Sen (Demo Profile)",
      handle: "@vsen_health",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      bio: "Health-tech architect crafting accessible medical web apps and digital patient workflows.",
      location: "Pune, India",
      memberSince: "Feb 2024",
      isVerifiedDemo: true,
      salesCountDemo: 27,
      ratingDemo: 5.0,
      reviewCountDemo: 22,
      responseRateDemo: "Within 2 hours"
    },
    createdAt: "2024-10-20T11:00:00Z",
    updatedAt: "2024-11-06T14:00:00Z",
    readyWebsiteDetails: {
      liveUrl: "https://demo-swasthya.example.com",
      monthlyHostingCostEstimateINR: 1800,
      cmsOrFramework: "Next.js",
      databaseUsed: "Supabase PostgreSQL",
      includedAssets: ["Full Next.js Codebase", "Doctor Dashboard", "Patient Portal", "Setup Video"],
      deploymentGuideIncluded: true
    }
  },
  {
    id: "rw-04",
    slug: "shilpkaari-artisan-handicrafts-d2c-storefront",
    title: "ShilpKaari — Artisanal D2C Storefront with Pin-code Serviceability & GST Billing",
    shortDescription: "Ultra-fast headless e-commerce store designed for Indian craft & apparel brands with Shiprocket & Razorpay.",
    fullDescription: "ShilpKaari is built for artisanal, organic, and handicraft brands. Features pin-code COD checks, Shiprocket shipping estimation API, GST invoice auto-generation, abandoned cart recovery banners, and a mobile-optimized checkout.",
    listingType: "READY_WEBSITE",
    category: "E-Commerce",
    priceINR: 16499,
    originalPriceINR: 19999,
    isTrending: true,
    tags: ["E-Commerce", "D2C", "Shiprocket", "GST Ready"],
    techStack: ["Next.js", "Zustand", "Tailwind CSS", "Stripe/Razorpay", "Supabase"],
    previewImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-01",
      name: "Aarav Sharma (Demo Profile)",
      handle: "@aarav_codes",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      bio: "Senior full-stack dev specializing in modern Next.js and e-commerce solutions for Indian D2C businesses.",
      location: "Bengaluru, India",
      memberSince: "Jan 2024",
      isVerifiedDemo: true,
      salesCountDemo: 42,
      ratingDemo: 4.9,
      reviewCountDemo: 38,
      responseRateDemo: "Under 1 hour"
    },
    createdAt: "2024-10-22T08:00:00Z",
    updatedAt: "2024-11-05T09:30:00Z",
    readyWebsiteDetails: {
      liveUrl: "https://demo-shilpkaari.example.com",
      monthlyHostingCostEstimateINR: 1200,
      cmsOrFramework: "Next.js Headless",
      databaseUsed: "Supabase",
      includedAssets: ["Frontend Storefront", "Admin Inventory Manager", "GST Invoice Template", "Env Configs"],
      deploymentGuideIncluded: true
    }
  },
  {
    id: "rw-05",
    slug: "vidyapeeth-online-coaching-and-course-academy",
    title: "VidyaPeeth — Complete EdTech Course Academy & Mock Test Platform",
    shortDescription: "Turnkey learning management system with video watermarking, PDF notes security, and chapter-wise mock tests.",
    fullDescription: "Launch an online coaching institute in hours. Includes DRM-friendly video player embedding (YouTube unlisted / BunnyCDN / Vimeo), student dashboard, download protection, automated quiz scoring, and course completion certificates.",
    listingType: "READY_WEBSITE",
    category: "Education & LMS",
    priceINR: 24999,
    tags: ["EdTech", "LMS", "Video Courses", "Mock Tests"],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
    previewImageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-04",
      name: "Kavita Rao (Demo Profile)",
      handle: "@kavita_edtech",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      bio: "Edtech engineer and teacher creating accessible self-hosted educational platforms.",
      location: "Hyderabad, India",
      memberSince: "May 2024",
      isVerifiedDemo: true,
      salesCountDemo: 31,
      ratingDemo: 4.9,
      reviewCountDemo: 26,
      responseRateDemo: "Within 4 hours"
    },
    createdAt: "2024-10-25T14:15:00Z",
    updatedAt: "2024-11-08T10:00:00Z",
    readyWebsiteDetails: {
      liveUrl: "https://demo-vidyapeeth.example.com",
      monthlyHostingCostEstimateINR: 2500,
      cmsOrFramework: "Next.js",
      databaseUsed: "PostgreSQL",
      includedAssets: ["Student Portal", "Instructor Dashboard", "Quiz Engine", "Vercel Deploy Script"],
      deploymentGuideIncluded: true
    }
  },
  {
    id: "rw-06",
    slug: "studio-pulse-creative-agency-portfolio-and-quote-calculator",
    title: "StudioPulse — High-Impact Design Agency Showcase with Project Cost Calculator",
    shortDescription: "Ultra-slick portfolio for design and branding studios with interactive pricing estimator and client onboarding form.",
    fullDescription: "Stand out in pitches. Features smooth Framer-like micro-interactions, dark/light theme switch, case study deep-dives, interactive scope estimator that outputs direct PDF proposals, and Calendly meeting embeds.",
    listingType: "READY_WEBSITE",
    category: "Agency & Portfolio",
    priceINR: 11999,
    originalPriceINR: 15000,
    tags: ["Agency", "Portfolio", "Cost Calculator", "Framer Style"],
    techStack: ["Next.js 14", "Tailwind CSS", "TypeScript", "MDX"],
    previewImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-05",
      name: "PixelWave Studio (Demo Profile)",
      handle: "@pixelwave",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      bio: "Award-winning boutique design agency building digital experiences that convert.",
      location: "Mumbai, India",
      memberSince: "Apr 2024",
      isVerifiedDemo: true,
      salesCountDemo: 58,
      ratingDemo: 5.0,
      reviewCountDemo: 47,
      responseRateDemo: "Under 1 hour"
    },
    createdAt: "2024-10-27T16:00:00Z",
    updatedAt: "2024-11-09T18:00:00Z",
    readyWebsiteDetails: {
      liveUrl: "https://demo-studiopulse.example.com",
      monthlyHostingCostEstimateINR: 0,
      cmsOrFramework: "Next.js Static / Serverless",
      databaseUsed: "None (MDX / Git-backed)",
      includedAssets: ["Complete Next.js Repo", "Figma Design Components", "MDX Case Study Templates"],
      deploymentGuideIncluded: true
    }
  },
  {
    id: "rw-07",
    slug: "yatraquest-curated-travel-experiences-and-tour-booking",
    title: "YatraQuest — Boutique Tour Operator Website with Itinerary Builder",
    shortDescription: "Travel agency website featuring dynamic multi-day itinerary cards, inquiry forms, and WhatsApp travel concierge.",
    fullDescription: "Engineered for travel agencies, trek organizers, and destination planners. Features date-based trip booking, PDF itinerary generation, custom quote requests, photo galleries with geo-tag badges, and customer review showcases.",
    listingType: "READY_WEBSITE",
    category: "Booking & Services",
    priceINR: 14999,
    tags: ["Travel", "Tour Booking", "Itinerary", "WhatsApp Leads"],
    techStack: ["Next.js", "Tailwind CSS", "Supabase", "TypeScript"],
    previewImageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-02",
      name: "Priya Patel (Demo Profile)",
      handle: "@priyatech",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
      bio: "Ex-proptech frontend lead building niche portal solutions for brokers and builders.",
      location: "Ahmedabad, India",
      memberSince: "Mar 2024",
      isVerifiedDemo: true,
      salesCountDemo: 19,
      ratingDemo: 4.8,
      reviewCountDemo: 15,
      responseRateDemo: "Under 3 hours"
    },
    createdAt: "2024-10-29T11:20:00Z",
    updatedAt: "2024-11-10T12:00:00Z",
    readyWebsiteDetails: {
      liveUrl: "https://demo-yatraquest.example.com",
      monthlyHostingCostEstimateINR: 1200,
      cmsOrFramework: "Next.js",
      databaseUsed: "Supabase",
      includedAssets: ["Source Code", "Admin Trip Manager", "Email Templates", "Setup Instructions"],
      deploymentGuideIncluded: true
    }
  },
  {
    id: "rw-08",
    slug: "techbharat-hyperlocal-startup-and-services-directory",
    title: "TechBharat — City-Wise Business & Startup Directory with Claim Listings",
    shortDescription: "Directory portal with monetization via sponsored listings, verified business badges, and Google Maps integration.",
    fullDescription: "Launch a high-traffic niche business directory for your city or industry. Includes business owner claim workflows, customer reviews, rating breakdowns, sponsored listing tiers with payment checkout, and SEO-optimized location pages.",
    listingType: "READY_WEBSITE",
    category: "Directory & Marketplace",
    priceINR: 19499,
    originalPriceINR: 23000,
    tags: ["Directory", "Local SEO", "Listing Claims", "Monetization"],
    techStack: ["Next.js", "Tailwind CSS", "PostgreSQL", "Prisma", "Typesense"],
    previewImageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-04",
      name: "Kavita Rao (Demo Profile)",
      handle: "@kavita_edtech",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      bio: "Edtech engineer and teacher creating accessible self-hosted educational platforms.",
      location: "Hyderabad, India",
      memberSince: "May 2024",
      isVerifiedDemo: true,
      salesCountDemo: 31,
      ratingDemo: 4.9,
      reviewCountDemo: 26,
      responseRateDemo: "Within 4 hours"
    },
    createdAt: "2024-10-31T09:40:00Z",
    updatedAt: "2024-11-11T13:20:00Z",
    readyWebsiteDetails: {
      liveUrl: "https://demo-techbharat.example.com",
      monthlyHostingCostEstimateINR: 2200,
      cmsOrFramework: "Next.js",
      databaseUsed: "PostgreSQL",
      includedAssets: ["Directory Source Code", "Admin Approval Panel", "Search Index Seed", "Setup Guide"],
      deploymentGuideIncluded: true
    }
  },

  // ==========================================
  // 2. TEMPLATES & SOURCE CODE (8 items)
  // ==========================================
  {
    id: "tm-01",
    slug: "saaskit-india-b2b-multi-tenant-saas-boilerplate",
    title: "SaaSBoilerplate Pro — B2B Multi-Tenant Starter Kit with Razorpay Subscriptions",
    shortDescription: "Production-ready boilerplate with Auth, Supabase multi-tenancy, RBAC, Razorpay recurring webhooks, and team invites.",
    fullDescription: "Save 200+ engineering hours on your next SaaS. Includes user invitations, organizational teams, Stripe & Razorpay recurring billing sync, audit logs, dark mode, email templates, and automated database migrations.",
    listingType: "TEMPLATE",
    category: "SaaS & Web Apps",
    priceINR: 4999,
    originalPriceINR: 7999,
    isFeatured: true,
    isTrending: true,
    tags: ["SaaS Boilerplate", "Multi-Tenant", "Subscriptions", "TypeScript"],
    techStack: ["Next.js 14", "Supabase", "TypeScript", "Tailwind CSS", "Razorpay"],
    previewImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-01",
      name: "Aarav Sharma (Demo Profile)",
      handle: "@aarav_codes",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      bio: "Senior full-stack dev specializing in modern Next.js and e-commerce solutions for Indian D2C businesses.",
      location: "Bengaluru, India",
      memberSince: "Jan 2024",
      isVerifiedDemo: true,
      salesCountDemo: 42,
      ratingDemo: 4.9,
      reviewCountDemo: 38,
      responseRateDemo: "Under 1 hour"
    },
    createdAt: "2024-10-12T10:00:00Z",
    updatedAt: "2024-11-02T11:00:00Z",
    templateDetails: {
      framework: "Next.js 14 (App Router) + TypeScript",
      responsiveBreakpoints: ["Mobile (<640px)", "Tablet (640-1024px)", "Desktop (>1024px)"],
      includedPagesCount: 16,
      licenseType: "Single Commercial",
      documentationFormat: "Full Markdown Wiki + Postman API Collection",
      previewUrl: "https://saaskit-demo.example.com"
    }
  },
  {
    id: "tm-02",
    slug: "fintech-metrics-analytics-admin-dashboard-template",
    title: "FinPulse — High-Density Financial Analytics & Ledger Dashboard",
    shortDescription: "Ultra-responsive admin template with real-time financial charts, transactions table, and CSV/Excel export.",
    fullDescription: "Built with shadcn/ui and Recharts. Features ledger view, balance breakdown cards, date range filtering, dark/light theme, custom financial tooltips, and zero runtime layout shift.",
    listingType: "TEMPLATE",
    category: "SaaS & Web Apps",
    priceINR: 2499,
    originalPriceINR: 3500,
    tags: ["Admin Dashboard", "Fintech", "Recharts", "shadcn/ui"],
    techStack: ["Next.js", "Tailwind CSS", "Recharts", "Lucide Icons", "Radix UI"],
    previewImageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-05",
      name: "PixelWave Studio (Demo Profile)",
      handle: "@pixelwave",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      bio: "Award-winning boutique design agency building digital experiences that convert.",
      location: "Mumbai, India",
      memberSince: "Apr 2024",
      isVerifiedDemo: true,
      salesCountDemo: 58,
      ratingDemo: 5.0,
      reviewCountDemo: 47,
      responseRateDemo: "Under 1 hour"
    },
    createdAt: "2024-10-14T12:00:00Z",
    updatedAt: "2024-11-03T14:30:00Z",
    templateDetails: {
      framework: "Next.js 14 + Tailwind CSS",
      responsiveBreakpoints: ["Mobile", "Tablet", "Desktop", "Ultrawide"],
      includedPagesCount: 12,
      licenseType: "Extended Commercial",
      documentationFormat: "Storybook + Interactive Docs",
      previewUrl: "https://finpulse-demo.example.com"
    }
  },
  {
    id: "tm-03",
    slug: "nexus-modern-developer-portfolio-and-blog-template",
    title: "NexusDev — Minimalist Software Engineer Portfolio & Technical Blog",
    shortDescription: "Clean, markdown-powered portfolio with GitHub project showcase, interactive code blocks, and resume export.",
    fullDescription: "A standout portfolio for software developers looking to land remote roles or client contracts. Features MDX blogging, syntax highlighting, reading time calculator, project filtering by tech stack, and zero-config Vercel deployment.",
    listingType: "TEMPLATE",
    category: "Agency & Portfolio",
    priceINR: 1499,
    tags: ["Portfolio", "MDX", "Clean Design", "Developer Tools"],
    techStack: ["Next.js", "MDX", "Tailwind CSS", "TypeScript"],
    previewImageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-03",
      name: "Vikram Sen (Demo Profile)",
      handle: "@vsen_health",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      bio: "Health-tech architect crafting accessible medical web apps and digital patient workflows.",
      location: "Pune, India",
      memberSince: "Feb 2024",
      isVerifiedDemo: true,
      salesCountDemo: 27,
      ratingDemo: 5.0,
      reviewCountDemo: 22,
      responseRateDemo: "Within 2 hours"
    },
    createdAt: "2024-10-16T15:00:00Z",
    updatedAt: "2024-11-04T16:00:00Z",
    templateDetails: {
      framework: "Next.js Static Export",
      responsiveBreakpoints: ["Mobile", "Tablet", "Desktop"],
      includedPagesCount: 6,
      licenseType: "Single Commercial",
      documentationFormat: "README.md with setup guide",
      previewUrl: "https://nexus-demo.example.com"
    }
  },
  {
    id: "tm-04",
    slug: "shoppy-headless-ecommerce-ui-components-library",
    title: "ShoppyUI — 45+ Headless React E-Commerce Components & Patterns",
    shortDescription: "Copy-paste e-commerce components: product carousels, size matrices, slide-over carts, and reviews widgets.",
    fullDescription: "A comprehensive design system for building custom online stores. Compatible with Shopify Storefront API, MedusaJS, and custom backends. Handcrafted with Tailwind CSS and Radix UI primitives.",
    listingType: "TEMPLATE",
    category: "E-Commerce",
    priceINR: 3499,
    originalPriceINR: 4999,
    tags: ["UI Kit", "E-Commerce", "Headless", "Radix UI"],
    techStack: ["React", "Tailwind CSS", "TypeScript", "Radix UI"],
    previewImageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-05",
      name: "PixelWave Studio (Demo Profile)",
      handle: "@pixelwave",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      bio: "Award-winning boutique design agency building digital experiences that convert.",
      location: "Mumbai, India",
      memberSince: "Apr 2024",
      isVerifiedDemo: true,
      salesCountDemo: 58,
      ratingDemo: 5.0,
      reviewCountDemo: 47,
      responseRateDemo: "Under 1 hour"
    },
    createdAt: "2024-10-19T09:10:00Z",
    updatedAt: "2024-11-06T11:00:00Z",
    templateDetails: {
      framework: "React 18 / Next.js",
      responsiveBreakpoints: ["Mobile", "Tablet", "Desktop"],
      includedPagesCount: 14,
      licenseType: "Unlimited Multi-Use",
      documentationFormat: "Component Playground & Storybook",
      previewUrl: "https://shoppyui-demo.example.com"
    }
  },
  {
    id: "tm-05",
    slug: "ai-prompt-generator-and-content-writer-saas-template",
    title: "WriteGenius — OpenAI & Claude AI Wrapper Web App Starter",
    shortDescription: "Ready-to-deploy AI content generator with streaming responses, token usage billing, and prompt history.",
    fullDescription: "Launch an AI micro-SaaS in a weekend. Features streaming UI hooks, OpenAI & Anthropic API integrations, credit-based usage tracking, prompt library, and export to PDF/Markdown.",
    listingType: "TEMPLATE",
    category: "SaaS & Web Apps",
    priceINR: 3999,
    tags: ["AI SaaS", "OpenAI", "Streaming UI", "Boilerplate"],
    techStack: ["Next.js 14", "Vercel AI SDK", "Tailwind CSS", "Supabase"],
    previewImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-01",
      name: "Aarav Sharma (Demo Profile)",
      handle: "@aarav_codes",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      bio: "Senior full-stack dev specializing in modern Next.js and e-commerce solutions for Indian D2C businesses.",
      location: "Bengaluru, India",
      memberSince: "Jan 2024",
      isVerifiedDemo: true,
      salesCountDemo: 42,
      ratingDemo: 4.9,
      reviewCountDemo: 38,
      responseRateDemo: "Under 1 hour"
    },
    createdAt: "2024-10-21T13:00:00Z",
    updatedAt: "2024-11-07T14:45:00Z",
    templateDetails: {
      framework: "Next.js App Router (TypeScript)",
      responsiveBreakpoints: ["Mobile", "Tablet", "Desktop"],
      includedPagesCount: 8,
      licenseType: "Single Commercial",
      documentationFormat: "Step-by-step Setup Guide + Video",
      previewUrl: "https://writegenius-demo.example.com"
    }
  },
  {
    id: "tm-06",
    slug: "dharini-sustainable-lifestyle-blog-and-magazine-theme",
    title: "Dharini — High-Performance Editorial Magazine & Content Theme",
    shortDescription: "Ultra-fast Next.js blog template scoring 100/100 on Google PageSpeed with newsletter popup and affiliate link blocks.",
    fullDescription: "Built for niche affiliate publishers and content creators. Includes SEO schema markup for articles, newsletter integration (Mailchimp/ConvertKit), sponsored post badges, and social share triggers.",
    listingType: "TEMPLATE",
    category: "Blog & Media",
    priceINR: 1999,
    tags: ["Blog", "Magazine", "SEO 100", "Affiliate"],
    techStack: ["Next.js", "Tailwind CSS", "Contentlayer", "TypeScript"],
    previewImageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-04",
      name: "Kavita Rao (Demo Profile)",
      handle: "@kavita_edtech",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      bio: "Edtech engineer and teacher creating accessible self-hosted educational platforms.",
      location: "Hyderabad, India",
      memberSince: "May 2024",
      isVerifiedDemo: true,
      salesCountDemo: 31,
      ratingDemo: 4.9,
      reviewCountDemo: 26,
      responseRateDemo: "Within 4 hours"
    },
    createdAt: "2024-10-23T17:00:00Z",
    updatedAt: "2024-11-09T09:00:00Z",
    templateDetails: {
      framework: "Next.js Static",
      responsiveBreakpoints: ["Mobile", "Tablet", "Desktop"],
      includedPagesCount: 10,
      licenseType: "Single Commercial",
      documentationFormat: "Markdown Documentation",
      previewUrl: "https://dharini-demo.example.com"
    }
  },
  {
    id: "tm-07",
    slug: "eventhub-ticketing-and-conference-landing-page",
    title: "EventPulse — High-Conversion Tech Summit & Event Landing Page",
    shortDescription: "Conference landing page featuring speaker grid, multi-track agenda timetable, and embedded ticket checkout.",
    fullDescription: "Promote your hackathon, tech summit, or workshop. Features animated countdown timer, sponsor tier grids, speaker modal deep dives, venue interactive map, and ticket tier selector.",
    listingType: "TEMPLATE",
    category: "Booking & Services",
    priceINR: 1799,
    tags: ["Event", "Conference", "Agenda", "Ticket Sales"],
    techStack: ["Next.js", "Tailwind CSS", "Framer Motion", "TypeScript"],
    previewImageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-02",
      name: "Priya Patel (Demo Profile)",
      handle: "@priyatech",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
      bio: "Ex-proptech frontend lead building niche portal solutions for brokers and builders.",
      location: "Ahmedabad, India",
      memberSince: "Mar 2024",
      isVerifiedDemo: true,
      salesCountDemo: 19,
      ratingDemo: 4.8,
      reviewCountDemo: 15,
      responseRateDemo: "Under 3 hours"
    },
    createdAt: "2024-10-26T12:00:00Z",
    updatedAt: "2024-11-10T15:00:00Z",
    templateDetails: {
      framework: "Next.js",
      responsiveBreakpoints: ["Mobile", "Tablet", "Desktop"],
      includedPagesCount: 5,
      licenseType: "Single Commercial",
      documentationFormat: "Setup Guide",
      previewUrl: "https://eventpulse-demo.example.com"
    }
  },
  {
    id: "tm-08",
    slug: "finvault-crypto-web3-wallet-interface-template",
    title: "FinVault — Web3 Decentralized Finance Dashboard & Token Swap UI",
    shortDescription: "Clean, institutional-grade cryptocurrency dashboard with Wagmi & RainbowKit wallet connectors and token swap modal.",
    fullDescription: "Complete frontend template for decentralized finance (DeFi) protocols and token apps. Features portfolio token tracking, transaction history with status chips, gas fee estimator, and slippage tolerance settings.",
    listingType: "TEMPLATE",
    category: "SaaS & Web Apps",
    priceINR: 3299,
    tags: ["Web3", "Crypto", "DeFi", "Wagmi"],
    techStack: ["Next.js", "Tailwind CSS", "Wagmi", "Viem", "TypeScript"],
    previewImageUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-03",
      name: "Vikram Sen (Demo Profile)",
      handle: "@vsen_health",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      bio: "Health-tech architect crafting accessible medical web apps and digital patient workflows.",
      location: "Pune, India",
      memberSince: "Feb 2024",
      isVerifiedDemo: true,
      salesCountDemo: 27,
      ratingDemo: 5.0,
      reviewCountDemo: 22,
      responseRateDemo: "Within 2 hours"
    },
    createdAt: "2024-10-28T14:30:00Z",
    updatedAt: "2024-11-12T10:00:00Z",
    templateDetails: {
      framework: "Next.js 14",
      responsiveBreakpoints: ["Mobile", "Tablet", "Desktop"],
      includedPagesCount: 7,
      licenseType: "Single Commercial",
      documentationFormat: "Web3 Integration Guide",
      previewUrl: "https://finvault-demo.example.com"
    }
  },

  // ==========================================
  // 3. ONLINE BUSINESSES FOR SALE (4 items)
  // ==========================================
  {
    id: "biz-01",
    slug: "invoicely-b2b-gst-invoicing-saas-business",
    title: "Invoicely India — Profitable Micro-SaaS for Freelancers & SMBs (GST Invoicing)",
    shortDescription: "Established 2-year old micro-SaaS with 850+ paying Indian subscribers, generating ₹1.8L monthly net profit.",
    fullDescription: "Invoicely is a lightweight GST compliant billing and invoicing web app for freelancers, consultants, and agencies. Low churn (2.8%), high gross margin (91%), and fully automated Razorpay recurring billing. Sale includes domain, source code, active customer database, and 60 days of founder transition support.",
    listingType: "BUSINESS",
    category: "SaaS & Web Apps",
    priceINR: 4800000,
    originalPriceINR: 5200000,
    isFeatured: true,
    tags: ["Acquisition", "Profitable SaaS", "High Margin", "Recurring Revenue"],
    techStack: ["Next.js", "PostgreSQL", "Supabase", "Razorpay Subscriptions", "AWS SES"],
    previewImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-06",
      name: "Rohit & Meera Verma (Demo Profile)",
      handle: "@rohit_saas",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      bio: "Bootstrapped SaaS founders moving on to their next venture in healthcare tech.",
      location: "Gurugram, India",
      memberSince: "Nov 2023",
      isVerifiedDemo: true,
      salesCountDemo: 3,
      ratingDemo: 5.0,
      reviewCountDemo: 8,
      responseRateDemo: "Under 2 hours"
    },
    createdAt: "2024-10-05T08:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
    businessDetails: {
      annualRecurringRevenueINR: 2650000,
      monthlyNetProfitINR: 185000,
      profitMarginPercent: 84,
      businessAgeMonths: 26,
      primaryMonetization: "Monthly & Annual Subscriptions",
      customerCountEstimate: 870,
      multipleOfProfit: 2.16,
      dueDiligenceStatus: "Audited Financials Demo"
    }
  },
  {
    id: "biz-02",
    slug: "ayurveda-daily-content-and-affiliate-portal",
    title: "VedaPure — High-Authority Wellness Blog with D2C Affiliate Revenue",
    shortDescription: "Established health publication with 220,000 monthly organic pageviews and diversified brand affiliate partnerships.",
    fullDescription: "VedaPure generates steady passive income through high-intent SEO rankings for herbal supplements and wellness products. Zero paid marketing. Strong domain authority (DA 38) with over 350 published articles and a verified 45,000 subscriber email newsletter.",
    listingType: "BUSINESS",
    category: "Blog & Media",
    priceINR: 1850000,
    tags: ["Acquisition", "Content Site", "Organic Traffic", "Affiliate"],
    techStack: ["Next.js", "Tailwind CSS", "Vercel", "ConvertKit", "Google Analytics"],
    previewImageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512290900672-1f41793540e5?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-07",
      name: "Ananya Iyer (Demo Profile)",
      handle: "@ananya_media",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      bio: "Digital media operator and publisher focusing on organic search and health domains.",
      location: "Chennai, India",
      memberSince: "Jan 2024",
      isVerifiedDemo: true,
      salesCountDemo: 5,
      ratingDemo: 4.9,
      reviewCountDemo: 12,
      responseRateDemo: "Within 6 hours"
    },
    createdAt: "2024-10-10T11:00:00Z",
    updatedAt: "2024-11-04T12:00:00Z",
    businessDetails: {
      annualRecurringRevenueINR: 960000,
      monthlyNetProfitINR: 72000,
      profitMarginPercent: 90,
      businessAgeMonths: 34,
      primaryMonetization: "Affiliate Commissions & Sponsored Guides",
      customerCountEstimate: 45000,
      multipleOfProfit: 2.14,
      dueDiligenceStatus: "Self-Reported Demo"
    }
  },
  {
    id: "biz-03",
    slug: "desidev-remote-tech-job-board-india",
    title: "DesiRemote — Niche Developer Job Board for High-Paying Global Tech Roles",
    shortDescription: "Profitable job board charging ₹4,500 per sponsored post with 18,000 active Indian software engineer email subscribers.",
    fullDescription: "DesiRemote helps US and European tech startups hire remote Indian software engineers. Steady inbound demand from tech recruiters and hiring teams. Built on a clean Next.js stack with automated newsletter distribution.",
    listingType: "BUSINESS",
    category: "Directory & Marketplace",
    priceINR: 2400000,
    tags: ["Acquisition", "Job Board", "Newsletter", "Recruitment"],
    techStack: ["Next.js", "Supabase", "Tailwind CSS", "Resend", "Razorpay"],
    previewImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-06",
      name: "Rohit & Meera Verma (Demo Profile)",
      handle: "@rohit_saas",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      bio: "Bootstrapped SaaS founders moving on to their next venture in healthcare tech.",
      location: "Gurugram, India",
      memberSince: "Nov 2023",
      isVerifiedDemo: true,
      salesCountDemo: 3,
      ratingDemo: 5.0,
      reviewCountDemo: 8,
      responseRateDemo: "Under 2 hours"
    },
    createdAt: "2024-10-18T14:00:00Z",
    updatedAt: "2024-11-07T16:00:00Z",
    businessDetails: {
      annualRecurringRevenueINR: 1440000,
      monthlyNetProfitINR: 98000,
      profitMarginPercent: 82,
      businessAgeMonths: 20,
      primaryMonetization: "Paid Job Postings & Company Spotlight Packages",
      customerCountEstimate: 18000,
      multipleOfProfit: 2.04,
      dueDiligenceStatus: "Audited Financials Demo"
    }
  },
  {
    id: "biz-04",
    slug: "chai-co-custom-merchandise-ecommerce-brand",
    title: "ChaiCulture — Cult D2C Apparel & Merchandise Brand with Active Community",
    shortDescription: "Established streetwear & quirky merchandise store with ₹3.4L monthly revenue and contracted dropship production.",
    fullDescription: "ChaiCulture owns a passionate following among young Indian professionals. Zero inventory risk due to automated on-demand printing and fulfillment partner integrations. Includes trademarks, Shopify store migration code, 32,000 Instagram followers, and customer list.",
    listingType: "BUSINESS",
    category: "E-Commerce",
    priceINR: 3200000,
    tags: ["Acquisition", "D2C Brand", "Apparel", "Social Community"],
    techStack: ["Next.js", "Shopify Headless", "Tailwind CSS", "Shiprocket"],
    previewImageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-07",
      name: "Ananya Iyer (Demo Profile)",
      handle: "@ananya_media",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      bio: "Digital media operator and publisher focusing on organic search and health domains.",
      location: "Chennai, India",
      memberSince: "Jan 2024",
      isVerifiedDemo: true,
      salesCountDemo: 5,
      ratingDemo: 4.9,
      reviewCountDemo: 12,
      responseRateDemo: "Within 6 hours"
    },
    createdAt: "2024-10-24T15:30:00Z",
    updatedAt: "2024-11-10T17:00:00Z",
    businessDetails: {
      annualRecurringRevenueINR: 4100000,
      monthlyNetProfitINR: 125000,
      profitMarginPercent: 37,
      businessAgeMonths: 28,
      primaryMonetization: "Direct-to-Consumer Physical Product Sales",
      customerCountEstimate: 4200,
      multipleOfProfit: 2.13,
      dueDiligenceStatus: "Platform Review Pending"
    }
  },

  // ==========================================
  // 4. CUSTOMIZATION & DEVELOPMENT SERVICES (4 items)
  // ==========================================
  {
    id: "srv-01",
    slug: "turnkey-website-rebranding-and-cloud-deployment",
    title: "Complete Website Rebranding, Custom Domain & Vercel/AWS Cloud Deployment",
    shortDescription: "Have any purchased website or template customized with your logo, colors, copy, and deployed to your live domain in 48 hours.",
    fullDescription: "Buy with total peace of mind. Our verified full-stack deployment specialist will take your chosen WebBazaar website, swap branding assets, configure DNS/SSL certificates, set up database environments, and ensure 100% operational status on your cloud provider.",
    listingType: "SERVICE",
    category: "Booking & Services",
    priceINR: 5999,
    originalPriceINR: 8500,
    isFeatured: true,
    isTrending: true,
    tags: ["Customization", "Cloud Deployment", "Fast Turnaround", "Vercel / AWS"],
    techStack: ["Next.js", "Supabase", "AWS", "Vercel", "DNS & SSL"],
    previewImageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-01",
      name: "Aarav Sharma (Demo Profile)",
      handle: "@aarav_codes",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      bio: "Senior full-stack dev specializing in modern Next.js and e-commerce solutions for Indian D2C businesses.",
      location: "Bengaluru, India",
      memberSince: "Jan 2024",
      isVerifiedDemo: true,
      salesCountDemo: 42,
      ratingDemo: 4.9,
      reviewCountDemo: 38,
      responseRateDemo: "Under 1 hour"
    },
    createdAt: "2024-10-15T12:00:00Z",
    updatedAt: "2024-11-05T16:00:00Z",
    serviceDetails: {
      turnaroundDays: 2,
      revisionsIncluded: 3,
      deliverables: [
        "Brand identity integration (Logos, Color Palette, Fonts)",
        "DNS records configuration & SSL certificates setup",
        "Database provisioning (Supabase / Neon / RDS)",
        "Environment variables setup & security verification",
        "Live deployment on Vercel or cloud VPS",
        "Recorded 15-minute walkthrough video of your new portal"
      ],
      techExpertise: ["Next.js", "React", "Supabase", "Vercel", "Tailwind CSS"],
      scopeSummary: "Full rebranding and production deployment for 1 website codebase."
    }
  },
  {
    id: "srv-02",
    slug: "razorpay-and-upi-payment-gateway-integration-service",
    title: "Indian Payment Gateway Integration (Razorpay, Cashfree, UPI QR & Webhooks)",
    shortDescription: "Seamless payment checkout integration for any web application with automated invoice email and webhook verification.",
    fullDescription: "Add trusted Indian payment collection to your SaaS, e-commerce, or service portal. We integrate Razorpay standard checkout, UPI auto-routing, secure server-side webhook signature verification, and customer receipt delivery.",
    listingType: "SERVICE",
    category: "SaaS & Web Apps",
    priceINR: 4499,
    tags: ["Payments", "Razorpay", "UPI", "Webhook Security"],
    techStack: ["Razorpay API", "Node.js", "Next.js", "Cashfree", "Webhooks"],
    previewImageUrl: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-03",
      name: "Vikram Sen (Demo Profile)",
      handle: "@vsen_health",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      bio: "Health-tech architect crafting accessible medical web apps and digital patient workflows.",
      location: "Pune, India",
      memberSince: "Feb 2024",
      isVerifiedDemo: true,
      salesCountDemo: 27,
      ratingDemo: 5.0,
      reviewCountDemo: 22,
      responseRateDemo: "Within 2 hours"
    },
    createdAt: "2024-10-17T15:00:00Z",
    updatedAt: "2024-11-06T13:00:00Z",
    serviceDetails: {
      turnaroundDays: 3,
      revisionsIncluded: 2,
      deliverables: [
        "Payment gateway account connection & sandbox testing",
        "Frontend checkout modal with UPI, Cards, Netbanking",
        "Server-side order generation & signature verification",
        "Automated GST invoice generation & customer email dispatch",
        "Handling edge-cases: failed payments, network drops, refunds"
      ],
      techExpertise: ["Razorpay", "Node.js", "Next.js", "PostgreSQL"],
      scopeSummary: "Integration of 1 Indian payment gateway with full webhook security."
    }
  },
  {
    id: "srv-03",
    slug: "whatsapp-business-api-and-sms-notifications-service",
    title: "WhatsApp Cloud API & Automated Customer Notification Engine Setup",
    shortDescription: "Automate transactional order confirmations, delivery alerts, and customer lead notifications via WhatsApp.",
    fullDescription: "Boost customer engagement with WhatsApp transactional messaging. Setup Meta WhatsApp Cloud API credentials, create message templates, link triggers from your database or webhook events, and enable real-time replies.",
    listingType: "SERVICE",
    category: "Booking & Services",
    priceINR: 4999,
    tags: ["WhatsApp API", "Meta Cloud", "Automation", "Lead Alerts"],
    techStack: ["WhatsApp Cloud API", "Meta for Developers", "Node.js", "Webhooks"],
    previewImageUrl: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-02",
      name: "Priya Patel (Demo Profile)",
      handle: "@priyatech",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
      bio: "Ex-proptech frontend lead building niche portal solutions for brokers and builders.",
      location: "Ahmedabad, India",
      memberSince: "Mar 2024",
      isVerifiedDemo: true,
      salesCountDemo: 19,
      ratingDemo: 4.8,
      reviewCountDemo: 15,
      responseRateDemo: "Under 3 hours"
    },
    createdAt: "2024-10-20T10:00:00Z",
    updatedAt: "2024-11-08T11:00:00Z",
    serviceDetails: {
      turnaroundDays: 3,
      revisionsIncluded: 2,
      deliverables: [
        "Meta Business Manager WhatsApp Cloud API setup",
        "Submission & approval of 3 custom transactional message templates",
        "Database trigger / API endpoint configuration",
        "Two-way customer reply routing to support email or dashboard",
        "Compliance checklist for zero-spam WhatsApp policy"
      ],
      techExpertise: ["WhatsApp API", "JavaScript", "Meta Developers", "Cloud Functions"],
      scopeSummary: "Setup of WhatsApp transactional alerts for 3 distinct user triggers."
    }
  },
  {
    id: "srv-04",
    slug: "seo-audit-and-pagespeed-optimization-service",
    title: "Core Web Vitals & Technical SEO Performance Optimization (90+ Score)",
    shortDescription: "Transform slow websites into lightning-fast, high-ranking pages with image compression, code splitting, and schema.",
    fullDescription: "Speed is revenue. We audit your web application, eliminate render-blocking JavaScript, optimize font loading, implement Next.js dynamic imports, compress assets, and structure schema.org metadata for rich Google search snippets.",
    listingType: "SERVICE",
    category: "Agency & Portfolio",
    priceINR: 6499,
    originalPriceINR: 9000,
    tags: ["SEO", "PageSpeed", "Core Web Vitals", "Performance"],
    techStack: ["Lighthouse", "Next.js", "Web Vitals", "Schema.org", "CDN"],
    previewImageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80"
    ],
    seller: {
      id: "sel-05",
      name: "PixelWave Studio (Demo Profile)",
      handle: "@pixelwave",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      bio: "Award-winning boutique design agency building digital experiences that convert.",
      location: "Mumbai, India",
      memberSince: "Apr 2024",
      isVerifiedDemo: true,
      salesCountDemo: 58,
      ratingDemo: 5.0,
      reviewCountDemo: 47,
      responseRateDemo: "Under 1 hour"
    },
    createdAt: "2024-10-22T14:00:00Z",
    updatedAt: "2024-11-10T09:30:00Z",
    serviceDetails: {
      turnaroundDays: 4,
      revisionsIncluded: 3,
      deliverables: [
        "Comprehensive before/after Lighthouse audit report",
        "Image optimization (WebP/AVIF) and responsive srcSet configuration",
        "Elimination of cumulative layout shifts (CLS) and long tasks (LCP)",
        "JSON-LD structured data implementation (Organization, Product, FAQ)",
        "Robots.txt & XML sitemap generation & Google Search Console verification"
      ],
      techExpertise: ["Lighthouse", "Next.js", "Chrome DevTools", "Technical SEO"],
      scopeSummary: "Complete performance overhaul for up to 10 web pages."
    }
  }
];

export const CATEGORIES_LIST = [
  "E-Commerce",
  "SaaS & Web Apps",
  "Agency & Portfolio",
  "Restaurant & Food",
  "Real Estate",
  "Healthcare & Wellness",
  "Education & LMS",
  "Booking & Services",
  "Directory & Marketplace",
  "Blog & Media"
] as const;

export const POPULAR_TECH_STACKS = [
  "Next.js",
  "React",
  "Tailwind CSS",
  "TypeScript",
  "Supabase",
  "PostgreSQL",
  "Razorpay",
  "Prisma",
  "Node.js"
];
