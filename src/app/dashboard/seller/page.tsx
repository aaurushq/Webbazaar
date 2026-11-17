"use client";

import * as React from "react";
import Link from "next/link";
import {
  Store,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlusCircle,
  FileText,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export default function SellerDashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [sellerProfile, setSellerProfile] = React.useState<any>(null);
  const [application, setApplication] = React.useState<any>(null);

  React.useEffect(() => {
    const supabase = createClient();

    const fetchSellerData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Check approved seller profile
          const { data: profile } = await (supabase as any)
            .from("seller_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (profile) {
            setSellerProfile(profile);
          } else {
            // Check seller application status
            const { data: app } = await (supabase as any)
              .from("seller_applications")
              .select("*")
              .eq("user_id", user.id)
              .single();

            if (app) {
              setApplication(app);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching seller data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Loading seller dashboard...
      </div>
    );
  }

  // 1. Approved & Verified Seller State
  if (sellerProfile && sellerProfile.is_verified) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-xl shadow-sm">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {sellerProfile.store_name}
                </h1>
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Merchant
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Seller Handle: @{sellerProfile.handle} • {sellerProfile.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/sell">
                <PlusCircle className="h-4 w-4" />
                <span>Create New Listing</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Real Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <span className="text-xs font-medium text-slate-500 uppercase">Active Listings</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">0</p>
            <span className="text-[11px] text-slate-400">Phase 3: Listing Creator</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <span className="text-xs font-medium text-slate-500 uppercase">Gross Revenue (INR)</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">₹0</p>
            <span className="text-[11px] text-slate-400">Phase 3: Escrow Payouts</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <span className="text-xs font-medium text-slate-500 uppercase">Pending Inquiries</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">0</p>
            <span className="text-[11px] text-slate-400">Phase 4: Direct Messaging</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <span className="text-xs font-medium text-slate-500 uppercase">Store Rating</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">New</p>
            <span className="text-[11px] text-slate-400">No transactions recorded yet</span>
          </div>
        </div>

        {/* Store Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Store Information</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {sellerProfile.bio || "No professional biography provided."}
          </p>
          {sellerProfile.portfolio_url && (
            <p className="text-xs text-primary-600">
              Portfolio:{" "}
              <a href={sellerProfile.portfolio_url} target="_blank" rel="noreferrer" className="underline">
                {sellerProfile.portfolio_url}
              </a>
            </p>
          )}
        </div>
      </div>
    );
  }

  // 2. Pending Application State
  if (application && (application.status === "submitted" || application.status === "under_review")) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-8 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mx-auto">
            <Clock className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Application Under Review</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your seller application for <span className="font-semibold text-slate-900">&ldquo;{application.store_name}&rdquo;</span> has been received and is currently being evaluated by the WebBazaar trust and safety team.
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-amber-200/80 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Submitted:</span>
              <span className="font-medium text-slate-800">
                {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Seller Type:</span>
              <span className="font-medium text-slate-800 capitalize">{application.seller_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact:</span>
              <span className="font-medium text-slate-800">{application.contact_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-semibold text-amber-700 uppercase tracking-wide text-[11px]">
                {application.status}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Standard review SLA: 24 to 48 business hours. You will be notified via email once approved.
          </p>
        </div>
      </div>
    );
  }

  // 3. Rejected Application State
  if (application && application.status === "rejected") {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Seller Application Not Approved</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Reason: {application.rejection_reason || "Credentials did not meet current marketplace quality standards."}
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/become-a-seller">Submit Updated Application</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 4. Default: No application submitted
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl text-center space-y-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mx-auto">
        <Store className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Become a Verified Seller</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        WebBazaar operates as a verified-merchant-only marketplace. Submit your portfolio, developer background, or business credentials to begin listing.
      </p>
      <Button asChild size="sm">
        <Link href="/become-a-seller">Apply for Seller Account</Link>
      </Button>
    </div>
  );
}
