"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  PlusCircle,
  Eye,
  Edit3,
  Send,
  Archive,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  FolderArchive,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getSellerListingsAction,
  getSellerDashboardStatsAction,
  submitListingForReviewAction,
  archiveListingAction,
} from "@/lib/listings/actions";

interface ListingItem {
  id: string;
  title: string;
  slug: string;
  listing_type: string;
  category_id: string;
  price_inr: number;
  currency: string;
  status: "draft" | "pending_review" | "approved" | "rejected" | "archived";
  featured_image_path: string | null;
  rejection_reason: string | null;
  created_at: string;
  published_at: string | null;
}

export default function SellerListingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [listings, setListings] = React.useState<ListingItem[]>([]);
  const [stats, setStats] = React.useState({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    archived: 0,
  });
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setActionFeedback(null);
    try {
      const [listingsRes, statsRes] = await Promise.all([
        getSellerListingsAction(),
        getSellerDashboardStatsAction(),
      ]);

      if (listingsRes.error) {
        setActionFeedback({ text: listingsRes.error, type: "error" });
      } else {
        setListings(listingsRes.listings as ListingItem[]);
      }

      if (statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch {
      setActionFeedback({ text: "Failed to load listings. Please retry.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmitForReview = async (id: string) => {
    setActionLoadingId(id);
    setActionFeedback(null);
    const res = await submitListingForReviewAction(id);
    setActionLoadingId(null);
    if (res.success) {
      setActionFeedback({ text: "Listing submitted for administrative review!", type: "success" });
      await loadData();
    } else {
      setActionFeedback({ text: res.error || "Submission failed", type: "error" });
    }
  };

  const handleArchive = async (id: string) => {
    if (!window.confirm("Are you sure you want to archive this listing?")) return;
    setActionLoadingId(id);
    setActionFeedback(null);
    const res = await archiveListingAction(id);
    setActionLoadingId(null);
    if (res.success) {
      setActionFeedback({ text: "Listing archived successfully.", type: "success" });
      await loadData();
    } else {
      setActionFeedback({ text: res.error || "Archive failed", type: "error" });
    }
  };

  const filteredListings = React.useMemo(() => {
    return listings.filter((item) => {
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.listing_type.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [listings, filterStatus, searchTerm]);

  const getStatusBadge = (status: ListingItem["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        );
      case "pending_review":
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" /> Under Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="gap-1">
            <FolderArchive className="h-3 w-3" /> Archived
          </Badge>
        );
      case "draft":
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            Draft
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Seller Listings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your digital products, monitor moderation status, and publish to WebBazaar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5 text-xs transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild size="sm" className="gap-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white transition-colors">
            <Link href="/dashboard/seller/listings/new">
              <PlusCircle className="h-4 w-4" />
              Create Listing
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Total</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-wide">Approved</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.approved}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-medium text-amber-600 uppercase tracking-wide">In Review</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">Drafts</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.draft}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-medium text-red-600 uppercase tracking-wide">Rejected</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.rejected}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Archived</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.archived}</p>
        </div>
      </div>

      {/* Action Notification */}
      {actionFeedback && (
        <div
          className={`p-3 rounded-lg text-xs font-medium border ${
            actionFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {actionFeedback.text}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search listings by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 text-xs mr-1 hidden sm:inline">Filter:</span>
          {["all", "draft", "pending_review", "approved", "rejected", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                filterStatus === st
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Table / Cards */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 space-y-3">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-slate-400" />
          <p>Loading database records...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">No listings found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || filterStatus !== "all"
                ? "No listings match your active filters. Try resetting the search or filter tab."
                : "You haven't created any marketplace listings yet. Start selling websites, templates, businesses, or services today!"}
            </p>
          </div>
          {!searchTerm && filterStatus === "all" && (
            <Button asChild size="sm" className="mt-2 bg-primary-600 hover:bg-primary-700 text-white text-xs">
              <Link href="/dashboard/seller/listings/new">
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Create First Listing
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Type & Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredListings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900 line-clamp-1">{item.title}</p>
                        <p className="text-[11px] text-slate-400 font-mono">/{item.slug}</p>
                        {item.status === "rejected" && item.rejection_reason && (
                          <p className="text-[11px] text-red-600 font-medium mt-1 bg-red-50 p-1.5 rounded">
                            Rejection Note: {item.rejection_reason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 mr-1.5">
                        {item.listing_type.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-slate-500">{item.category_id}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                      ₹{item.price_inr.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview */}
                        {item.status === "approved" ? (
                          <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2 gap-1">
                            <Link href={`/listings/${item.slug}`} target="_blank">
                              <Eye className="h-3 w-3" />
                              View
                            </Link>
                          </Button>
                        ) : null}

                        {/* Submit for Review */}
                        {(item.status === "draft" || item.status === "rejected") && (
                          <Button
                            variant="default"
                            size="sm"
                            disabled={actionLoadingId === item.id}
                            onClick={() => handleSubmitForReview(item.id)}
                            className="h-7 text-xs px-2.5 bg-amber-600 hover:bg-amber-700 text-white gap-1"
                          >
                            <Send className="h-3 w-3" />
                            Submit
                          </Button>
                        )}

                        {/* Archive */}
                        {item.status !== "archived" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoadingId === item.id}
                            onClick={() => handleArchive(item.id)}
                            className="h-7 text-xs px-2 text-slate-500 hover:text-slate-800"
                            title="Archive Listing"
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
