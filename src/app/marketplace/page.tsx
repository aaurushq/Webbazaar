"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ListingFilterState, ListingType, Category, SortOption, Listing } from "@/types/marketplace";
import { DEMO_LISTINGS } from "@/data/demo-listings";
import { filterAndSortListings } from "@/lib/utils";
import { ListingFilters } from "@/components/marketplace/ListingFilters";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { getUnifiedMarketplaceListings } from "@/lib/listings/public";

function MarketplaceCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allListings, setAllListings] = React.useState<Listing[]>(DEMO_LISTINGS.map(item => ({ ...item, isDemo: true })));
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    getUnifiedMarketplaceListings().then((items) => {
      setAllListings(items);
    });
  }, []);

  // Read initial filter values from URL search params
  const initialQuery = searchParams.get("q") || "";
  const initialType = (searchParams.get("type") as ListingType) || "ALL";
  const initialCategory = (searchParams.get("category") as Category) || "ALL";
  const initialSort = (searchParams.get("sort") as SortOption) || "newest";

  const [filters, setFilters] = React.useState<ListingFilterState>({
    searchQuery: initialQuery,
    listingType: initialType,
    category: initialCategory,
    sortBy: initialSort,
    minPrice: undefined,
    maxPrice: undefined,
    techStack: [],
  });

  // Keep state in sync if URL params change externally
  React.useEffect(() => {
    const q = searchParams.get("q") || "";
    const type = (searchParams.get("type") as ListingType) || "ALL";
    const cat = (searchParams.get("category") as Category) || "ALL";
    const sort = (searchParams.get("sort") as SortOption) || "newest";

    setFilters((prev) => ({
      ...prev,
      searchQuery: q,
      listingType: type,
      category: cat,
      sortBy: sort,
    }));
  }, [searchParams]);

  // Update URL search params as filters change
  const handleFilterChange = (newFilters: ListingFilterState) => {
    setFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.searchQuery) params.set("q", newFilters.searchQuery);
    if (newFilters.listingType && newFilters.listingType !== "ALL") {
      params.set("type", newFilters.listingType);
    }
    if (newFilters.category && newFilters.category !== "ALL") {
      params.set("category", newFilters.category);
    }
    if (newFilters.sortBy && newFilters.sortBy !== "newest") {
      params.set("sort", newFilters.sortBy);
    }

    const queryString = params.toString();
    router.replace(`/marketplace${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  const handleReset = () => {
    const resetState: ListingFilterState = {
      searchQuery: "",
      listingType: "ALL",
      category: "ALL",
      sortBy: "newest",
      minPrice: undefined,
      maxPrice: undefined,
      techStack: [],
    };
    setFilters(resetState);
    router.replace("/marketplace", { scroll: false });
  };

  // Filter listings
  const filteredListings = React.useMemo(() => {
    return filterAndSortListings(allListings, filters);
  }, [allListings, filters]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Marketplace Catalog
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Browse verified ready-made websites, premium templates, online businesses, and customization services. All items formatted in INR.
        </p>
      </div>

      {/* Filter Bar */}
      <ListingFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        totalResults={filteredListings.length}
      />

      {/* Grid of Listings */}
      <div className="mt-8">
        <ListingGrid listings={filteredListings} onResetFilters={handleReset} />
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <React.Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center text-sm text-slate-500">
          Loading catalog...
        </div>
      }
    >
      <MarketplaceCatalogContent />
    </React.Suspense>
  );
}
