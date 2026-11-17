import { describe, it, expect } from "vitest";
import { DEMO_LISTINGS } from "@/data/demo-listings";
import { formatINR, filterAndSortListings, getListingTypeLabel } from "@/lib/utils";
import { ListingFilterState } from "@/types/marketplace";

describe("WebBazaar Currency Formatter", () => {
  it("formats standard amounts in INR format correctly", () => {
    const formatted = formatINR(18999);
    expect(formatted).toContain("18,999");
  });

  it("formats large amounts in compact notation (Lakhs and Crores)", () => {
    expect(formatINR(1850000, true)).toBe("₹18.50 L");
    expect(formatINR(4800000, true)).toBe("₹48.00 L");
    expect(formatINR(12500000, true)).toBe("₹1.25 Cr");
  });
});

describe("WebBazaar Demo Dataset Integrity", () => {
  it("contains at least 24 total demo listings", () => {
    expect(DEMO_LISTINGS.length).toBeGreaterThanOrEqual(24);
  });

  it("contains at least 8 ready-made websites", () => {
    const readyWebsites = DEMO_LISTINGS.filter((l) => l.listingType === "READY_WEBSITE");
    expect(readyWebsites.length).toBeGreaterThanOrEqual(8);
  });

  it("contains at least 8 templates or source-code items", () => {
    const templates = DEMO_LISTINGS.filter((l) => l.listingType === "TEMPLATE");
    expect(templates.length).toBeGreaterThanOrEqual(8);
  });

  it("contains at least 4 online businesses", () => {
    const businesses = DEMO_LISTINGS.filter((l) => l.listingType === "BUSINESS");
    expect(businesses.length).toBeGreaterThanOrEqual(4);
  });

  it("contains at least 4 customization services", () => {
    const services = DEMO_LISTINGS.filter((l) => l.listingType === "SERVICE");
    expect(services.length).toBeGreaterThanOrEqual(4);
  });

  it("guarantees unique IDs and unique slugs across all listings", () => {
    const idSet = new Set<string>();
    const slugSet = new Set<string>();

    for (const listing of DEMO_LISTINGS) {
      expect(idSet.has(listing.id)).toBe(false);
      expect(slugSet.has(listing.slug)).toBe(false);
      idSet.add(listing.id);
      slugSet.add(listing.slug);
    }
  });

  it("labels all seller accounts as demo profiles", () => {
    for (const listing of DEMO_LISTINGS) {
      expect(listing.seller.name).toContain("(Demo Profile)");
      expect(listing.seller.isVerifiedDemo).toBe(true);
    }
  });
});

describe("Marketplace Filtering & Sorting Engine", () => {
  const baseFilters: ListingFilterState = {
    searchQuery: "",
    listingType: "ALL",
    category: "ALL",
    sortBy: "newest",
    minPrice: undefined,
    maxPrice: undefined,
    techStack: [],
  };

  it("filters listings by search keyword", () => {
    const result = filterAndSortListings(DEMO_LISTINGS, {
      ...baseFilters,
      searchQuery: "kitchen",
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title.toLowerCase()).toContain("kitchen");
  });

  it("filters listings by listingType correctly", () => {
    const result = filterAndSortListings(DEMO_LISTINGS, {
      ...baseFilters,
      listingType: "BUSINESS",
    });
    expect(result.length).toBe(4);
    result.forEach((item) => expect(item.listingType).toBe("BUSINESS"));
  });

  it("filters listings by price range (min and max INR)", () => {
    const result = filterAndSortListings(DEMO_LISTINGS, {
      ...baseFilters,
      minPrice: 2000,
      maxPrice: 5000,
    });
    expect(result.length).toBeGreaterThan(0);
    result.forEach((item) => {
      expect(item.priceINR).toBeGreaterThanOrEqual(2000);
      expect(item.priceINR).toBeLessThanOrEqual(5000);
    });
  });

  it("sorts listings by price ascending and descending", () => {
    const asc = filterAndSortListings(DEMO_LISTINGS, {
      ...baseFilters,
      sortBy: "price-asc",
    });
    for (let i = 0; i < asc.length - 1; i++) {
      expect(asc[i].priceINR).toBeLessThanOrEqual(asc[i + 1].priceINR);
    }

    const desc = filterAndSortListings(DEMO_LISTINGS, {
      ...baseFilters,
      sortBy: "price-desc",
    });
    for (let i = 0; i < desc.length - 1; i++) {
      expect(desc[i].priceINR).toBeGreaterThanOrEqual(desc[i + 1].priceINR);
    }
  });

  it("sorts businesses by monthly net profit descending", () => {
    const profitSorted = filterAndSortListings(DEMO_LISTINGS, {
      ...baseFilters,
      listingType: "BUSINESS",
      sortBy: "profit-desc",
    });
    expect(profitSorted[0].businessDetails?.monthlyNetProfitINR).toBeGreaterThanOrEqual(
      profitSorted[1].businessDetails?.monthlyNetProfitINR || 0
    );
  });
});
