"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sliders,
  History,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminReviewSellerApplicationAction } from "@/lib/auth/actions";
import { SellerApplicationStatus } from "@/types/database";

interface MockApplication {
  id: string;
  userId: string;
  storeName: string;
  sellerType: string;
  portfolioUrl: string;
  professionalBio: string;
  productCategories: string[];
  contactEmail: string;
  country: string;
  status: SellerApplicationStatus;
  submittedAt: string;
}

const INITIAL_APPLICATIONS: MockApplication[] = [
  {
    id: "app-101",
    userId: "usr-dev-91",
    storeName: "DevForge India",
    sellerType: "developer",
    portfolioUrl: "https://github.com/devforge-in",
    professionalBio:
      "Senior full-stack engineering team with 6 years experience building production Next.js 14 and Supabase boilerplates.",
    productCategories: ["SaaS & Web Apps", "Templates & Code"],
    contactEmail: "lead@devforge.in",
    country: "India",
    status: "submitted",
    submittedAt: "2024-11-16 11:30 AM",
  },
  {
    id: "app-102",
    userId: "usr-prop-44",
    storeName: "UrbanTech Solutions",
    sellerType: "agency",
    portfolioUrl: "https://urbantech.in",
    professionalBio:
      "Boutique web studio in Hyderabad specializing in turnkey hospital and real estate portal systems.",
    productCategories: ["Healthcare & Wellness", "Real Estate"],
    contactEmail: "admin@urbantech.in",
    country: "India",
    status: "submitted",
    submittedAt: "2024-11-16 01:15 PM",
  },
];

interface AuditEntry {
  id: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  {
    id: "aud-001",
    action: "SYSTEM_INITIALIZE",
    target: "WebBazaar Core",
    details: "RBAC security policies and RLS triggers verified.",
    timestamp: "2024-11-16 10:00 AM",
  },
];

export default function AdminDashboardPage() {
  const [applications, setApplications] = React.useState<MockApplication[]>(INITIAL_APPLICATIONS);
  const [auditLogs, setAuditLogs] = React.useState<AuditEntry[]>(INITIAL_AUDIT_LOGS);
  const [selectedApp, setSelectedApp] = React.useState<MockApplication | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  const handleApprove = async (app: MockApplication) => {
    setIsProcessing(true);
    setActionNotice(null);

    // Call server action
    await adminReviewSellerApplicationAction(app.id, "approved");

    // Update state
    setApplications((prev) =>
      prev.map((item) => (item.id === app.id ? { ...item, status: "approved" } : item))
    );

    // Add audit log
    const newAudit: AuditEntry = {
      id: `aud-${Date.now()}`,
      action: "SELLER_APPLICATION_APPROVED",
      target: app.storeName,
      details: `Approved verification. Granted VERIFIED_SELLER role to ${app.userId}.`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    setIsProcessing(false);
    setSelectedApp(null);
    setActionNotice(`Successfully approved "${app.storeName}" as a verified seller.`);
  };

  const handleReject = async (app: MockApplication) => {
    if (!rejectionReason.trim()) {
      alert("Please provide an explicit rejection reason for the applicant.");
      return;
    }

    setIsProcessing(true);
    setActionNotice(null);

    await adminReviewSellerApplicationAction(app.id, "rejected", rejectionReason);

    setApplications((prev) =>
      prev.map((item) => (item.id === app.id ? { ...item, status: "rejected" } : item))
    );

    const newAudit: AuditEntry = {
      id: `aud-${Date.now()}`,
      action: "SELLER_APPLICATION_REJECTED",
      target: app.storeName,
      details: `Reason: ${rejectionReason}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    setIsProcessing(false);
    setSelectedApp(null);
    setRejectionReason("");
    setActionNotice(`Application for "${app.storeName}" has been rejected.`);
  };

  const pendingCount = applications.filter((a) => a.status === "submitted").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">
      {/* Admin Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-amber-400 font-bold text-xl shadow-sm">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Administration Console
              </h1>
              <span className="rounded-md bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider">
                Admin Role Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Seller verification queue, moderation oversight, and immutable security audit logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="gap-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white">
            <Link href="/dashboard/admin/listings">
              <Package className="h-4 w-4" />
              Listing Moderation Queue
            </Link>
          </Button>
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs">
            <ShieldCheck className="h-4 w-4" />
            Server Authorization Enforced
          </span>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 mb-6 flex items-center gap-2 text-xs text-emerald-900 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{actionNotice}</span>
        </div>
      )}

      {/* Platform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 space-y-1">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Pending Seller Applications
          </span>
          <div className="text-3xl font-extrabold text-amber-900">{pendingCount} Queue</div>
          <p className="text-[11px] text-amber-700">Requires manual review and code audit</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verified Sellers
          </span>
          <div className="text-3xl font-extrabold text-slate-900">{approvedCount} Active</div>
          <p className="text-[11px] text-slate-400">Granted publishing authorization</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Catalog Moderation
          </span>
          <div className="text-3xl font-extrabold text-slate-900">24 Items</div>
          <p className="text-[11px] text-slate-400">Active marketplace demo listings</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Dispute Cases
          </span>
          <div className="text-3xl font-extrabold text-emerald-700">0 Open</div>
          <p className="text-[11px] text-slate-400">Zero active customer complaints</p>
        </div>
      </div>

      {/* Two-Column Grid: Left (Applications Queue), Right (Audit Logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Seller Applications Review Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Seller Verification Requests ({applications.length})
              </h2>
              <p className="text-xs text-slate-500">
                Evaluate applicant portfolios, category fits, and code authenticity.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{app.storeName}</h3>
                    <span className="rounded bg-slate-100 text-slate-700 text-[10px] uppercase font-bold px-2 py-0.5">
                      {app.sellerType}
                    </span>
                    {app.status === "approved" && (
                      <Badge variant="success" className="text-[10px]">
                        Approved
                      </Badge>
                    )}
                    {app.status === "rejected" && (
                      <Badge variant="destructive" className="text-[10px]">
                        Rejected
                      </Badge>
                    )}
                    {app.status === "submitted" && (
                      <Badge variant="warning" className="text-[10px]">
                        Under Review
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{app.professionalBio}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Email: <strong>{app.contactEmail}</strong></span>
                    <span>•</span>
                    <a
                      href={app.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      Portfolio <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedApp(app)}
                    className="text-xs"
                  >
                    Review Dossier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Immutable Audit Trail */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-slate-600" />
              <h3 className="text-base font-bold text-slate-900">Security Audit Log</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[10px] text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                </div>
                <div className="text-slate-800 font-medium">{log.target}</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Review Modal Dialog */}
      <Dialog open={selectedApp !== null} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="sm:max-w-xl">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <span>Verify Seller Application:</span>
                  <span className="text-primary-600">{selectedApp.storeName}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Application ID: {selectedApp.id} • Submitted at {selectedApp.submittedAt}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-xs text-slate-700 py-2">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Seller Type</span>
                    <strong className="text-slate-900 capitalize">{selectedApp.sellerType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Country</span>
                    <strong className="text-slate-900">{selectedApp.country}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Email</span>
                    <strong className="text-slate-900">{selectedApp.contactEmail}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Portfolio</span>
                    <a
                      href={selectedApp.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Inspect Source <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-900 block mb-1">
                    Technical Bio & Overview:
                  </span>
                  <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {selectedApp.professionalBio}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-900 block mb-1">
                    Requested Categories:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApp.productCategories.map((c) => (
                      <span
                        key={c}
                        className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rejection Reason Input */}
                <div className="border-t border-slate-100 pt-3">
                  <label className="font-semibold text-slate-900 block mb-1">
                    Rejection / Feedback Notes (Required if rejecting):
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide specific feedback (e.g. Portfolio repository missing or copyright clarification needed)..."
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedApp(null)}
                  disabled={isProcessing}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedApp)}
                  disabled={isProcessing}
                  size="sm"
                  className="gap-1.5"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject Application</span>
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleApprove(selectedApp)}
                  disabled={isProcessing}
                  size="sm"
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Approve & Grant Verified Status</span>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
