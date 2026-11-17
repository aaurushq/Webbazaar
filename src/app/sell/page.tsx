"use client";

import * as React from "react";
import Link from "next/link";
import {
  Rocket,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Percent,
  Coins,
  ArrowRight,
  Code2,
  Globe,
  Briefcase,
  Wrench,
  Clock,
  FileCheck,
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

export default function SellPage() {
  const [applyModalOpen, setApplyModalOpen] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 py-16 sm:py-24 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
              <Rocket className="h-3.5 w-3.5" />
              <span>WebBazaar Creator & Developer Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Turn Your Code and Web Projects Into Consistent Income.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Join India’s dedicated digital asset marketplace. Sell turnkey websites, Next.js templates, profitable online businesses, or offer custom engineering services to qualified buyers.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Button size="lg" className="gap-2 font-semibold shadow-md" onClick={() => setApplyModalOpen(true)}>
                <span>Apply as a Verified Seller</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/marketplace">Browse Current Catalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Who Can Sell & What is Accepted */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Curation & Standards
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              What You Can Sell on WebBazaar
            </h2>
            <p className="text-sm text-slate-600">
              We exclusively list verified, high-quality digital assets. Every submission undergoes a code and security check.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-primary-600">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Ready-Made Websites</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete, deployable web applications with full front-to-back functionality, database migrations, and clean documentation.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Templates & Code</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Boilerplates, UI component libraries, themes, API wrappers, and developer automation scripts built with modern TypeScript.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Online Businesses</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Revenue-generating SaaS products, content portals, and e-commerce stores looking for clean founder acquisitions.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Custom Services</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fixed-scope development packages: logo rebranding, Vercel deployments, Razorpay payment setups, and custom features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Proposed Marketplace Commission Rates */}
      <section id="commissions" className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Transparent Economics
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Proposed Launch Commission Rates
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Subject to final launch terms. No hidden listing fees or recurring subscription charges for creators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* Rate 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-3 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Ready Websites</span>
              <div className="text-4xl font-extrabold text-primary-600">12%</div>
              <span className="text-[11px] text-slate-400 block">Proposed Marketplace Fee</span>
              <p className="text-xs text-slate-600 border-t border-slate-100 pt-3">
                Includes buyer payment processing, automated signed downloads, and customer dispute mediation.
              </p>
            </div>

            {/* Rate 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-3 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Templates & Code</span>
              <div className="text-4xl font-extrabold text-emerald-600">15%</div>
              <span className="text-[11px] text-slate-400 block">Proposed Marketplace Fee</span>
              <p className="text-xs text-slate-600 border-t border-slate-100 pt-3">
                Covers digital licensing enforcement, automated version updates, and instant buyer delivery.
              </p>
            </div>

            {/* Rate 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-3 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Custom Services</span>
              <div className="text-4xl font-extrabold text-sky-600">12%</div>
              <span className="text-[11px] text-slate-400 block">Proposed Marketplace Fee</span>
              <p className="text-xs text-slate-600 border-t border-slate-100 pt-3">
                Covers milestone holdback, custom scope generation, and prompt payout upon client sign-off.
              </p>
            </div>

            {/* Rate 4 */}
            <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-6 text-center space-y-3 shadow-xs">
              <span className="text-xs font-semibold text-amber-900">Running Businesses</span>
              <div className="text-4xl font-extrabold text-amber-800">5%</div>
              <span className="text-[11px] text-amber-700 block">Proposed Success Fee</span>
              <p className="text-xs text-amber-900 border-t border-amber-200 pt-3">
                Paid only on successful deal closing. Includes NDA records, data room hosting, and assisted escrow transition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Verification & Onboarding Journey */}
      <section id="verification" className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Trust & Safety
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              The 3-Step Seller Verification Process
            </h2>
            <p className="text-sm text-slate-600">
              Only verified creators can publish and monetize on WebBazaar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-primary-600 font-bold mb-4">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">1. Identity & Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect your GitHub or LinkedIn profile, confirm your legal name or business registration (PAN/GST in India), and establish your creator reputation.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700 font-bold mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">2. Code & Security Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our automated lint and security checks verify that your repository contains no hardcoded secrets, malicious dependencies, or copyright violations.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">3. Verified Badge & Sales</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive the green Verified Seller badge, publish unlimited listings across all four verticals, and receive direct INR payouts to your Indian bank account.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="gap-2 font-semibold shadow-md" onClick={() => setApplyModalOpen(true)}>
              <span>Apply to Join Seller Roster</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Honest Application Modal (Phase 2 Preview) */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-2">
              <Rocket className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              Seller Applications Open in Phase 2
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-600 pt-2 leading-relaxed">
              We appreciate your interest in becoming a verified creator on WebBazaar.
              Live seller onboarding, KYC verification document uploads, and automated GitHub code auditing are scheduled for <strong>Phase 2 (Authentication & Verified Sellers)</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 border border-slate-200 mt-2 space-y-1.5">
            <span className="font-semibold text-slate-900">What you can prepare in the meantime:</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Clean, modular Next.js / TypeScript codebases</li>
              <li>Figma design tokens or component previews</li>
              <li>A verified Indian bank account for Razorpay Route settlements</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="default" onClick={() => setApplyModalOpen(false)}>
              Back to Marketplace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
