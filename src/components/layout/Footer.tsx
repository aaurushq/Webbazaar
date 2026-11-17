import Link from "next/link";
import { ShieldCheck, Heart, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      {/* Top Banner inside Footer */}
      <div className="border-b border-slate-800 py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-xl shadow-inner">
                W
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">WebBazaar</h4>
                <p className="text-xs text-slate-400">Discover. Customize. Launch.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Verified Seller Program (Phase 2)
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Built for Indian Founders & Creators
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links Grid */}
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Col 1: Marketplace Verticals */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Marketplace</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ready-websites" className="hover:text-white transition-colors">
                  Ready-Made Websites
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-white transition-colors">
                  Templates & Code
                </Link>
              </li>
              <li>
                <Link href="/businesses" className="hover:text-white transition-colors">
                  Online Businesses
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Customization Services
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Browse All Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Categories</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/marketplace?category=E-Commerce" className="hover:text-white transition-colors">
                  E-Commerce & D2C
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=SaaS+%26+Web+Apps" className="hover:text-white transition-colors">
                  SaaS & Micro-Apps
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Restaurant+%26+Food" className="hover:text-white transition-colors">
                  Restaurants & Cloud Kitchens
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Real+Estate" className="hover:text-white transition-colors">
                  Real Estate Portals
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Healthcare+%26+Wellness" className="hover:text-white transition-colors">
                  Healthcare & Clinics
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Sellers */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Sellers</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sell" className="hover:text-white transition-colors font-medium text-emerald-400">
                  Become a Seller →
                </Link>
              </li>
              <li>
                <Link href="/sell#commissions" className="hover:text-white transition-colors">
                  Commission Rates
                </Link>
              </li>
              <li>
                <Link href="/sell#verification" className="hover:text-white transition-colors">
                  Verification Guidelines
                </Link>
              </li>
              <li>
                <Link href="/sell#faq" className="hover:text-white transition-colors">
                  Seller FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Trust */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Architecture & Trust</p>
            <ul className="space-y-2 text-sm">
              <li className="text-slate-400">Primary Currency: INR (₹)</li>
              <li className="text-slate-400">Host: Vercel Serverless</li>
              <li className="text-slate-400">Backend: Supabase PostgreSQL</li>
              <li className="text-slate-400">Payments: Razorpay (Sandbox)</li>
            </ul>
          </div>

          {/* Col 5: Legal & Notice */}
          <div className="col-span-2 lg:col-span-1 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Legal & Compliance</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Legal documents are currently in draft status for regulatory compliance under Indian IT Act and consumer protection rules.
            </p>
            <div className="flex flex-col gap-1 text-xs text-slate-400">
              <span className="italic">[Draft] Terms of Service</span>
              <span className="italic">[Draft] Privacy Policy</span>
              <span className="italic">[Draft] Escrow & Settlement Terms</span>
              <span className="italic">[Draft] Refund & Dispute Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 py-6 text-xs text-slate-500">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} WebBazaar. All rights reserved. Platform Phase 1 Frontend Preview.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Crafted with <Heart className="h-3 w-3 text-red-400 fill-red-400" /> for Indian Tech Founders
          </p>
        </div>
      </div>
    </footer>
  );
}
