"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  ExternalLink,
  Layers,
  Shield,
  Sliders,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export interface HeroRealListingPreview {
  title: string;
  slug: string;
  category: string;
  priceINR: number;
  previewImageUrl: string;
  demoUrl?: string | null;
}

interface HeroBrowserPreviewProps {
  realListing?: HeroRealListingPreview | null;
}

export function HeroBrowserPreview({ realListing }: HeroBrowserPreviewProps) {
  const hasRealImage = Boolean(realListing?.previewImageUrl);
  const displayUrl = hasRealImage
    ? realListing?.demoUrl?.replace(/^https?:\/\//, "") || `webbazaar.in/listings/${realListing?.slug}`
    : "demo.webbazaar.in/pulsedesk-portal";

  return (
    <div
      data-testid="hero-browser-preview"
      className="relative w-full min-w-0 pt-2 pb-4 sm:pb-12 lg:pl-4"
    >
      {/* Refined ambient purple glow behind browser preview */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 sm:-inset-6 rounded-[36px] bg-[radial-gradient(ellipse_at_60%_45%,rgba(98,87,232,0.22),rgba(155,93,229,0.14)_45%,transparent_75%)] blur-2xl"
      />

      {/* Subtle layered depth backdrop card */}
      <div
        aria-hidden="true"
        className="pointer-events-none hidden sm:block absolute top-0 right-0 left-8 bottom-14 rounded-2xl border border-[#DFDDF7]/90 bg-white/60 shadow-[0_12px_36px_-16px_rgba(98,87,232,0.18)]"
      />

      {/* Main Browser Window Mockup */}
      <div className="relative z-10 overflow-hidden rounded-2xl border border-[#DFE2F4] bg-white shadow-[0_28px_72px_-20px_rgba(16,21,43,0.20),0_10px_28px_-10px_rgba(98,87,232,0.14)]">
        {/* Browser Chrome Top Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-[#EAEBF5] bg-[#F9FAFE] px-4 py-3">
          {/* macOS Traffic Lights */}
          <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#FF605C]" />
            <span className="size-2.5 rounded-full bg-[#FFBD44]" />
            <span className="size-2.5 rounded-full bg-[#00CA4E]" />
          </div>

          {/* Address Bar */}
          <div className="flex flex-1 min-w-0 max-w-[340px] items-center justify-center gap-1.5 rounded-lg border border-[#E6E8F5] bg-white px-3 py-1 text-xs text-[#5E6582]">
            <Lock className="size-3 shrink-0 text-[#6257E8]" aria-hidden="true" />
            <span className="truncate font-medium">{displayUrl}</span>
          </div>

          {/* Demo Preview Indication */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#E3E0FB] bg-[#F4F3FF] px-2.5 py-0.5 text-xs font-medium text-[#5146D6] shrink-0">
            <span className="size-1.5 rounded-full bg-[#6257E8]" aria-hidden="true" />
            <span>{hasRealImage ? "Demo Preview" : "Illustrative Demo"}</span>
          </div>
        </div>

        {/* Browser Viewport */}
        {hasRealImage && realListing ? (
          <div className="relative aspect-[16/10] w-full bg-[#F7F8FF]">
            <Image
              src={realListing.previewImageUrl}
              alt={`Website preview of ${realListing.title}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover"
            />
          </div>
        ) : (
          /* Crisp Vector Illustrative Website Showcase (Zero Placeholder Gibberish) */
          <div className="bg-gradient-to-b from-[#FCFCFF] to-[#F6F7FE] px-4 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-9 select-none">
            {/* Inside-Website Mini Header */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#ECEEF8]">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-lg bg-[#6257E8] text-white text-xs font-bold">
                  P
                </div>
                <span className="text-xs font-bold tracking-tight text-[#10152B]">
                  PulseDesk
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[11px] font-medium text-[#646B88]">
                <span className="text-[#10152B] font-semibold">Overview</span>
                <span>Templates</span>
                <span>Pricing</span>
                <span>Docs</span>
              </div>
              <div className="rounded-md bg-[#10152B] px-2.5 py-1 text-[10px] font-semibold text-white">
                Open Workspace
              </div>
            </div>

            {/* Inside-Website Split Hero & Live Analytics Widget */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Mini Website Left Copy */}
              <div className="sm:col-span-5 flex flex-col gap-2.5">
                <span className="w-fit rounded-full bg-[#EFEDFE] px-2.5 py-0.5 text-[10px] font-semibold text-[#5146D6]">
                  SaaS Portal Kit
                </span>
                <p className="text-base sm:text-lg font-extrabold tracking-[-0.025em] leading-[1.15] text-[#10152B]">
                  Client portals built to launch fast.
                </p>
                <p className="text-[11px] leading-relaxed text-[#5E6582]">
                  Complete customer workspace with project timelines, file sharing, and team roles.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="rounded-lg bg-[#6257E8] px-3 py-1.5 text-[11px] font-semibold text-white">
                    Preview Demo
                  </span>
                  <span className="rounded-lg border border-[#E2E4F5] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#373E58]">
                    Tech Stack
                  </span>
                </div>
              </div>

              {/* Mini Website Right Analytics UI Panel */}
              <div className="sm:col-span-7 rounded-xl border border-[#E6E8F5] bg-white p-3.5 shadow-[0_8px_24px_-12px_rgba(16,21,43,0.12)] flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A819E]">
                      Workspace Activity
                    </span>
                    <span className="text-sm font-bold text-[#10152B] tabular-nums">
                      1,428 Tasks Shipped
                    </span>
                  </div>
                  <span className="rounded-full bg-[#EFEDFE] px-2 py-0.5 text-[10px] font-semibold text-[#5146D6] tabular-nums">
                    +28.4% MoM
                  </span>
                </div>

                {/* Crisp Vector SVG Trend Graph */}
                <div className="relative h-24 w-full overflow-hidden rounded-lg bg-[#F9FAFF] border border-[#F0F1FA] px-2 pt-2">
                  <svg
                    viewBox="0 0 280 86"
                    fill="none"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="wbChartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6257E8" stopOpacity="0.26" />
                        <stop offset="100%" stopColor="#9B5DE5" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Subtle horizontal grid lines */}
                    <line x1="0" y1="22" x2="280" y2="22" stroke="#E9ECF7" strokeDasharray="3 3" />
                    <line x1="0" y1="48" x2="280" y2="48" stroke="#E9ECF7" strokeDasharray="3 3" />
                    <line x1="0" y1="74" x2="280" y2="74" stroke="#E9ECF7" strokeDasharray="3 3" />
                    {/* Area fill */}
                    <path
                      d="M0 68 C 32 64, 48 44, 78 48 C 108 52, 128 30, 162 34 C 194 38, 218 16, 280 12 L 280 86 L 0 86 Z"
                      fill="url(#wbChartFill)"
                    />
                    {/* Main trend curve */}
                    <path
                      d="M0 68 C 32 64, 48 44, 78 48 C 108 52, 128 30, 162 34 C 194 38, 218 16, 280 12"
                      stroke="#6257E8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Secondary subtle curve */}
                    <path
                      d="M0 76 C 36 70, 62 60, 96 62 C 130 64, 158 46, 198 48 C 232 50, 250 34, 280 32"
                      stroke="#9B5DE5"
                      strokeOpacity="0.55"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                    {/* Highlighted data nodes */}
                    <circle cx="78" cy="48" r="3" fill="#FFFFFF" stroke="#6257E8" strokeWidth="2" />
                    <circle cx="162" cy="34" r="3" fill="#FFFFFF" stroke="#6257E8" strokeWidth="2" />
                    <circle cx="268" cy="13" r="3.5" fill="#6257E8" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>
                </div>

                {/* Mini Metrics Row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-[#F8F9FE] px-2.5 py-1.5 border border-[#EEF0FA]">
                    <p className="text-[9px] font-medium text-[#7A819E]">Screens</p>
                    <p className="text-xs font-bold text-[#10152B] tabular-nums">24 Views</p>
                  </div>
                  <div className="rounded-lg bg-[#F8F9FE] px-2.5 py-1.5 border border-[#EEF0FA]">
                    <p className="text-[9px] font-medium text-[#7A819E]">Stack</p>
                    <p className="text-xs font-bold text-[#10152B]">Next.js</p>
                  </div>
                  <div className="rounded-lg bg-[#F8F9FE] px-2.5 py-1.5 border border-[#EEF0FA]">
                    <p className="text-[9px] font-medium text-[#7A819E]">Layout</p>
                    <p className="text-xs font-bold text-[#10152B]">Responsive</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Inside-Website Feature Cards */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-2.5">
              <div className="rounded-xl border border-[#ECEEF8] bg-white p-2.5 flex flex-col gap-1">
                <div className="flex size-6 items-center justify-center rounded-md bg-[#F2F0FF] text-[#6257E8]">
                  <Layers className="size-3.5" aria-hidden="true" />
                </div>
                <p className="text-[11px] font-semibold text-[#10152B]">Modular UI</p>
                <p className="text-[10px] text-[#6B7290] leading-snug">
                  Clean React blocks.
                </p>
              </div>
              <div className="rounded-xl border border-[#ECEEF8] bg-white p-2.5 flex flex-col gap-1">
                <div className="flex size-6 items-center justify-center rounded-md bg-[#F6EEFF] text-[#9B5DE5]">
                  <Sliders className="size-3.5" aria-hidden="true" />
                </div>
                <p className="text-[11px] font-semibold text-[#10152B]">Brand Ready</p>
                <p className="text-[10px] text-[#6B7290] leading-snug">
                  Swap theme &amp; copy.
                </p>
              </div>
              <div className="rounded-xl border border-[#ECEEF8] bg-white p-2.5 flex flex-col gap-1">
                <div className="flex size-6 items-center justify-center rounded-md bg-[#F2F0FF] text-[#6257E8]">
                  <Shield className="size-3.5" aria-hidden="true" />
                </div>
                <p className="text-[11px] font-semibold text-[#10152B]">Auth &amp; Roles</p>
                <p className="text-[10px] text-[#6B7290] leading-snug">
                  Pre-wired access.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Product Information Card (Bottom-Left Layered Overlap) */}
      <div className="relative sm:absolute sm:left-0 sm:bottom-1 z-20 mt-3 sm:mt-0 sm:max-w-[290px] rounded-xl border border-[#E4E6F5] bg-white/95 backdrop-blur-md p-3.5 shadow-[0_18px_40px_-14px_rgba(16,21,43,0.18)]">
        {hasRealImage && realListing ? (
          <Link
            href={`/listings/${realListing.slug}`}
            className="group flex items-center justify-between gap-3"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6257E8]">
                {realListing.category}
              </span>
              <span className="text-xs font-bold text-[#10152B] truncate group-hover:text-[#6257E8] transition-colors">
                {realListing.title}
              </span>
              <span className="text-xs font-extrabold text-[#10152B] tabular-nums">
                {formatINR(realListing.priceINR)}
              </span>
            </div>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F3FF] text-[#6257E8] group-hover:bg-[#6257E8] group-hover:text-white transition-colors">
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3 text-[#6257E8] shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6257E8]">
                  Illustrative Showcase
                </span>
              </div>
              <span className="text-xs font-bold text-[#10152B] truncate">
                PulseDesk — SaaS Client Portal
              </span>
              <span className="text-xs text-[#646B88]">
                Live demo preview • Customizable
              </span>
            </div>
            <Link
              href="/marketplace"
              aria-label="Browse live marketplace listings"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F3FF] text-[#6257E8] hover:bg-[#6257E8] hover:text-white transition-colors"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
