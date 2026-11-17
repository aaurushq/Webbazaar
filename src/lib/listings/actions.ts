"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createListingInputSchema,
  type CreateListingInput,
} from "./schemas";

export type ActionResult<T = unknown> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never; fieldErrors?: Record<string, string[]> };

function generateSlug(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `listing-${Date.now()}`;
}

/**
 * Creates a new listing with category-specific details and media.
 */
export async function createListingAction(
  rawInput: CreateListingInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required to create a listing." };
    }

    // Role check: VERIFIED_SELLER or ADMIN
    const { data: hasRole, error: roleError } = await (supabase as any).rpc("has_role", {
      check_user_id: user.id,
      check_role: "VERIFIED_SELLER",
    });

    const { data: isAdmin } = await (supabase as any).rpc("has_role", {
      check_user_id: user.id,
      check_role: "ADMIN",
    });

    if (roleError || (!hasRole && !isAdmin)) {
      return {
        success: false,
        error: "Unauthorized: You must be an approved, verified seller to publish listings.",
      };
    }

    // Validate input
    const parseResult = createListingInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: "Validation failed. Please correct the highlighted errors.",
        fieldErrors: parseResult.error.flatten().fieldErrors,
      };
    }

    const input = parseResult.data;
    let chosenSlug = input.slug ? generateSlug(input.slug) : generateSlug(input.title);

    // Check slug collision
    const { data: existingSlug } = await (supabase as any)
      .from("listings")
      .select("id")
      .eq("slug", chosenSlug)
      .maybeSingle();

    if (existingSlug) {
      chosenSlug = `${chosenSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    const initialStatus = input.submitForReview ? "pending_review" : "draft";

    // 1. Insert Base Listing
    const { data: newListing, error: listingError } = await (supabase as any)
      .from("listings")
      .insert({
        seller_id: user.id,
        category_id: input.categoryId,
        listing_type: input.listingType,
        title: input.title,
        slug: chosenSlug,
        short_description: input.shortDescription,
        full_description: input.fullDescription,
        price_inr: input.priceInr,
        currency: "INR",
        status: initialStatus,
        featured_image_path: input.featuredImagePath || null,
        demo_url: input.demoUrl || null,
      })
      .select("id, slug")
      .single();

    if (listingError || !newListing) {
      return { success: false, error: listingError?.message || "Failed to create listing record." };
    }

    const listingId = newListing.id;

    // 2. Insert Category-Specific Details
    if (input.listingType === "READY_WEBSITE" && input.readyWebsiteDetails) {
      const details = input.readyWebsiteDetails;
      await (supabase as any).from("ready_website_details").insert({
        listing_id: listingId,
        website_category: details.websiteCategory,
        tech_stack: details.techStack,
        key_features: details.keyFeatures,
        is_responsive: details.isResponsive,
        installation_requirements: details.installationRequirements || null,
        included_pages: details.includedPages,
        demo_url: details.demoUrl || null,
        delivery_method: details.deliveryMethod,
        license_type: details.licenseType,
      });
    } else if (input.listingType === "TEMPLATE" && input.templateDetails) {
      const details = input.templateDetails;
      await (supabase as any).from("template_details").insert({
        listing_id: listingId,
        framework: details.framework,
        programming_language: details.programmingLanguage,
        compatible_versions: details.compatibleVersions,
        included_files: details.includedFiles,
        has_documentation: details.hasDocumentation,
        license_type: details.licenseType,
        installation_instructions: details.installationInstructions,
        support_duration_days: details.supportDurationDays,
      });
    } else if (input.listingType === "BUSINESS" && input.businessDetails) {
      const details = input.businessDetails;
      await (supabase as any).from("business_details").insert({
        listing_id: listingId,
        business_model: details.businessModel,
        asking_price_inr: details.askingPriceInr,
        industry: details.industry,
        operating_history_months: details.operatingHistoryMonths,
        monthly_revenue_inr: details.monthlyRevenueInr,
        monthly_profit_inr: details.monthlyProfitInr,
        monthly_traffic: details.monthlyTraffic,
        monetization_methods: details.monetizationMethods,
        included_assets: details.includedAssets,
        reason_for_sale: details.reasonForSale,
        confidential_notes: details.confidentialNotes || null,
        is_financials_verified: false,
      });
    } else if (input.listingType === "SERVICE" && input.serviceDetails) {
      const details = input.serviceDetails;
      await (supabase as any).from("service_details").insert({
        listing_id: listingId,
        service_category: details.serviceCategory,
        deliverables: details.deliverables,
        starting_price_inr: details.startingPriceInr,
        estimated_delivery_days: details.estimatedDeliveryDays,
        revision_policy: details.revisionPolicy,
        supported_technologies: details.supportedTechnologies,
        buyer_requirements: details.buyerRequirements,
      });
    }

    // 3. Insert Gallery Media if any
    if (input.mediaPaths && input.mediaPaths.length > 0) {
      const mediaRecords = input.mediaPaths.map((path, idx) => ({
        listing_id: listingId,
        storage_path: path,
        media_type: "image",
        sort_order: idx,
      }));
      await (supabase as any).from("listing_media").insert(mediaRecords);
    }

    // Revalidate paths
    revalidatePath("/dashboard/seller");
    revalidatePath("/dashboard/seller/listings");
    revalidatePath("/marketplace");

    return {
      success: true,
      data: { id: listingId, slug: newListing.slug },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return { success: false, error: message };
  }
}

/**
 * Updates an existing draft or rejected listing.
 */
export async function updateListingAction(
  listingId: string,
  rawInput: CreateListingInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    // Fetch existing
    const { data: existing, error: fetchErr } = await (supabase as any)
      .from("listings")
      .select("id, seller_id, status")
      .eq("id", listingId)
      .single();

    if (fetchErr || !existing) {
      return { success: false, error: "Listing not found." };
    }

    if (existing.seller_id !== user.id) {
      return { success: false, error: "Unauthorized: You do not own this listing." };
    }

    if (existing.status !== "draft" && existing.status !== "rejected" && existing.status !== "pending_review") {
      return { success: false, error: `Cannot edit listing with status '${existing.status}'.` };
    }

    const parseResult = createListingInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parseResult.error.flatten().fieldErrors,
      };
    }

    const input = parseResult.data;
    const newStatus = input.submitForReview ? "pending_review" : existing.status === "rejected" ? "draft" : existing.status;

    // Update base
    const { error: updateErr } = await (supabase as any)
      .from("listings")
      .update({
        category_id: input.categoryId,
        title: input.title,
        short_description: input.shortDescription,
        full_description: input.fullDescription,
        price_inr: input.priceInr,
        featured_image_path: input.featuredImagePath || null,
        demo_url: input.demoUrl || null,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", listingId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // Update details
    if (input.listingType === "READY_WEBSITE" && input.readyWebsiteDetails) {
      const details = input.readyWebsiteDetails;
      await (supabase as any)
        .from("ready_website_details")
        .upsert({
          listing_id: listingId,
          website_category: details.websiteCategory,
          tech_stack: details.techStack,
          key_features: details.keyFeatures,
          is_responsive: details.isResponsive,
          installation_requirements: details.installationRequirements || null,
          included_pages: details.includedPages,
          demo_url: details.demoUrl || null,
          delivery_method: details.deliveryMethod,
          license_type: details.licenseType,
        });
    } else if (input.listingType === "TEMPLATE" && input.templateDetails) {
      const details = input.templateDetails;
      await (supabase as any)
        .from("template_details")
        .upsert({
          listing_id: listingId,
          framework: details.framework,
          programming_language: details.programmingLanguage,
          compatible_versions: details.compatibleVersions,
          included_files: details.includedFiles,
          has_documentation: details.hasDocumentation,
          license_type: details.licenseType,
          installation_instructions: details.installationInstructions,
          support_duration_days: details.supportDurationDays,
        });
    } else if (input.listingType === "BUSINESS" && input.businessDetails) {
      const details = input.businessDetails;
      await (supabase as any)
        .from("business_details")
        .upsert({
          listing_id: listingId,
          business_model: details.businessModel,
          asking_price_inr: details.askingPriceInr,
          industry: details.industry,
          operating_history_months: details.operatingHistoryMonths,
          monthly_revenue_inr: details.monthlyRevenueInr,
          monthly_profit_inr: details.monthlyProfitInr,
          monthly_traffic: details.monthlyTraffic,
          monetization_methods: details.monetizationMethods,
          included_assets: details.includedAssets,
          reason_for_sale: details.reasonForSale,
          confidential_notes: details.confidentialNotes || null,
        });
    } else if (input.listingType === "SERVICE" && input.serviceDetails) {
      const details = input.serviceDetails;
      await (supabase as any)
        .from("service_details")
        .upsert({
          listing_id: listingId,
          service_category: details.serviceCategory,
          deliverables: details.deliverables,
          starting_price_inr: details.startingPriceInr,
          estimated_delivery_days: details.estimatedDeliveryDays,
          revision_policy: details.revisionPolicy,
          supported_technologies: details.supportedTechnologies,
          buyer_requirements: details.buyerRequirements,
        });
    }

    revalidatePath("/dashboard/seller");
    revalidatePath("/dashboard/seller/listings");
    revalidatePath(`/dashboard/seller/listings/${listingId}`);

    return { success: true, data: { id: listingId, slug: input.slug } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed";
    return { success: false, error: message };
  }
}

/**
 * Seller submits draft/rejected listing for admin review.
 */
export async function submitListingForReviewAction(listingId: string): Promise<ActionResult<{ status: string }>> {
  try {
    const supabase = createClient();
    const { error } = await (supabase as any).rpc("seller_submit_listing_for_review", {
      p_listing_id: listingId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/seller/listings");
    revalidatePath("/dashboard/admin/listings");
    return { success: true, data: { status: "pending_review" } };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to submit" };
  }
}

/**
 * Seller archives an active or draft listing.
 */
export async function archiveListingAction(listingId: string): Promise<ActionResult<{ status: string }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Authentication required" };

    const { error } = await (supabase as any)
      .from("listings")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", listingId)
      .eq("seller_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/seller/listings");
    revalidatePath("/marketplace");
    return { success: true, data: { status: "archived" } };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to archive" };
  }
}

/**
 * Admin approves or rejects a listing.
 */
export async function adminModerateListingAction(
  listingId: string,
  action: "approve" | "reject",
  reason?: string
): Promise<ActionResult<{ status: string }>> {
  try {
    const supabase = createClient();
    const { error } = await (supabase as any).rpc("admin_moderate_listing", {
      p_listing_id: listingId,
      p_action: action,
      p_reason: reason || undefined,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/listings");
    revalidatePath("/dashboard/seller/listings");
    revalidatePath("/marketplace");
    revalidatePath(`/listings/${listingId}`);

    return { success: true, data: { status: action === "approve" ? "approved" : "rejected" } };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Moderation failed" };
  }
}

/**
 * Fetch listings belonging to the authenticated seller.
 */
export async function getSellerListingsAction() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { listings: [], error: "Not authenticated" };

  const { data, error } = await (supabase as any)
    .from("listings")
    .select(`
      id,
      title,
      slug,
      listing_type,
      category_id,
      price_inr,
      currency,
      status,
      featured_image_path,
      rejection_reason,
      created_at,
      published_at
    `)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { listings: [], error: error.message };
  }

  return { listings: data || [], error: null };
}

/**
 * Real counts for seller dashboard statistics.
 */
export async function getSellerDashboardStatsAction() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      stats: { total: 0, draft: 0, pending: 0, approved: 0, rejected: 0, archived: 0 },
      error: "Not authenticated",
    };
  }

  const { data, error } = await (supabase as any)
    .from("listings")
    .select("status")
    .eq("seller_id", user.id);

  if (error || !data) {
    return {
      stats: { total: 0, draft: 0, pending: 0, approved: 0, rejected: 0, archived: 0 },
      error: error?.message,
    };
  }

  const items = data as Array<{ status: string }>;
  const stats = {
    total: items.length,
    draft: items.filter((item) => item.status === "draft").length,
    pending: items.filter((item) => item.status === "pending_review").length,
    approved: items.filter((item) => item.status === "approved").length,
    rejected: items.filter((item) => item.status === "rejected").length,
    archived: items.filter((item) => item.status === "archived").length,
  };

  return { stats, error: null };
}

/**
 * Fetch pending listings for admin moderation.
 */
export async function getAdminPendingListingsAction() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { listings: [], error: "Not authenticated" };

  const { data, error } = await (supabase as any)
    .from("listings")
    .select(`
      id,
      title,
      slug,
      listing_type,
      category_id,
      price_inr,
      short_description,
      full_description,
      demo_url,
      featured_image_path,
      created_at,
      seller_id,
      profiles:seller_id (
        id,
        display_name,
        avatar_path
      )
    `)
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  if (error) {
    return { listings: [], error: error.message };
  }

  return { listings: data || [], error: null };
}

/**
 * Fetch public approved listings from Supabase.
 */
export async function getPublicApprovedListingsAction(filters?: {
  categoryId?: string;
  listingType?: string;
  search?: string;
  sortBy?: "newest" | "price-asc" | "price-desc";
  limit?: number;
}) {
  const supabase = createClient();
  let query = (supabase as any)
    .from("listings")
    .select(`
      id,
      title,
      slug,
      short_description,
      full_description,
      listing_type,
      category_id,
      price_inr,
      currency,
      featured_image_path,
      demo_url,
      published_at,
      created_at,
      seller:profiles!seller_id (
        id,
        display_name,
        avatar_path
      )
    `)
    .eq("status", "approved");

  if (filters?.categoryId && filters.categoryId !== "All") {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters?.listingType) {
    query = query.eq("listing_type", filters.listingType);
  }

  if (filters?.search && filters.search.trim() !== "") {
    query = query.ilike("title", `%${filters.search.trim()}%`);
  }

  if (filters?.sortBy === "price-asc") {
    query = query.order("price_inr", { ascending: true });
  } else if (filters?.sortBy === "price-desc") {
    query = query.order("price_inr", { ascending: false });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    return { listings: [], error: error.message };
  }

  return { listings: data || [], error: null };
}

/**
 * Fetch single public approved listing by slug with specialized details.
 */
export async function getPublicListingBySlugAction(slug: string) {
  const supabase = createClient();
  const { data: listing, error } = await (supabase as any)
    .from("listings")
    .select(`
      id,
      title,
      slug,
      short_description,
      full_description,
      listing_type,
      category_id,
      price_inr,
      currency,
      status,
      featured_image_path,
      demo_url,
      published_at,
      created_at,
      seller_id,
      profiles:seller_id (
        id,
        display_name,
        avatar_path
      ),
      ready_website_details (*),
      template_details (*),
      business_details (*),
      service_details (*),
      listing_media (*)
    `)
    .eq("slug", slug)
    .single();

  if (error || !listing) {
    return { listing: null, error: error?.message || "Listing not found" };
  }

  return { listing, error: null };
}
