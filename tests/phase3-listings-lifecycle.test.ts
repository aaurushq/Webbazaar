import { describe, it, expect } from "vitest";
import {
  baseListingSchema,
  readyWebsiteDetailsSchema,
  templateDetailsSchema,
  businessDetailsSchema,
  serviceDetailsSchema,
  createListingInputSchema,
} from "@/lib/listings/schemas";

describe("WebBazaar Phase 3: Listings Input & Category Schema Validation", () => {
  it("enforces title length, slug pattern, and integer INR pricing on base listing", () => {
    // Missing title or too short
    const shortTitle = baseListingSchema.safeParse({
      title: "Hey",
      slug: "hey-site",
      categoryId: "E-Commerce",
      listingType: "READY_WEBSITE",
      shortDescription: "Valid short description for testing purposes.",
      fullDescription: "Valid full description with plenty of characters to pass the fifty character requirement.",
      priceInr: 5000,
    });
    expect(shortTitle.success).toBe(false);

    // Invalid slug (contains spaces and uppercase)
    const badSlug = baseListingSchema.safeParse({
      title: "Valid Title For Listing",
      slug: "Bad Slug With Spaces",
      categoryId: "E-Commerce",
      listingType: "READY_WEBSITE",
      shortDescription: "Valid short description for testing purposes.",
      fullDescription: "Valid full description with plenty of characters to pass the fifty character requirement.",
      priceInr: 5000,
    });
    expect(badSlug.success).toBe(false);

    // Negative price
    const negativePrice = baseListingSchema.safeParse({
      title: "Valid Title For Listing",
      slug: "valid-title-for-listing",
      categoryId: "E-Commerce",
      listingType: "READY_WEBSITE",
      shortDescription: "Valid short description for testing purposes.",
      fullDescription: "Valid full description with plenty of characters to pass the fifty character requirement.",
      priceInr: -500,
    });
    expect(negativePrice.success).toBe(false);

    // Float price (must be integer minor units)
    const floatPrice = baseListingSchema.safeParse({
      title: "Valid Title For Listing",
      slug: "valid-title-for-listing",
      categoryId: "E-Commerce",
      listingType: "READY_WEBSITE",
      shortDescription: "Valid short description for testing purposes.",
      fullDescription: "Valid full description with plenty of characters to pass the fifty character requirement.",
      priceInr: 5000.75,
    });
    expect(floatPrice.success).toBe(false);

    // Valid base listing
    const valid = baseListingSchema.safeParse({
      title: "Production Next.js 14 Fashion Marketplace",
      slug: "production-nextjs-14-fashion-marketplace",
      categoryId: "E-Commerce",
      listingType: "READY_WEBSITE",
      shortDescription: "Complete turnkey fashion store with live payments and admin dashboard.",
      fullDescription: "Production-grade fashion marketplace platform built using Next.js 14, Tailwind CSS, Supabase database, and Razorpay payment gateway.",
      priceInr: 14999,
      demoUrl: "https://demo.example.com",
    });
    expect(valid.success).toBe(true);
  });

  it("validates Ready-Made Website specifications", () => {
    // Missing tech stack
    const missingStack = readyWebsiteDetailsSchema.safeParse({
      websiteCategory: "E-Commerce",
      techStack: [],
      keyFeatures: ["User Auth"],
      includedPages: "Home, Shop",
      deliveryMethod: "Full Code",
      licenseType: "Single Commercial",
    });
    expect(missingStack.success).toBe(false);

    // Valid ready website details
    const valid = readyWebsiteDetailsSchema.safeParse({
      websiteCategory: "E-Commerce",
      techStack: ["Next.js", "Supabase", "Stripe"],
      keyFeatures: ["Authentication", "Responsive Design", "Admin Dashboard"],
      isResponsive: true,
      includedPages: "Home, Products, Checkout, Account",
      deliveryMethod: "ZIP Archive & GitHub Transfer",
      licenseType: "Single Domain License",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.isResponsive).toBe(true);
    }
  });

  it("validates Template & Source Code specifications", () => {
    // Valid template
    const valid = templateDetailsSchema.safeParse({
      framework: "Flutter 3.x",
      programmingLanguage: "Dart",
      compatibleVersions: "Flutter 3.19+",
      includedFiles: "Full source code, Figma assets, API documentation",
      hasDocumentation: true,
      licenseType: "Extended Commercial",
      installationInstructions: "Run flutter pub get && flutter run",
      supportDurationDays: 60,
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.supportDurationDays).toBe(60);
    }
  });

  it("validates Online Business financial metrics and required fields", () => {
    // Negative revenue or profit
    const invalidFinancials = businessDetailsSchema.safeParse({
      businessModel: "SaaS",
      askingPriceInr: 150000,
      industry: "EdTech",
      operatingHistoryMonths: 12,
      monthlyRevenueInr: -1000,
      monthlyProfitInr: 5000,
      monthlyTraffic: 5000,
      monetizationMethods: "Stripe Subscriptions",
      includedAssets: "Domain, Code, Customer list",
      reasonForSale: "Career change",
    });
    expect(invalidFinancials.success).toBe(false);

    // Valid business details
    const valid = businessDetailsSchema.safeParse({
      businessModel: "Micro-SaaS",
      askingPriceInr: 450000,
      industry: "Developer Tools",
      operatingHistoryMonths: 18,
      monthlyRevenueInr: 65000,
      monthlyProfitInr: 48000,
      monthlyTraffic: 14000,
      monetizationMethods: "Monthly Recurring Subscriptions",
      includedAssets: "Domain, AWS account, Database, Stripe customer base",
      reasonForSale: "Solo founder moving to enterprise role",
      confidentialNotes: "P&L report available upon NDA request",
    });
    expect(valid.success).toBe(true);
  });

  it("validates Development Service specifications", () => {
    const valid = serviceDetailsSchema.safeParse({
      serviceCategory: "Full-Stack Web Development",
      deliverables: "Complete web app, Responsive layout, API endpoints, Documentation",
      startingPriceInr: 25000,
      estimatedDeliveryDays: 14,
      revisionPolicy: "3 rounds of revisions included within 30 days",
      supportedTechnologies: "React, Node.js, PostgreSQL",
      buyerRequirements: "Figma design files and API access",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.estimatedDeliveryDays).toBe(14);
    }
  });

  it("validates unified CreateListingInput with category details", () => {
    const fullPayload = {
      title: "SaaS Starter Kit for Indian Startups",
      slug: "saas-starter-kit-indian-startups",
      categoryId: "SaaS & Web Apps",
      listingType: "TEMPLATE" as const,
      shortDescription: "Complete production-ready Next.js SaaS boilerplate with Razorpay and Supabase.",
      fullDescription: "A turnkey software boilerplate designed to launch SaaS businesses in days. Features robust authentication, role-based access control, and webhooks.",
      priceInr: 7999,
      demoUrl: "https://starterkit.example.com",
      submitForReview: true,
      templateDetails: {
        framework: "Next.js 14 App Router",
        programmingLanguage: "TypeScript",
        compatibleVersions: "Node 18+",
        includedFiles: "Full codebase, documentation, SQL migrations",
        hasDocumentation: true,
        licenseType: "Commercial License",
        installationInstructions: "Clone repo, run npm install, configure env, run npm run dev",
        supportDurationDays: 30,
      },
    };

    const result = createListingInputSchema.safeParse(fullPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.submitForReview).toBe(true);
      expect(result.data.templateDetails?.framework).toBe("Next.js 14 App Router");
    }
  });
});
