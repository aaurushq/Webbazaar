"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Store,
  User,
  Globe,
  Mail,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { sellerApplicationSchema, SellerApplicationInput } from "@/lib/auth/schemas";
import { submitSellerApplicationAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES_LIST } from "@/data/demo-listings";

export default function BecomeASellerPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SellerApplicationInput>({
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: {
      storeName: "",
      sellerType: "developer",
      portfolioUrl: "",
      professionalBio: "",
      productCategories: ["SaaS & Web Apps"],
      country: "India",
      contactEmail: "",
      termsAgreed: true,
    },
  });

  const selectedCategories = watch("productCategories") || [];
  const selectedSellerType = watch("sellerType");

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setValue(
          "productCategories",
          selectedCategories.filter((c) => c !== cat),
          { shouldValidate: true }
        );
      }
    } else {
      setValue("productCategories", [...selectedCategories, cat], { shouldValidate: true });
    }
  };

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger(["storeName", "sellerType", "country"]);
    } else if (currentStep === 2) {
      isValid = await trigger(["portfolioUrl", "professionalBio", "contactEmail"]);
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const onSubmit = async (values: SellerApplicationInput) => {
    setIsSubmitting(true);
    setServerError(null);

    const result = await submitSellerApplicationAction(values);
    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
    } else if (result?.success) {
      setIsSuccess(true);
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 max-w-2xl">
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 sm:p-10 shadow-sm text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Application Submitted Successfully!
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
            Your seller application has been received and queued for administrative review. Our verification team will audit your developer profile and technical portfolio within 24–48 hours.
          </p>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-700 text-left space-y-2 mt-4">
            <div className="font-semibold text-slate-900">Application Reference Status:</div>
            <div className="flex items-center gap-2 text-amber-700 font-medium">
              <Clock className="h-4 w-4" />
              <span>Status: Under Review (Pending Administrator Approval)</span>
            </div>
            <p className="text-slate-500">
              You will receive an automated email notification once an administrator reviews your application.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild>
              <Link href="/dashboard/buyer">Go to Buyer Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/marketplace">Explore Marketplace</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/sell" className="hover:text-slate-900 transition-colors">
          Seller Program
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Onboarding Application</span>
      </nav>

      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
          <Rocket className="h-3.5 w-3.5" />
          <span>Seller Verification Program</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Apply to Sell on WebBazaar
        </h1>
        <p className="text-sm text-slate-600">
          Complete the 3-step verification application below. All submissions are audited by our administration team before publishing rights are granted.
        </p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="grid grid-cols-3 gap-2 mb-8 text-xs font-medium">
        <div
          className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
            currentStep === 1
              ? "border-primary-600 bg-primary-50 text-primary-900 font-semibold"
              : currentStep > 1
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-slate-50 text-slate-400"
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow-xs">
            1
          </span>
          <span className="truncate">Store Identity</span>
        </div>

        <div
          className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
            currentStep === 2
              ? "border-primary-600 bg-primary-50 text-primary-900 font-semibold"
              : currentStep > 2
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-slate-50 text-slate-400"
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow-xs">
            2
          </span>
          <span className="truncate">Portfolio & Bio</span>
        </div>

        <div
          className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
            currentStep === 3
              ? "border-primary-600 bg-primary-50 text-primary-900 font-semibold"
              : "border-slate-200 bg-slate-50 text-slate-400"
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow-xs">
            3
          </span>
          <span className="truncate">Categories & Terms</span>
        </div>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2 text-xs text-red-800 mb-6">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Multi-step Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* STEP 1: Store & Entity Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-lg font-bold text-slate-900">Step 1: Your Brand & Entity Type</h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Store or Creator Brand Name
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="e.g. PixelCraft Studios or Aarav Codes"
                    className="pl-9 h-10 text-sm"
                    {...register("storeName")}
                  />
                </div>
                {errors.storeName && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.storeName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Seller Entity Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "developer", label: "Solo Developer" },
                    { id: "individual", label: "Individual Creator" },
                    { id: "agency", label: "Dev Agency" },
                    { id: "business", label: "Registered Company" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setValue("sellerType", t.id as any, { shouldValidate: true })}
                      className={`p-3 text-xs rounded-xl border text-center font-medium transition-all ${
                        selectedSellerType === t.id
                          ? "border-primary-600 bg-primary-50 text-primary-900 font-semibold shadow-xs"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {errors.sellerType && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.sellerType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Country of Residence / Operation
                </label>
                <Input
                  type="text"
                  placeholder="India"
                  className="h-10 text-sm"
                  {...register("country")}
                />
                {errors.country && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.country.message}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Portfolio & Bio */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-lg font-bold text-slate-900">Step 2: Technical Background & Portfolio</h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Portfolio / GitHub / Agency URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="url"
                    placeholder="https://github.com/yourhandle or https://yourstudio.com"
                    className="pl-9 h-10 text-sm"
                    {...register("portfolioUrl")}
                  />
                </div>
                {errors.portfolioUrl && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.portfolioUrl.message}</p>
                )}
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Our moderators check this to evaluate code authenticity and project track record.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Contact Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="contact@yourdomain.com"
                    className="pl-9 h-10 text-sm"
                    {...register("contactEmail")}
                  />
                </div>
                {errors.contactEmail && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.contactEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professional Bio & Technical Expertise (Min 30 chars)
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail your experience with Next.js, React, Supabase, full-stack architectures, or e-commerce development..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  {...register("professionalBio")}
                />
                {errors.professionalBio && (
                  <p className="text-[11px] text-red-600 mt-1">
                    {errors.professionalBio.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Categories & Terms */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-lg font-bold text-slate-900">Step 3: Asset Types & Agreement</h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Product Categories You Intend to Sell
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES_LIST.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 font-semibold"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                {errors.productCategories && (
                  <p className="text-[11px] text-red-600 mt-1">
                    {errors.productCategories.message}
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3 text-xs text-slate-700 mt-4">
                <div className="font-semibold text-slate-900">WebBazaar Seller Code of Conduct:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>You warrant that all uploaded code and assets are original or properly licensed for commercial distribution.</li>
                  <li>No malicious scripts, keyloggers, or unlicensed third-party assets are permitted.</li>
                  <li>Agreed marketplace commission rates: 12% ready sites, 15% templates, 12% services, 5% business acquisitions.</li>
                </ul>

                <label className="flex items-start gap-2 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-600 mt-0.5"
                    {...register("termsAgreed")}
                  />
                  <span className="font-medium text-slate-900">
                    I agree to the WebBazaar Seller Terms and acknowledge that applications undergo administrative review.
                  </span>
                </label>
                {errors.termsAgreed && (
                  <p className="text-[11px] text-red-600">{errors.termsAgreed.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button type="button" size="sm" onClick={handleNext} className="gap-1.5">
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} size="sm" className="gap-1.5">
                {isSubmitting ? "Submitting Application..." : "Submit Application for Review"}
                {!isSubmitting && <FileCheck className="h-3.5 w-3.5" />}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
