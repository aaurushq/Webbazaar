import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Listing, ListingFilterState } from "@/types/marketplace";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount in Indian Rupee (INR)
 * Supports standard format (₹24,999) and compact notation for large numbers (₹12.5 L, ₹1.2 Cr)
 */
export function formatINR(amount: number, compact: boolean = false): string {
  if (isNaN(amount)) return "₹0";

  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getListingTypeLabel(type: Listing["listingType"]): string {
  switch (type) {
    case "READY_WEBSITE":
      return "Ready-Made Website";
    case "TEMPLATE":
      return "Template & Code";
    case "BUSINESS":
      return "Online Business";
    case "SERVICE":
      return "Custom Service";
    default:
      return type;
  }
}

export function getListingTypeBadgeClass(type: Listing["listingType"]): string {
  switch (type) {
    case "READY_WEBSITE":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "TEMPLATE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "BUSINESS":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "SERVICE":
      return "bg-sky-50 text-sky-700 border-sky-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

/**
 * Filters and sorts listings based on state
 */
export function filterAndSortListings(
  listings: Listing[],
  filters: ListingFilterState
): Listing[] {
  let result = [...listings];

  // 1. Text search
  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.techStack.some((tech) => tech.toLowerCase().includes(q)) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        item.seller.name.toLowerCase().includes(q)
    );
  }

  // 2. Listing Type
  if (filters.listingType && filters.listingType !== "ALL") {
    result = result.filter((item) => item.listingType === filters.listingType);
  }

  // 3. Category
  if (filters.category && filters.category !== "ALL") {
    result = result.filter((item) => item.category === filters.category);
  }

  // 4. Min Price
  if (typeof filters.minPrice === "number" && !isNaN(filters.minPrice)) {
    result = result.filter((item) => item.priceINR >= (filters.minPrice ?? 0));
  }

  // 5. Max Price
  if (typeof filters.maxPrice === "number" && !isNaN(filters.maxPrice)) {
    result = result.filter((item) => item.priceINR <= (filters.maxPrice ?? Infinity));
  }

  // 6. Tech stack
  if (filters.techStack && filters.techStack.length > 0) {
    result = result.filter((item) =>
      filters.techStack!.some((selectedTech) =>
        item.techStack.map((t) => t.toLowerCase()).includes(selectedTech.toLowerCase())
      )
    );
  }

  // 7. Sort
  result.sort((a, b) => {
    switch (filters.sortBy) {
      case "price-asc":
        return a.priceINR - b.priceINR;
      case "price-desc":
        return b.priceINR - a.priceINR;
      case "profit-desc":
        const profitA = a.businessDetails?.monthlyNetProfitINR || 0;
        const profitB = b.businessDetails?.monthlyNetProfitINR || 0;
        return profitB - profitA;
      case "featured":
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return result;
}
