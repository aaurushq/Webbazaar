"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createCustomizationRequestSchema,
  updateCustomizationRequestSchema,
  createQuoteSchema,
  respondQuoteSchema,
  type CreateCustomizationRequestInput,
  type UpdateCustomizationRequestInput,
  type CreateQuoteInput,
  type RespondQuoteInput,
} from "./schemas";
import type {
  CustomizationDashboardStats,
  CustomizationRequestRecord,
  QuoteRecord,
} from "./types";

export type CustomizationActionResult<T = unknown> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never; code?: string };

/**
 * Buyer submits a structured customization request inside an active conversation.
 */
export async function createCustomizationRequestAction(
  input: CreateCustomizationRequestInput
): Promise<CustomizationActionResult<{ requestId: string }>> {
  const parsed = createCustomizationRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid customization request details.",
    };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required.", code: "UNAUTHENTICATED" };
    }

    const { data: requestId, error } = await (supabase as any).rpc(
      "create_customization_request",
      {
        p_conversation_id: parsed.data.conversationId,
        p_title: parsed.data.title,
        p_requirements: parsed.data.requirements,
        p_requested_features: parsed.data.requestedFeatures,
        p_optional_budget: parsed.data.optionalBudget ?? null,
        p_desired_delivery_date: parsed.data.desiredDeliveryDate ?? null,
      }
    );

    if (error || !requestId) {
      const msg = error?.message || "Failed to submit customization request.";
      if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("too many active")) {
        return { success: false, error: msg, code: "RATE_LIMITED" };
      }
      return { success: false, error: msg };
    }

    revalidatePath(`/dashboard/messages/${parsed.data.conversationId}`);
    revalidatePath("/dashboard/buyer");
    revalidatePath("/dashboard/seller");

    return { success: true, data: { requestId: String(requestId) } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Buyer edits their own eligible customization request (submitted or discussing).
 */
export async function updateCustomizationRequestAction(
  requestId: string,
  input: UpdateCustomizationRequestInput
): Promise<CustomizationActionResult<{ updated: true }>> {
  const parsed = updateCustomizationRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid customization request details.",
    };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required.", code: "UNAUTHENTICATED" };
    }

    const { error } = await (supabase as any)
      .from("customization_requests")
      .update({
        title: parsed.data.title,
        requirements: parsed.data.requirements,
        requested_features: parsed.data.requestedFeatures,
        optional_budget: parsed.data.optionalBudget ?? null,
        desired_delivery_date: parsed.data.desiredDeliveryDate ?? null,
      })
      .eq("id", requestId)
      .eq("buyer_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/messages");
    revalidatePath("/dashboard/buyer");
    return { success: true, data: { updated: true } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update request.",
    };
  }
}

/**
 * Buyer cancels an open customization request.
 */
export async function cancelCustomizationRequestAction(
  requestId: string
): Promise<CustomizationActionResult<{ cancelled: true }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required.", code: "UNAUTHENTICATED" };
    }

    const { error } = await (supabase as any)
      .from("customization_requests")
      .update({ status: "cancelled" })
      .eq("id", requestId)
      .eq("buyer_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/messages");
    revalidatePath("/dashboard/buyer");
    revalidatePath("/dashboard/seller");
    return { success: true, data: { cancelled: true } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to cancel request.",
    };
  }
}

/**
 * Seller marks a newly submitted request as under discussion.
 */
export async function markRequestDiscussingAction(
  requestId: string
): Promise<CustomizationActionResult<{ status: "discussing" }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required.", code: "UNAUTHENTICATED" };
    }

    const { error } = await (supabase as any)
      .from("customization_requests")
      .update({ status: "discussing" })
      .eq("id", requestId)
      .eq("seller_id", user.id)
      .eq("status", "submitted");

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/messages");
    revalidatePath("/dashboard/seller");
    return { success: true, data: { status: "discussing" } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update request status.",
    };
  }
}

/**
 * Seller creates and sends (or saves draft) a structured, versioned quotation.
 * Server calculates total_price = base_product_price + customization_price.
 */
export async function createSellerQuoteAction(
  input: CreateQuoteInput
): Promise<CustomizationActionResult<{ quoteId: string }>> {
  const parsed = createQuoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid quotation details.",
    };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required.", code: "UNAUTHENTICATED" };
    }

    const { data: quoteId, error } = await (supabase as any).rpc("create_seller_quote", {
      p_customization_request_id: parsed.data.customizationRequestId,
      p_base_product_price: parsed.data.baseProductPrice,
      p_customization_price: parsed.data.customizationPrice,
      p_scope_of_work: parsed.data.scopeOfWork,
      p_estimated_delivery_days: parsed.data.estimatedDeliveryDays,
      p_revision_policy: parsed.data.revisionPolicy,
      p_payment_terms: parsed.data.paymentTerms,
      p_valid_days: parsed.data.validDays,
      p_status: parsed.data.status,
    });

    if (error || !quoteId) {
      return {
        success: false,
        error: error?.message || "Failed to create quotation.",
      };
    }

    revalidatePath("/dashboard/messages");
    revalidatePath("/dashboard/buyer");
    revalidatePath("/dashboard/seller");

    return { success: true, data: { quoteId: String(quoteId) } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Seller withdraws an active sent or draft quotation.
 */
export async function withdrawSellerQuoteAction(
  quoteId: string
): Promise<CustomizationActionResult<{ withdrawn: true }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required.", code: "UNAUTHENTICATED" };
    }

    const { error } = await (supabase as any)
      .from("quotes")
      .update({ status: "withdrawn" })
      .eq("id", quoteId)
      .eq("seller_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/messages");
    revalidatePath("/dashboard/buyer");
    revalidatePath("/dashboard/seller");
    return { success: true, data: { withdrawn: true } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to withdraw quotation.",
    };
  }
}

/**
 * Buyer accepts or declines an active sent quotation (authorized server-side in PostgreSQL).
 */
export async function respondToQuoteAction(
  input: RespondQuoteInput
): Promise<CustomizationActionResult<{ status: "accepted" | "declined" }>> {
  const parsed = respondQuoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid quotation response.",
    };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required.", code: "UNAUTHENTICATED" };
    }

    const { data: resultingStatus, error } = await (supabase as any).rpc("respond_to_quote", {
      p_quote_id: parsed.data.quoteId,
      p_decision: parsed.data.decision,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/messages");
    revalidatePath("/dashboard/buyer");
    revalidatePath("/dashboard/seller");

    return {
      success: true,
      data: { status: resultingStatus as "accepted" | "declined" },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to respond to quotation.",
    };
  }
}

/**
 * Fetches all customization requests and versioned quotes for an active conversation.
 */
export async function getConversationCustomizationDataAction(
  conversationId: string
): Promise<CustomizationActionResult<{ requests: CustomizationRequestRecord[] }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required.", code: "UNAUTHENTICATED" };
    }

    const { data: reqRows, error: reqErr } = await (supabase as any)
      .from("customization_requests")
      .select(
        `
        id,
        conversation_id,
        listing_id,
        buyer_id,
        seller_id,
        title,
        requirements,
        requested_features,
        optional_budget,
        desired_delivery_date,
        status,
        created_at,
        updated_at
      `
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false });

    if (reqErr) {
      return { success: false, error: reqErr.message };
    }

    const requestsList = (reqRows || []) as any[];
    if (requestsList.length === 0) {
      return { success: true, data: { requests: [] } };
    }

    const requestIds = requestsList.map((r) => r.id);
    const { data: quoteRows, error: quoteErr } = await (supabase as any)
      .from("quotes")
      .select(
        `
        id,
        customization_request_id,
        version,
        seller_id,
        buyer_id,
        base_product_price,
        customization_price,
        total_price,
        scope_of_work,
        estimated_delivery_days,
        revision_policy,
        payment_terms,
        status,
        accepted_at,
        created_at,
        expires_at
      `
      )
      .in("customization_request_id", requestIds)
      .order("version", { ascending: false });

    if (quoteErr) {
      return { success: false, error: quoteErr.message };
    }

    const quotesByRequest = new Map<string, QuoteRecord[]>();
    for (const q of (quoteRows || []) as QuoteRecord[]) {
      const list = quotesByRequest.get(q.customization_request_id) || [];
      list.push({
        ...q,
        base_product_price: Number(q.base_product_price),
        customization_price: Number(q.customization_price),
        total_price: Number(q.total_price),
      });
      quotesByRequest.set(q.customization_request_id, list);
    }

    const hydrated: CustomizationRequestRecord[] = requestsList.map((r) => ({
      ...r,
      optional_budget: r.optional_budget !== null ? Number(r.optional_budget) : null,
      requested_features: Array.isArray(r.requested_features) ? r.requested_features : [],
      quotes: quotesByRequest.get(r.id) || [],
    }));

    return { success: true, data: { requests: hydrated } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load customization details.",
    };
  }
}

/**
 * Real database statistics for Buyer & Seller dashboards (requests, quotes, pending decisions, accepted quotes).
 */
export async function getCustomizationDashboardStatsAction(): Promise<
  CustomizationActionResult<CustomizationDashboardStats>
> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required.", code: "UNAUTHENTICATED" };
    }

    const [{ data: reqRows, error: reqErr }, { data: quoteRows, error: quoteErr }] =
      await Promise.all([
        (supabase as any)
          .from("customization_requests")
          .select(
            `
            id,
            conversation_id,
            listing_id,
            buyer_id,
            seller_id,
            title,
            requirements,
            requested_features,
            optional_budget,
            desired_delivery_date,
            status,
            created_at,
            updated_at,
            listing:listings!listing_id (
              id,
              title,
              slug,
              price_inr
            ),
            buyer:profiles!buyer_id (
              id,
              display_name
            ),
            seller:profiles!seller_id (
              id,
              display_name
            )
          `
          )
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order("updated_at", { ascending: false }),
        (supabase as any)
          .from("quotes")
          .select(
            `
            id,
            customization_request_id,
            version,
            seller_id,
            buyer_id,
            base_product_price,
            customization_price,
            total_price,
            scope_of_work,
            estimated_delivery_days,
            revision_policy,
            payment_terms,
            status,
            accepted_at,
            created_at,
            expires_at
          `
          )
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order("created_at", { ascending: false }),
      ]);

    if (reqErr) return { success: false, error: reqErr.message };
    if (quoteErr) return { success: false, error: quoteErr.message };

    const allQuotes = ((quoteRows || []) as any[]).map((q) => ({
      ...q,
      base_product_price: Number(q.base_product_price),
      customization_price: Number(q.customization_price),
      total_price: Number(q.total_price),
    })) as QuoteRecord[];

    const quotesByReq = new Map<string, QuoteRecord[]>();
    for (const q of allQuotes) {
      const list = quotesByReq.get(q.customization_request_id) || [];
      list.push(q);
      quotesByReq.set(q.customization_request_id, list);
    }

    const allRequests: CustomizationRequestRecord[] = ((reqRows || []) as any[]).map((r) => ({
      ...r,
      optional_budget: r.optional_budget !== null ? Number(r.optional_budget) : null,
      requested_features: Array.isArray(r.requested_features) ? r.requested_features : [],
      quotes: quotesByReq.get(r.id) || [],
    }));

    const nowMs = Date.now();

    const buyerRequests = allRequests.filter((r) => r.buyer_id === user.id);
    const buyerQuotes = allQuotes.filter((q) => q.buyer_id === user.id && q.status !== "draft");
    const buyerPendingDecisions = buyerQuotes.filter(
      (q) => q.status === "sent" && new Date(q.expires_at).getTime() > nowMs
    );

    const sellerRequests = allRequests.filter((r) => r.seller_id === user.id);
    const sellerNewRequests = sellerRequests.filter(
      (r) => r.status === "submitted" || r.status === "discussing"
    );
    const sellerQuotesSent = allQuotes.filter(
      (q) => q.seller_id === user.id && q.status !== "draft"
    );
    const sellerAcceptedQuotes = allQuotes.filter(
      (q) => q.seller_id === user.id && q.status === "accepted"
    );

    return {
      success: true,
      data: {
        myCustomizationRequestsCount: buyerRequests.length,
        quotesReceivedCount: buyerQuotes.length,
        pendingDecisionsCount: buyerPendingDecisions.length,
        recentBuyerRequests: buyerRequests.slice(0, 5),
        newCustomizationRequestsCount: sellerNewRequests.length,
        quotesSentCount: sellerQuotesSent.length,
        acceptedQuotesCount: sellerAcceptedQuotes.length,
        recentSellerRequests: sellerRequests.slice(0, 5),
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load customization dashboard stats.",
    };
  }
}
