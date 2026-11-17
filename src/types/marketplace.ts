export type ListingType = 'READY_WEBSITE' | 'TEMPLATE' | 'BUSINESS' | 'SERVICE';

export type Category =
  | 'E-Commerce'
  | 'SaaS & Web Apps'
  | 'Agency & Portfolio'
  | 'Restaurant & Food'
  | 'Real Estate'
  | 'Healthcare & Wellness'
  | 'Education & LMS'
  | 'Booking & Services'
  | 'Directory & Marketplace'
  | 'Blog & Media';

export interface SellerProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  location: string;
  memberSince: string;
  isVerifiedDemo: boolean;
  salesCountDemo: number;
  ratingDemo: number;
  reviewCountDemo: number;
  responseRateDemo: string;
}

export interface ReadyWebsiteDetails {
  liveUrl?: string;
  adminDemoUrl?: string;
  monthlyHostingCostEstimateINR?: number;
  cmsOrFramework: string;
  databaseUsed: string;
  includedAssets: string[];
  deploymentGuideIncluded: boolean;
}

export interface TemplateDetails {
  framework: string;
  responsiveBreakpoints: string[];
  includedPagesCount: number;
  licenseType: 'Single Commercial' | 'Extended Commercial' | 'Unlimited Multi-Use';
  documentationFormat: string;
  previewUrl?: string;
}

export interface BusinessDetails {
  annualRecurringRevenueINR: number;
  monthlyNetProfitINR: number;
  profitMarginPercent: number;
  businessAgeMonths: number;
  primaryMonetization: string;
  customerCountEstimate: number;
  multipleOfProfit: number;
  dueDiligenceStatus: 'Audited Financials Demo' | 'Self-Reported Demo' | 'Platform Review Pending';
}

export interface ServiceDetails {
  turnaroundDays: number;
  revisionsIncluded: number;
  deliverables: string[];
  techExpertise: string[];
  scopeSummary: string;
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  listingType: ListingType;
  category: Category;
  priceINR: number;
  originalPriceINR?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  tags: string[];
  techStack: string[];
  previewImageUrl: string;
  galleryImages: string[];
  seller: SellerProfile;
  createdAt: string;
  updatedAt: string;
  readyWebsiteDetails?: ReadyWebsiteDetails;
  templateDetails?: TemplateDetails;
  businessDetails?: BusinessDetails;
  serviceDetails?: ServiceDetails;
}

export type SortOption =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'featured'
  | 'profit-desc';

export interface ListingFilterState {
  searchQuery: string;
  listingType?: ListingType | 'ALL';
  category?: Category | 'ALL';
  minPrice?: number;
  maxPrice?: number;
  techStack?: string[];
  sortBy: SortOption;
}
