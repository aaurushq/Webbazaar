import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ArrowUpRight, TrendingUp, Sparkles, Clock } from "lucide-react";
import { Listing } from "@/types/marketplace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR, getListingTypeBadgeClass, getListingTypeLabel } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing;
  priority?: boolean;
}

export function ListingCard({ listing, priority = false }: ListingCardProps) {
  const isBusiness = listing.listingType === "BUSINESS";
  const isService = listing.listingType === "SERVICE";

  return (
    <div className="group relative flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden">
      {/* Top Media Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={listing.previewImageUrl}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
          <Badge className={getListingTypeBadgeClass(listing.listingType)}>
            {getListingTypeLabel(listing.listingType)}
          </Badge>

          {listing.isFeatured && (
            <Badge variant="demo" className="bg-amber-100 text-amber-900 border-amber-300">
              <Sparkles className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}

          {listing.isTrending && (
            <Badge variant="demo" className="bg-rose-100 text-rose-800 border-rose-300">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>

        {/* DEMO vs VERIFIED Indicator Tag */}
        {listing.isDemo !== false ? (
          <div className="absolute bottom-2 right-2 bg-amber-900/80 backdrop-blur-sm text-amber-200 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30">
            DEMO LISTING
          </div>
        ) : (
          <div className="absolute bottom-2 right-2 bg-emerald-950/85 backdrop-blur-sm text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            VERIFIED LISTING
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Category & Category Subtext */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-medium text-slate-600">{listing.category}</span>
          {isService && listing.serviceDetails && (
            <span className="flex items-center gap-1 text-slate-500 font-medium">
              <Clock className="h-3 w-3" />
              {listing.serviceDetails.turnaroundDays}d turnaround
            </span>
          )}
        </div>

        {/* Listing Title */}
        <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
          <Link href={`/listings/${listing.slug}`}>{listing.title}</Link>
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3 flex-1">
          {listing.shortDescription}
        </p>

        {/* Business Metrics (if BUSINESS) */}
        {isBusiness && listing.businessDetails && (
          <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Monthly Net</span>
              <span className="font-semibold text-emerald-700">
                {formatINR(listing.businessDetails.monthlyNetProfitINR, true)}/mo
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">ARR Estimate</span>
              <span className="font-semibold text-slate-800">
                {formatINR(listing.businessDetails.annualRecurringRevenueINR, true)}
              </span>
            </div>
          </div>
        )}

        {/* Tech Stack Chips */}
        <div className="flex flex-wrap gap-1 mb-4">
          {listing.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700"
            >
              {tech}
            </span>
          ))}
          {listing.techStack.length > 3 && (
            <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
              +{listing.techStack.length - 3}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 pt-3 mt-auto">
          {/* Seller & Price Info */}
          <div className="flex items-center justify-between gap-2">
            {/* Seller Info */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative h-6 w-6 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                <Image
                  src={listing.seller.avatarUrl}
                  alt={listing.seller.name}
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[110px]">
                    {listing.seller.name.replace(" (Demo Profile)", "")}
                  </span>
                  {listing.seller.isVerifiedDemo && (
                    <CheckCircle2
                      className="h-3 w-3 text-emerald-600 flex-shrink-0"
                      aria-label="Verified Seller (Demo)"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
              {listing.originalPriceINR && (
                <span className="text-[11px] text-slate-400 line-through block leading-none">
                  {formatINR(listing.originalPriceINR, isBusiness)}
                </span>
              )}
              <span className="text-sm sm:text-base font-bold text-slate-900 leading-tight block">
                {formatINR(listing.priceINR, isBusiness)}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-3">
            <Button asChild variant="outline" size="sm" className="w-full justify-center gap-1 group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:border-primary-300 transition-colors">
              <Link href={`/listings/${listing.slug}`}>
                <span>{isBusiness ? "View Deal Details" : "View Details"}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
