"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  Code2,
  Building2,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  X,
  Eye,
  Save,
  Send,
  ShieldAlert,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { createListingAction } from "@/lib/listings/actions";
import {
  type CreateListingInput,
  type ReadyWebsiteDetailsInput,
  type TemplateDetailsInput,
  type BusinessDetailsInput,
  type ServiceDetailsInput,
} from "@/lib/listings/schemas";

const CATEGORIES = [
  "E-Commerce",
  "SaaS & Web Apps",
  "Agency & Portfolio",
  "Restaurant & Food",
  "Real Estate",
  "Healthcare & Wellness",
  "Education & LMS",
  "Booking & Services",
  "Directory & Marketplace",
  "Blog & Media",
];

const STEPS = [
  { id: 1, title: "Type", desc: "Select category" },
  { id: 2, title: "Basics", desc: "Title & descriptions" },
  { id: 3, title: "Details", desc: "Category specs" },
  { id: 4, title: "Pricing", desc: "Set price (INR)" },
  { id: 5, title: "Images", desc: "Cover & gallery" },
  { id: 6, title: "Files", desc: "Source deliverables" },
  { id: 7, title: "Preview", desc: "Review listing" },
];

export default function NewListingWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  // Form State
  const [listingType, setListingType] = React.useState<"READY_WEBSITE" | "TEMPLATE" | "BUSINESS" | "SERVICE">("READY_WEBSITE");
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [categoryId, setCategoryId] = React.useState(CATEGORIES[0]);
  const [shortDescription, setShortDescription] = React.useState("");
  const [fullDescription, setFullDescription] = React.useState("");
  const [demoUrl, setDemoUrl] = React.useState("");
  const [priceInr, setPriceInr] = React.useState<number>(4999);

  // Category Details
  // 1. Ready Website
  const [rwWebsiteCategory, setRwWebsiteCategory] = React.useState("Full-Stack E-Commerce");
  const [rwTechStack, setRwTechStack] = React.useState("Next.js 14, Tailwind CSS, Supabase, Stripe");
  const [rwKeyFeatures, setRwKeyFeatures] = React.useState("User Auth, Responsive UI, Admin Dashboard, Payment Gateway");
  const [rwIsResponsive, setRwIsResponsive] = React.useState(true);
  const [rwInstallationReqs, setRwInstallationReqs] = React.useState("Node.js 18+, Vercel / Render account, Supabase account");
  const [rwIncludedPages, setRwIncludedPages] = React.useState("Home, Catalog, Product Detail, Checkout, User Dashboard, Admin Panel");
  const [rwDeliveryMethod, setRwDeliveryMethod] = React.useState("Full GitHub Repo Transfer & ZIP Archive");
  const [rwLicenseType, setRwLicenseType] = React.useState("Single Commercial Production License");

  // 2. Template
  const [tmplFramework, setTmplFramework] = React.useState("React 19 / Next.js 14 App Router");
  const [tmplLanguage, setTmplLanguage] = React.useState("TypeScript");
  const [tmplVersions, setTmplVersions] = React.useState("Node 18.x or 20.x");
  const [tmplIncludedFiles, setTmplIncludedFiles] = React.useState("TypeScript components, Tailwind config, Documentation markdown");
  const [tmplHasDocs, setTmplHasDocs] = React.useState(true);
  const [tmplLicense, setTmplLicense] = React.useState("Standard Commercial");
  const [tmplInstallInstructions, setTmplInstallInstructions] = React.useState("Run `npm install` followed by `npm run dev`.");
  const [tmplSupportDays, setTmplSupportDays] = React.useState(30);

  // 3. Business
  const [bizModel, setBizModel] = React.useState("Subscription SaaS (B2B)");
  const [bizIndustry, setBizIndustry] = React.useState("Productivity Software");
  const [bizHistoryMonths, setBizHistoryMonths] = React.useState(18);
  const [bizMonthlyRevenue, setBizMonthlyRevenue] = React.useState(45000);
  const [bizMonthlyProfit, setBizMonthlyProfit] = React.useState(32000);
  const [bizMonthlyTraffic, setBizMonthlyTraffic] = React.useState(12500);
  const [bizMonetization, setBizMonetization] = React.useState("Monthly & Annual Razorpay Subscriptions");
  const [bizIncludedAssets, setBizIncludedAssets] = React.useState("Domain name, Codebase, 1,400 registered users, AWS infrastructure, Social accounts");
  const [bizReasonForSale, setBizReasonForSale] = React.useState("Focusing on full-time enterprise employment; seeking motivated buyer to scale.");
  const [bizConfidentialNotes, setBizConfidentialNotes] = React.useState("");

  // 4. Service
  const [srvCategory, setSrvCategory] = React.useState("Full-Stack Web Application Development");
  const [srvDeliverables, setSrvDeliverables] = React.useState("Production Next.js application, Responsive styling, API integrations, Automated tests");
  const [srvDeliveryDays, setSrvDeliveryDays] = React.useState(14);
  const [srvRevisions, setSrvRevisions] = React.useState("3 comprehensive revision rounds included with detailed feedback loop");
  const [srvTech, setSrvTech] = React.useState("Next.js, Node.js, PostgreSQL, Tailwind CSS, Docker");
  const [srvRequirements, setSrvRequirements] = React.useState("Figma designs or wireframes, required API credentials, written feature scope");

  // Media & Files
  const [featuredImagePath, setFeaturedImagePath] = React.useState<string | null>(null);
  const [galleryImages, setGalleryImages] = React.useState<string[]>([]);
  const [fileDeliverablePath, setFileDeliverablePath] = React.useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(null);

  // Check auth & verified seller
  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login?next=/dashboard/seller/listings/new");
      } else {
        setCurrentUser(user);
      }
    });
  }, [router]);

  // Auto-slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-")) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  // Upload image to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFeatured: boolean) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image file size exceeds the 10MB limit.");
      return;
    }

    setUploadProgress(`Uploading ${file.name}...`);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const path = `${currentUser.id}/${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from("listing-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        setErrorMessage(`Image upload failed: ${error.message}`);
      } else if (data) {
        const { data: publicData } = supabase.storage.from("listing-images").getPublicUrl(data.path);
        const url = publicData.publicUrl;

        if (isFeatured) {
          setFeaturedImagePath(url);
        } else {
          setGalleryImages((prev) => [...prev, url]);
        }
      }
    } catch {
      setErrorMessage("Error occurred during image upload.");
    } finally {
      setUploadProgress(null);
    }
  };

  // Upload digital file deliverable
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("File exceeds 100MB maximum limit.");
      return;
    }

    setUploadProgress(`Uploading digital product file (${file.name})...`);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const path = `${currentUser.id}/${cleanName}`;

      const { data, error } = await supabase.storage
        .from("listing-files")
        .upload(path, file, { upsert: false });

      if (error) {
        setErrorMessage(`File upload failed: ${error.message}`);
      } else if (data) {
        setFileDeliverablePath(data.path);
      }
    } catch {
      setErrorMessage("Error uploading deliverable file.");
    } finally {
      setUploadProgress(null);
    }
  };

  // Final submit handler
  const handleComplete = async (submitForReview: boolean) => {
    setSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    const payload: CreateListingInput = {
      title,
      slug,
      categoryId,
      listingType,
      shortDescription,
      fullDescription,
      priceInr: Number(priceInr),
      demoUrl: demoUrl || undefined,
      featuredImagePath: featuredImagePath || (galleryImages[0] || null),
      mediaPaths: galleryImages,
      submitForReview,
    };

    if (listingType === "READY_WEBSITE") {
      payload.readyWebsiteDetails = {
        websiteCategory: rwWebsiteCategory,
        techStack: rwTechStack.split(",").map((s) => s.trim()).filter(Boolean),
        keyFeatures: rwKeyFeatures.split(",").map((s) => s.trim()).filter(Boolean),
        isResponsive: rwIsResponsive,
        installationRequirements: rwInstallationReqs,
        includedPages: rwIncludedPages,
        demoUrl: demoUrl || undefined,
        deliveryMethod: rwDeliveryMethod,
        licenseType: rwLicenseType,
      };
    } else if (listingType === "TEMPLATE") {
      payload.templateDetails = {
        framework: tmplFramework,
        programmingLanguage: tmplLanguage,
        compatibleVersions: tmplVersions,
        includedFiles: tmplIncludedFiles,
        hasDocumentation: tmplHasDocs,
        licenseType: tmplLicense,
        installationInstructions: tmplInstallInstructions,
        supportDurationDays: Number(tmplSupportDays),
      };
    } else if (listingType === "BUSINESS") {
      payload.businessDetails = {
        businessModel: bizModel,
        askingPriceInr: Number(priceInr),
        industry: bizIndustry,
        operatingHistoryMonths: Number(bizHistoryMonths),
        monthlyRevenueInr: Number(bizMonthlyRevenue),
        monthlyProfitInr: Number(bizMonthlyProfit),
        monthlyTraffic: Number(bizMonthlyTraffic),
        monetizationMethods: bizMonetization,
        includedAssets: bizIncludedAssets,
        reasonForSale: bizReasonForSale,
        confidentialNotes: bizConfidentialNotes || undefined,
      };
    } else if (listingType === "SERVICE") {
      payload.serviceDetails = {
        serviceCategory: srvCategory,
        deliverables: srvDeliverables,
        startingPriceInr: Number(priceInr),
        estimatedDeliveryDays: Number(srvDeliveryDays),
        revisionPolicy: srvRevisions,
        supportedTechnologies: srvTech,
        buyerRequirements: srvRequirements,
      };
    }

    const res = await createListingAction(payload);
    setSubmitting(false);

    if (res.success) {
      router.push("/dashboard/seller/listings");
    } else {
      setErrorMessage(res.error || "Failed to create listing.");
      if (res.fieldErrors) {
        setFieldErrors(res.fieldErrors);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/dashboard/seller/listings"
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1"
          >
            <ChevronLeft className="h-3 w-3" /> Back to Listings
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Create New Listing</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Step {currentStep} of {STEPS.length}
          </Badge>
        </div>
      </div>

      {/* Progress Steps Header */}
      <div className="hidden sm:grid grid-cols-7 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
        {STEPS.map((st) => (
          <div
            key={st.id}
            onClick={() => setCurrentStep(st.id)}
            className={`cursor-pointer rounded-lg py-2 px-1 text-xs transition-colors ${
              currentStep === st.id
                ? "bg-white font-bold text-slate-900 shadow-sm border border-slate-200"
                : currentStep > st.id
                ? "text-emerald-700 font-medium"
                : "text-slate-400"
            }`}
          >
            <div className="text-[11px] uppercase tracking-wider">{st.title}</div>
            <div className="text-[10px] text-slate-500 truncate">{st.desc}</div>
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{errorMessage}</p>
            {Object.keys(fieldErrors).length > 0 && (
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {Object.entries(fieldErrors).map(([field, errs]) => (
                  <li key={field}>
                    <span className="font-mono">{field}</span>: {errs.join(", ")}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* STEP 1: Select Type */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Select Marketplace Category Type</h2>
            <p className="text-xs text-slate-500">
              Choose the category that best represents what you are selling. Each type provides specialized fields and buyer protections.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              {
                type: "READY_WEBSITE" as const,
                title: "Ready-Made Website",
                icon: Globe,
                desc: "Turnkey websites with live demos, full database schemas, and instant deployment guides.",
              },
              {
                type: "TEMPLATE" as const,
                title: "Template & Source Code",
                icon: Code2,
                desc: "Clean component libraries, app templates, dashboards, and mobile source code archives.",
              },
              {
                type: "BUSINESS" as const,
                title: "Online Business",
                icon: Building2,
                desc: "Cash-flowing or validated digital businesses, micro-SaaS projects, content sites, and ecommerce assets.",
              },
              {
                type: "SERVICE" as const,
                title: "Development Service",
                icon: Briefcase,
                desc: "Fixed-scope custom engineering, MVP builds, bug fixes, UI implementation, and integrations.",
              },
            ].map((card) => {
              const Icon = card.icon;
              const isSelected = listingType === card.type;
              return (
                <div
                  key={card.type}
                  onClick={() => setListingType(card.type)}
                  className={`cursor-pointer rounded-xl border p-5 transition-all text-left space-y-2 ${
                    isSelected
                      ? "border-primary-600 bg-primary-50/40 ring-2 ring-primary-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    {isSelected && <Badge variant="default" className="text-[10px]">Selected</Badge>}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{card.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Basic Details */}
      {currentStep === 2 && (
        <div className="space-y-4 max-w-2xl">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Basic Listing Information</h2>
            <p className="text-xs text-slate-500">Provide clear and descriptive information for marketplace buyers.</p>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Modern D2C Fashion E-Commerce Store with Razorpay"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Marketplace Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">URL Slug *</label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-slate-500 text-xs">
                  webbazaar.in/listings/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="modern-d2c-fashion-ecommerce"
                  className="w-full px-3 py-2 rounded-r-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Live Demo / Preview URL</label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://demo.yourwebsite.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Short Description * (Max 250 characters)</label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A concise summary shown on search cards and marketplace catalog..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Description * (Markdown supported)</label>
              <textarea
                rows={6}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Detailed overview: key features, architecture, included integrations, setup steps..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Category-Specific Details */}
      {currentStep === 3 && (
        <div className="space-y-4 max-w-2xl text-xs">
          {listingType === "READY_WEBSITE" && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">Ready-Made Website Specifications</h2>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Website Category</label>
                <input
                  type="text"
                  value={rwWebsiteCategory}
                  onChange={(e) => setRwWebsiteCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={rwTechStack}
                  onChange={(e) => setRwTechStack(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Features (comma-separated)</label>
                <input
                  type="text"
                  value={rwKeyFeatures}
                  onChange={(e) => setRwKeyFeatures(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Included Pages</label>
                <input
                  type="text"
                  value={rwIncludedPages}
                  onChange={(e) => setRwIncludedPages(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Method</label>
                <input
                  type="text"
                  value={rwDeliveryMethod}
                  onChange={(e) => setRwDeliveryMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">License Type</label>
                <input
                  type="text"
                  value={rwLicenseType}
                  onChange={(e) => setRwLicenseType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Installation Requirements</label>
                <input
                  type="text"
                  value={rwInstallationReqs}
                  onChange={(e) => setRwInstallationReqs(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rwResponsive"
                  checked={rwIsResponsive}
                  onChange={(e) => setRwIsResponsive(e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="rwResponsive" className="font-semibold text-slate-700">
                  Fully Responsive Across Mobile, Tablet, and Desktop
                </label>
              </div>
            </div>
          )}

          {listingType === "TEMPLATE" && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">Template & Source Code Specifications</h2>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Framework</label>
                <input
                  type="text"
                  value={tmplFramework}
                  onChange={(e) => setTmplFramework(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Programming Language</label>
                <input
                  type="text"
                  value={tmplLanguage}
                  onChange={(e) => setTmplLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compatible Versions</label>
                <input
                  type="text"
                  value={tmplVersions}
                  onChange={(e) => setTmplVersions(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Included Files</label>
                <input
                  type="text"
                  value={tmplIncludedFiles}
                  onChange={(e) => setTmplIncludedFiles(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">License Type</label>
                <input
                  type="text"
                  value={tmplLicense}
                  onChange={(e) => setTmplLicense(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Installation Instructions</label>
                <textarea
                  rows={3}
                  value={tmplInstallInstructions}
                  onChange={(e) => setTmplInstallInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Support Duration (Days)</label>
                <input
                  type="number"
                  value={tmplSupportDays}
                  onChange={(e) => setTmplSupportDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>
          )}

          {listingType === "BUSINESS" && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Important Financial Disclaimer</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  All financial metrics (revenue, profit, traffic) will be clearly badged on the marketplace as{" "}
                  <strong>&ldquo;Seller-Reported (Unverified)&rdquo;</strong> until independent escrow due-diligence is completed.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Model</label>
                <input
                  type="text"
                  value={bizModel}
                  onChange={(e) => setBizModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={bizIndustry}
                  onChange={(e) => setBizIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating History (Months)</label>
                  <input
                    type="number"
                    value={bizHistoryMonths}
                    onChange={(e) => setBizHistoryMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Traffic (Visitors)</label>
                  <input
                    type="number"
                    value={bizMonthlyTraffic}
                    onChange={(e) => setBizMonthlyTraffic(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Revenue (INR)</label>
                  <input
                    type="number"
                    value={bizMonthlyRevenue}
                    onChange={(e) => setBizMonthlyRevenue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Net Profit (INR)</label>
                  <input
                    type="number"
                    value={bizMonthlyProfit}
                    onChange={(e) => setBizMonthlyProfit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monetization Methods</label>
                <input
                  type="text"
                  value={bizMonetization}
                  onChange={(e) => setBizMonetization(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Included Assets</label>
                <textarea
                  rows={2}
                  value={bizIncludedAssets}
                  onChange={(e) => setBizIncludedAssets(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Sale</label>
                <input
                  type="text"
                  value={bizReasonForSale}
                  onChange={(e) => setBizReasonForSale(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confidential Seller Notes (Private to Admin / Escrow)
                </label>
                <textarea
                  rows={2}
                  value={bizConfidentialNotes}
                  onChange={(e) => setBizConfidentialNotes(e.target.value)}
                  placeholder="Private notes, P&L links, internal metrics..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>
          )}

          {listingType === "SERVICE" && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">Development Service Specifications</h2>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Category</label>
                <input
                  type="text"
                  value={srvCategory}
                  onChange={(e) => setSrvCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deliverables</label>
                <textarea
                  rows={3}
                  value={srvDeliverables}
                  onChange={(e) => setSrvDeliverables(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Delivery (Days)</label>
                  <input
                    type="number"
                    value={srvDeliveryDays}
                    onChange={(e) => setSrvDeliveryDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Revision Policy</label>
                  <input
                    type="text"
                    value={srvRevisions}
                    onChange={(e) => setSrvRevisions(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supported Technologies</label>
                <input
                  type="text"
                  value={srvTech}
                  onChange={(e) => setSrvTech(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requirements From Buyer</label>
                <textarea
                  rows={2}
                  value={srvRequirements}
                  onChange={(e) => setSrvRequirements(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Pricing */}
      {currentStep === 4 && (
        <div className="space-y-4 max-w-md">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Set Listing Price</h2>
            <p className="text-xs text-slate-500">
              WebBazaar transactions are processed in Indian Rupees (INR) with escrow protection.
            </p>
          </div>

          <div className="pt-2 text-xs space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Price (₹ INR) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  min={100}
                  value={priceInr}
                  onChange={(e) => setPriceInr(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 text-base font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Platform Commission:</span>
                <span className="font-semibold text-slate-900">5% upon sale</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Net Payout:</span>
                <span className="font-semibold text-emerald-700">₹{(priceInr * 0.95).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Buyer Protection:</span>
                <span className="font-medium text-slate-800">7-Day Escrow Hold</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Image Uploads */}
      {currentStep === 5 && (
        <div className="space-y-4 max-w-2xl text-xs">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Upload Product Images</h2>
            <p className="text-xs text-slate-500">
              Upload high-quality screenshots and cover artwork. Images are delivered via Supabase CDN.
            </p>
          </div>

          {/* Featured Image */}
          <div className="space-y-2 pt-2">
            <label className="block font-semibold text-slate-700">Cover / Featured Image</label>
            {featuredImagePath ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featuredImagePath} alt="Featured Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFeaturedImagePath(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload className="h-6 w-6 text-slate-400 mb-1" />
                <span className="font-medium text-slate-700">Click to upload cover image</span>
                <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Gallery Images */}
          <div className="space-y-2 pt-2">
            <label className="block font-semibold text-slate-700">Gallery Screenshots</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {galleryImages.map((imgUrl, idx) => (
                <div key={idx} className="relative h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center h-24 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload className="h-5 w-5 text-slate-400 mb-1" />
                <span className="text-[11px] font-medium text-slate-600">+ Add Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {uploadProgress && (
            <p className="text-xs text-primary-600 font-medium animate-pulse">{uploadProgress}</p>
          )}
        </div>
      )}

      {/* STEP 6: Source Deliverables Upload */}
      {currentStep === 6 && (
        <div className="space-y-4 max-w-2xl text-xs">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Upload Digital Deliverable Files</h2>
            <p className="text-xs text-slate-500">
              Deliverable zip files are stored in private Supabase Storage buckets (`listing-files`). They are strictly protected by Row Level Security and never exposed publicly.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            {fileDeliverablePath ? (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Digital Deliverable Uploaded</p>
                    <p className="text-[11px] text-slate-500 font-mono">{fileDeliverablePath}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFileDeliverablePath(null)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload className="h-6 w-6 text-slate-400 mb-1" />
                <span className="font-medium text-slate-700">Click to upload source code ZIP or PDF</span>
                <span className="text-[10px] text-slate-400 mt-0.5">ZIP, TAR.GZ, PDF up to 100MB</span>
                <input
                  type="file"
                  accept=".zip,.tar.gz,.pdf,.rar"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
              <span>
                You can also fulfill delivery manually upon escrow funding if your website requires live hosting transfer or domain migration.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 7: Review & Preview */}
      {currentStep === 7 && (
        <div className="space-y-4 max-w-2xl text-xs">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Review & Publish Listing</h2>
            <p className="text-xs text-slate-500">
              Verify your listing details before submitting. You can save as a draft to finish later, or submit directly for administrative review.
            </p>
          </div>

          {/* Preview Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {listingType.replace("_", " ")}
                  </Badge>
                  <span className="text-[11px] text-slate-500">{categoryId}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title || "Untitled Listing"}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{shortDescription}</p>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className="text-xs text-slate-500">Asking Price</span>
                <p className="text-xl font-extrabold text-slate-900">₹{priceInr.toLocaleString("en-IN")}</p>
              </div>
            </div>

            {featuredImagePath && (
              <div className="h-44 w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featuredImagePath} alt="Listing Cover" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-[11px]">
              <p className="text-slate-500">Slug: <span className="font-mono text-slate-800">/listings/{slug}</span></p>
              {demoUrl && <p className="text-slate-500">Demo URL: <a href={demoUrl} target="_blank" rel="noreferrer" className="text-primary-600 underline">{demoUrl}</a></p>}
              <p className="text-slate-500">Deliverable Attached: <span className="font-medium text-slate-800">{fileDeliverablePath ? "Yes (Secured in Supabase Storage)" : "Manual Transfer"}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentStep === 1 || submitting}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          className="gap-1 text-xs"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentStep < 7 ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
              className="gap-1 text-xs bg-slate-900 hover:bg-slate-800 text-white"
            >
              Continue <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={submitting}
                onClick={() => handleComplete(false)}
                className="gap-1.5 text-xs"
              >
                <Save className="h-3.5 w-3.5" />
                Save as Draft
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={submitting}
                onClick={() => handleComplete(true)}
                className="gap-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white font-medium"
              >
                <Send className="h-3.5 w-3.5" />
                {submitting ? "Submitting..." : "Submit for Review"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
