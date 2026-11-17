import { Listing, Category, ListingType } from "@/types/marketplace";
import { DEMO_LISTINGS } from "@/data/demo-listings";
import { getPublicApprovedListingsAction, getPublicListingBySlugAction } from "./actions";

function mapDbListingToMarketplace(dbItem: any): Listing {
  const defaultImage =
    dbItem.featured_image_path ||
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80";

  return {
    id: dbItem.id,
    slug: dbItem.slug,
    title: dbItem.title,
    shortDescription: dbItem.short_description,
    fullDescription: dbItem.full_description,
    listingType: dbItem.listing_type as ListingType,
    category: dbItem.category_id as Category,
    priceINR: Number(dbItem.price_inr),
    isFeatured: false,
    isTrending: false,
    isDemo: false, // REAL VERIFIED DATABASE LISTING
    tags: ["Verified Merchant", dbItem.listing_type.replace("_", " ")],
    techStack: [],
    previewImageUrl: defaultImage,
    galleryImages: [defaultImage],
    seller: {
      id: dbItem.seller?.id || dbItem.seller_id || "seller-unknown",
      name: dbItem.seller?.display_name || "Verified Merchant",
      handle: "@verified_merchant",
      avatarUrl:
        dbItem.seller?.avatar_path ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      bio: "Verified merchant on WebBazaar India.",
      location: "India",
      memberSince: "2024",
      isVerifiedDemo: true,
      salesCountDemo: 1,
      ratingDemo: 5.0,
      reviewCountDemo: 1,
      responseRateDemo: "Under 1 hour",
    },
    createdAt: dbItem.created_at,
    updatedAt: dbItem.published_at || dbItem.created_at,
  };
}

/**
 * Get unified listings: Real Supabase approved listings first, followed by Demo listings.
 */
export async function getUnifiedMarketplaceListings(filters?: {
  categoryId?: string;
  listingType?: string;
  search?: string;
}): Promise<Listing[]> {
  try {
    const { listings: dbListings } = await getPublicApprovedListingsAction(filters);
    const realMapped = (dbListings || []).map(mapDbListingToMarketplace);

    // Mark all demo listings explicitly with isDemo: true
    const demoItems = DEMO_LISTINGS.map((item) => ({ ...item, isDemo: true }));

    // Real approved listings appear at the very top of catalog
    return [...realMapped, ...demoItems];
  } catch {
    return DEMO_LISTINGS.map((item) => ({ ...item, isDemo: true }));
  }
}

/**
 * Get listing by slug, checking real Supabase database first, then falling back to demo.
 */
export async function getUnifiedListingBySlug(slug: string): Promise<Listing | null> {
  try {
    const { listing: dbListing } = await getPublicListingBySlugAction(slug);
    if (dbListing && dbListing.status === "approved") {
      const mapped = mapDbListingToMarketplace(dbListing);

      // Attach specialized details
      if (dbListing.ready_website_details) {
        const d = dbListing.ready_website_details;
        mapped.readyWebsiteDetails = {
          cmsOrFramework: d.tech_stack?.[0] || "Custom Stack",
          databaseUsed: d.tech_stack?.[1] || "PostgreSQL",
          includedAssets: d.key_features || [],
          deploymentGuideIncluded: true,
          liveUrl: d.demo_url || undefined,
        };
        mapped.techStack = d.tech_stack || [];
      } else if (dbListing.template_details) {
        const d = dbListing.template_details;
        mapped.templateDetails = {
          framework: d.framework || "React",
          responsiveBreakpoints: ["Mobile", "Tablet", "Desktop"],
          includedPagesCount: 10,
          licenseType: "Single Commercial",
          documentationFormat: d.has_documentation ? "Markdown + README" : "README",
        };
      } else if (dbListing.businessDetails) {
        const d = dbListing.businessDetails;
        mapped.businessDetails = {
          annualRecurringRevenueINR: Number(d.monthly_revenue_inr || 0) * 12,
          monthlyNetProfitINR: Number(d.monthly_profit_inr || 0),
          profitMarginPercent: d.monthly_revenue_inr ? Math.round((Number(d.monthly_profit_inr) / Number(d.monthly_revenue_inr)) * 100) : 50,
          businessAgeMonths: Number(d.operating_history_months || 12),
          primaryMonetization: d.monetization_methods || "Subscriptions",
          customerCountEstimate: 100,
          multipleOfProfit: 2.5,
          dueDiligenceStatus: "Platform Review Pending",
        };
      } else if (dbListing.service_details) {
        const d = dbListing.service_details;
        mapped.serviceDetails = {
          turnaroundDays: Number(d.estimated_delivery_days || 7),
          revisionsIncluded: 3,
          deliverables: [d.deliverables || "Full implementation"],
          techExpertise: [d.supported_technologies || "Full Stack"],
          scopeSummary: d.deliverables || "Custom development service",
        };
      }

      // Attach media gallery
      if (dbListing.listing_media && dbListing.listing_media.length > 0) {
        mapped.galleryImages = dbListing.listing_media.map((m: any) => m.storage_path);
      }

      return mapped;
    }
  } catch {
    // ignore
  }

  // Fallback to demo listings
  const foundDemo = DEMO_LISTINGS.find((l) => l.slug === slug);
  if (foundDemo) {
    return { ...foundDemo, isDemo: true };
  }

  return null;
}
