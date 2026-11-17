"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ExternalLink,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAdminPendingListingsAction,
  adminModerateListingAction,
} from "@/lib/listings/actions";

interface PendingListing {
  id: string;
  title: string;
  slug: string;
  listing_type: string;
  category_id: string;
  price_inr: number;
  short_description: string;
  full_description: string;
  demo_url: string | null;
  featured_image_path: string | null;
  created_at: string;
  seller_id: string;
  profiles?: {
    id: string;
    display_name: string;
    avatar_path: string | null;
  };
}

export default function AdminListingsModerationPage() {
  const [loading, setLoading] = React.useState(true);
  const [pendingListings, setPendingListings] = React.useState<PendingListing[]>([]);
  const [selectedListing, setSelectedListing] = React.useState<PendingListing | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState(false);
  const [statusFeedback, setStatusFeedback] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchListings = React.useCallback(async () => {
    setLoading(true);
    setStatusFeedback(null);
    try {
      const res = await getAdminPendingListingsAction();
      if (res.error) {
        setStatusFeedback({ text: res.error, type: "error" });
      } else {
        setPendingListings((res.listings || []) as PendingListing[]);
      }
    } catch {
      setStatusFeedback({ text: "Failed to load pending queue.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    setStatusFeedback(null);
    const res = await adminModerateListingAction(id, "approve");
    setActionLoading(false);
    if (res.success) {
      setStatusFeedback({ text: "Listing approved and published to the marketplace!", type: "success" });
      setSelectedListing(null);
      await fetchListings();
    } else {
      setStatusFeedback({ text: res.error || "Approval failed", type: "error" });
    }
  };

  const handleReject = async () => {
    if (!selectedListing) return;
    if (!rejectReason.trim()) {
      setStatusFeedback({ text: "Please enter a reason for rejecting the listing.", type: "error" });
      return;
    }

    setActionLoading(true);
    setStatusFeedback(null);
    const res = await adminModerateListingAction(selectedListing.id, "reject", rejectReason.trim());
    setActionLoading(false);
    setIsRejectModalOpen(false);
    setRejectReason("");

    if (res.success) {
      setStatusFeedback({ text: "Listing rejected. The seller has been notified with the feedback.", type: "success" });
      setSelectedListing(null);
      await fetchListings();
    } else {
      setStatusFeedback({ text: res.error || "Rejection failed", type: "error" });
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            href="/dashboard/admin"
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1"
          >
            <ChevronLeft className="h-3 w-3" /> Back to Admin Overview
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Listing Moderation Queue</h1>
            <Badge variant="warning" className="gap-1 text-xs">
              <Clock className="h-3 w-3" /> {pendingListings.length} Pending
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted merchant listings. Verified approvals immediately publish items to public marketplace categories.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchListings}
          disabled={loading}
          className="gap-1.5 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Queue
        </Button>
      </div>

      {/* Status Alert */}
      {statusFeedback && (
        <div
          className={`p-3 rounded-lg text-xs font-medium border ${
            statusFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {statusFeedback.text}
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 space-y-3">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-slate-400" />
          <p>Loading moderation queue from database...</p>
        </div>
      ) : pendingListings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Moderation Queue is Clean</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no pending listings awaiting review at this time. New merchant submissions will appear here automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Listings List Column */}
          <div className="md:col-span-1 space-y-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Items ({pendingListings.length})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {pendingListings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedListing(item)}
                  className={`cursor-pointer rounded-xl border p-4 text-xs transition-all space-y-2 ${
                    selectedListing?.id === item.id
                      ? "border-primary-600 bg-primary-50/40 ring-1 ring-primary-500"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <Badge variant="secondary" className="text-[10px]">
                      {item.listing_type.replace("_", " ")}
                    </Badge>
                    <span className="font-bold text-slate-900">
                      ₹{item.price_inr.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{item.title}</h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{item.category_id}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details Inspection Column */}
          <div className="md:col-span-2">
            {selectedListing ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {selectedListing.listing_type.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-slate-500">{selectedListing.category_id}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedListing.title}</h2>
                    <p className="text-xs text-slate-400 font-mono">Slug: /listings/{selectedListing.slug}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500">Price</span>
                    <p className="text-2xl font-extrabold text-slate-900">
                      ₹{selectedListing.price_inr.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Cover Image Preview */}
                {selectedListing.featured_image_path && (
                  <div className="h-56 w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedListing.featured_image_path}
                      alt={selectedListing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Descriptions */}
                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">Short Description</h4>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {selectedListing.short_description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">Full Description</h4>
                    <div className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {selectedListing.full_description}
                    </div>
                  </div>

                  {selectedListing.demo_url && (
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-1">Live Demo</h4>
                      <a
                        href={selectedListing.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        {selectedListing.demo_url} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* Seller Info */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Merchant Info</span>
                      <p className="font-semibold text-slate-900">
                        {selectedListing.profiles?.display_name || "Merchant"}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">ID: {selectedListing.seller_id}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Registered Seller
                    </Badge>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => setIsRejectModalOpen(true)}
                    className="text-xs text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Listing
                  </Button>
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleApprove(selectedListing.id)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-medium"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve & Publish
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-xs text-slate-500">
                Select a listing from the queue on the left to inspect its metadata and moderate.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Reject Listing Submission</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Provide actionable feedback to the seller. They will be able to edit and re-submit their draft.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <label className="block font-semibold text-slate-700">Reason for Rejection *</label>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please add a valid live demo URL, provide installation instructions, and upload higher-resolution cover images."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRejectModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={actionLoading || !rejectReason.trim()}
              onClick={handleReject}
              className="text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
