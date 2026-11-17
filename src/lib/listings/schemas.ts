import { z } from 'zod';

export const listingTypeEnum = z.enum(['READY_WEBSITE', 'TEMPLATE', 'BUSINESS', 'SERVICE']);
export const listingStatusEnum = z.enum(['draft', 'pending_review', 'approved', 'rejected', 'archived']);

// Base Details
export const baseListingSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(120, 'Slug cannot exceed 120 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  categoryId: z.string().min(1, 'Please select a valid category'),
  listingType: listingTypeEnum,
  shortDescription: z
    .string()
    .min(15, 'Short description must be at least 15 characters')
    .max(250, 'Short description cannot exceed 250 characters'),
  fullDescription: z
    .string()
    .min(50, 'Full description must be at least 50 characters')
    .max(10000, 'Full description cannot exceed 10,000 characters'),
  priceInr: z
    .coerce
    .number()
    .int('Price must be an integer')
    .min(100, 'Minimum price is ₹100')
    .max(100000000, 'Maximum price is ₹10,00,00,000'),
  demoUrl: z
    .string()
    .url('Demo URL must be a valid URL (e.g. https://...)')
    .optional()
    .or(z.literal('')),
});

// 1. Ready-Made Website Details Schema
export const readyWebsiteDetailsSchema = z.object({
  websiteCategory: z.string().min(1, 'Website category is required'),
  techStack: z.array(z.string()).min(1, 'Specify at least one technology (e.g. Next.js, WordPress)'),
  keyFeatures: z.array(z.string()).min(1, 'Include at least one key feature'),
  isResponsive: z.boolean().default(true),
  installationRequirements: z.string().optional(),
  includedPages: z.string().min(1, 'Specify included pages (e.g. Home, About, Checkout, Contact)'),
  demoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  deliveryMethod: z.string().min(1, 'Select a delivery method (e.g. Full Source Code, Hosting Transfer)'),
  licenseType: z.string().min(1, 'Specify license type (e.g. Single Domain, Unlimited Use)'),
});

// 2. Templates & Source Code Schema
export const templateDetailsSchema = z.object({
  framework: z.string().min(1, 'Framework is required (e.g. React 19, Flutter 3, Next.js 14)'),
  programmingLanguage: z.string().min(1, 'Programming language is required (e.g. TypeScript, Python)'),
  compatibleVersions: z.string().min(1, 'Compatible versions (e.g. Node 18+, Python 3.11+)'),
  includedFiles: z.string().min(1, 'Included files summary (e.g. Full source code, Figma assets, DB schema)'),
  hasDocumentation: z.boolean().default(true),
  licenseType: z.string().min(1, 'License type (e.g. MIT, Single Commercial, Extended)'),
  installationInstructions: z.string().min(1, 'Basic installation instructions or README reference'),
  supportDurationDays: z.number().int().min(0).max(365).default(30),
});

// 3. Online Businesses Schema
export const businessDetailsSchema = z.object({
  businessModel: z.string().min(1, 'Business model is required (e.g. SaaS, E-commerce, Content site)'),
  askingPriceInr: z.number().int().min(1000, 'Asking price must be at least ₹1,000'),
  industry: z.string().min(1, 'Industry is required (e.g. FinTech, EdTech, D2C)'),
  operatingHistoryMonths: z.number().int().min(1, 'Operating history in months is required'),
  monthlyRevenueInr: z.number().int().min(0, 'Monthly revenue must be non-negative'),
  monthlyProfitInr: z.number().int().min(0, 'Monthly profit must be non-negative'),
  monthlyTraffic: z.number().int().min(0, 'Monthly traffic must be non-negative'),
  monetizationMethods: z.string().min(1, 'Monetization methods (e.g. Subscriptions, Ads, Affiliate)'),
  includedAssets: z.string().min(1, 'Included assets (e.g. Domain, Social media, Customer DB, IP)'),
  reasonForSale: z.string().min(1, 'Reason for sale is required'),
  confidentialNotes: z.string().optional(),
});

// 4. Development Services Schema
export const serviceDetailsSchema = z.object({
  serviceCategory: z.string().min(1, 'Service category is required (e.g. Full Stack Web, Custom API, UI/UX)'),
  deliverables: z.string().min(1, 'List clear deliverables for this service'),
  startingPriceInr: z.number().int().min(500, 'Starting price must be at least ₹500'),
  estimatedDeliveryDays: z.number().int().min(1, 'Estimated delivery days (at least 1 day)'),
  revisionPolicy: z.string().min(1, 'State revision policy (e.g. 2 rounds included, unlimited minor bug fixes)'),
  supportedTechnologies: z.string().min(1, 'Supported technologies (e.g. React, Node.js, Postgres)'),
  buyerRequirements: z.string().min(1, 'Requirements from buyer (e.g. Design assets, API keys, Scope brief)'),
});

// Unified Creation Input Schema
export const createListingInputSchema = baseListingSchema.extend({
  readyWebsiteDetails: readyWebsiteDetailsSchema.optional(),
  templateDetails: templateDetailsSchema.optional(),
  businessDetails: businessDetailsSchema.optional(),
  serviceDetails: serviceDetailsSchema.optional(),
  mediaPaths: z.array(z.string()).default([]),
  featuredImagePath: z.string().optional().nullable(),
  submitForReview: z.boolean().default(false),
});

export type CreateListingInput = z.infer<typeof createListingInputSchema>;
export type ReadyWebsiteDetailsInput = z.infer<typeof readyWebsiteDetailsSchema>;
export type TemplateDetailsInput = z.infer<typeof templateDetailsSchema>;
export type BusinessDetailsInput = z.infer<typeof businessDetailsSchema>;
export type ServiceDetailsInput = z.infer<typeof serviceDetailsSchema>;
