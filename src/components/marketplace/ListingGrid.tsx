import { Listing } from "@/types/marketplace";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { PackageSearch, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListingGridProps {
  listings: Listing[];
  onResetFilters?: () => void;
}

export function ListingGrid({ listings, onResetFilters }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center my-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
          <PackageSearch className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          No matching listings found
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          We couldn&apos;t find any assets matching your active filters. Try broadening your search or resetting all filters.
        </p>
        {onResetFilters && (
          <Button variant="outline" onClick={onResetFilters} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing, index) => (
        <ListingCard key={listing.id} listing={listing} priority={index < 4} />
      ))}
    </div>
  );
}
