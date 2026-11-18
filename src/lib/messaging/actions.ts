"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  sendMessageSchema,
  startConversationSchema,
  type SendMessageInput,
} from "./schemas";
import type {
  ConversationSummary,
  MessageItem,
  MessagingDashboardStats,
} from "./types";

export type MessagingActionResult<T = unknown> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never; code?: string };

/**
 * Initiates a new conversation or returns an existing active conversation
 * for an approved listing. Derives buyer_id from auth session and seller_id
 * from the listing record inside PostgreSQL.
 */
export async function startConversationAction(
  listingId: string
): Promise<MessagingActionResult<{ conversationId: string }>> {
  const parsed = startConversationSchema.safeParse({ listingId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid listing identifier.",
    };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Please sign in to contact the seller.",
        code: "UNAUTHENTICATED",
      };
    }

    const { data: conversationId, error: rpcError } = await (supabase as any).rpc(
      "start_or_get_conversation",
      { p_listing_id: parsed.data.listingId }
    );

    if (rpcError || !conversationId) {
      const rawMsg = rpcError?.message || "Unable to start conversation.";
      if (rawMsg.toLowerCase().includes("own listing")) {
        return {
          success: false,
          error: "You cannot message yourself on your own listing.",
          code: "SELF_MESSAGE",
        };
      }
      if (rawMsg.toLowerCase().includes("approved")) {
        return {
          success: false,
          error: "Messaging is only available for approved listings.",
          code: "LISTING_NOT_APPROVED",
        };
      }
      return { success: false, error: rawMsg };
    }

    revalidatePath("/dashboard/messages");
    revalidatePath("/dashboard/buyer");
    revalidatePath("/dashboard/seller");

    return {
      success: true,
      data: { conversationId: String(conversationId) },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Fetches all conversations for the authenticated user (both buyer inquiries
 * and seller inbox threads) with listing details, counterparty profile,
 * latest message preview, and exact unread counts.
 */
export async function getUserConversationsAction(): Promise<
  MessagingActionResult<{ userId: string; conversations: ConversationSummary[] }>
> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required.",
        code: "UNAUTHENTICATED",
      };
    }

    const { data: convRows, error: convError } = await (supabase as any)
      .from("conversations")
      .select(
        `
        id,
        listing_id,
        buyer_id,
        seller_id,
        status,
        created_at,
        updated_at,
        listing:listings!listing_id (
          id,
          title,
          slug,
          price_inr,
          listing_type,
          category_id,
          featured_image_path,
          demo_url,
          status
        ),
        buyer:profiles!buyer_id (
          id,
          display_name,
          avatar_path
        ),
        seller:profiles!seller_id (
          id,
          display_name,
          avatar_path
        )
      `
      )
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (convError) {
      return { success: false, error: convError.message };
    }

    const conversationsList = (convRows || []) as any[];
    if (conversationsList.length === 0) {
      return {
        success: true,
        data: { userId: user.id, conversations: [] },
      };
    }

    const conversationIds = conversationsList.map((c) => c.id);

    // Fetch messages for these conversations to derive accurate latest message + unread counts
    const { data: msgRows, error: msgError } = await (supabase as any)
      .from("messages")
      .select("id, conversation_id, sender_id, body, created_at, read_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    if (msgError) {
      return { success: false, error: msgError.message };
    }

    const lastMessageByConv = new Map<string, any>();
    const unreadCountByConv = new Map<string, number>();

    for (const msg of msgRows || []) {
      if (!lastMessageByConv.has(msg.conversation_id)) {
        lastMessageByConv.set(msg.conversation_id, msg);
      }
      if (msg.sender_id !== user.id && msg.read_at === null) {
        unreadCountByConv.set(
          msg.conversation_id,
          (unreadCountByConv.get(msg.conversation_id) || 0) + 1
        );
      }
    }

    const summaries: ConversationSummary[] = conversationsList.map((conv) => ({
      id: conv.id,
      listing_id: conv.listing_id,
      buyer_id: conv.buyer_id,
      seller_id: conv.seller_id,
      status: conv.status,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      listing: conv.listing || null,
      buyer: conv.buyer || null,
      seller: conv.seller || null,
      lastMessage: lastMessageByConv.get(conv.id) || null,
      unreadCount: unreadCountByConv.get(conv.id) || 0,
    }));

    return {
      success: true,
      data: { userId: user.id, conversations: summaries },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load conversations.",
    };
  }
}

/**
 * Fetches a single conversation and all its messages for an authorized participant.
 */
export async function getConversationThreadAction(
  conversationId: string
): Promise<
  MessagingActionResult<{
    userId: string;
    conversation: ConversationSummary;
    messages: MessageItem[];
  }>
> {
  const idCheck = startConversationSchema.safeParse({ listingId: conversationId });
  if (!idCheck.success) {
    return { success: false, error: "Invalid conversation ID." };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required.",
        code: "UNAUTHENTICATED",
      };
    }

    const { data: conv, error: convError } = await (supabase as any)
      .from("conversations")
      .select(
        `
        id,
        listing_id,
        buyer_id,
        seller_id,
        status,
        created_at,
        updated_at,
        listing:listings!listing_id (
          id,
          title,
          slug,
          price_inr,
          listing_type,
          category_id,
          featured_image_path,
          demo_url,
          status
        ),
        buyer:profiles!buyer_id (
          id,
          display_name,
          avatar_path
        ),
        seller:profiles!seller_id (
          id,
          display_name,
          avatar_path
        )
      `
      )
      .eq("id", conversationId)
      .maybeSingle();

    if (convError || !conv) {
      return {
        success: false,
        error: "Conversation not found or you do not have permission to view it.",
        code: "FORBIDDEN_OR_NOT_FOUND",
      };
    }

    const { data: msgRows, error: msgError } = await (supabase as any)
      .from("messages")
      .select("id, conversation_id, sender_id, body, created_at, read_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (msgError) {
      return { success: false, error: msgError.message };
    }

    const messages = (msgRows || []) as MessageItem[];
    const unreadCount = messages.filter(
      (m) => m.sender_id !== user.id && m.read_at === null
    ).length;

    const summary: ConversationSummary = {
      id: conv.id,
      listing_id: conv.listing_id,
      buyer_id: conv.buyer_id,
      seller_id: conv.seller_id,
      status: conv.status,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      listing: conv.listing || null,
      buyer: conv.buyer || null,
      seller: conv.seller || null,
      lastMessage: messages.length > 0 ? messages[messages.length - 1] : null,
      unreadCount,
    };

    return {
      success: true,
      data: {
        userId: user.id,
        conversation: summary,
        messages,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load messages.",
    };
  }
}

/**
 * Sends a validated message as the authenticated participant.
 * Enforces Zod validation, sender_id = auth.uid(), RLS participant check, and Postgres rate limit.
 */
export async function sendMessageAction(
  input: SendMessageInput
): Promise<MessagingActionResult<{ message: MessageItem }>> {
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid message content.",
    };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required.",
        code: "UNAUTHENTICATED",
      };
    }

    const { data: inserted, error: insertError } = await (supabase as any)
      .from("messages")
      .insert({
        conversation_id: parsed.data.conversationId,
        sender_id: user.id,
        body: parsed.data.body,
      })
      .select("id, conversation_id, sender_id, body, created_at, read_at")
      .single();

    if (insertError || !inserted) {
      const msg = insertError?.message || "Failed to send message.";
      if (msg.toLowerCase().includes("rate limit")) {
        return {
          success: false,
          error: "You are sending messages too quickly. Please wait a moment and try again.",
          code: "RATE_LIMITED",
        };
      }
      if (insertError?.code === "42501") {
        return {
          success: false,
          error: "You are not authorized to send messages in this conversation.",
          code: "FORBIDDEN",
        };
      }
      return { success: false, error: msg };
    }

    return {
      success: true,
      data: { message: inserted as MessageItem },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send message.",
    };
  }
}

/**
 * Marks all incoming unread messages in a conversation as read for the current participant.
 */
export async function markConversationReadAction(
  conversationId: string
): Promise<MessagingActionResult<{ updatedCount: number }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const { data: updatedCount, error } = await (supabase as any).rpc(
      "mark_conversation_messages_read",
      { p_conversation_id: conversationId }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: { updatedCount: Number(updatedCount || 0) },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unable to update read status.",
    };
  }
}

/**
 * Returns real buyer & seller conversation/unread statistics for dashboards and header badges.
 */
export async function getMessagingDashboardStatsAction(): Promise<
  MessagingActionResult<MessagingDashboardStats>
> {
  const res = await getUserConversationsAction();
  if (!res.success) {
    return res;
  }

  const { userId, conversations } = res.data;

  const buyerConvs = conversations.filter((c) => c.buyer_id === userId);
  const sellerConvs = conversations.filter((c) => c.seller_id === userId);

  const buyerUnreadCount = buyerConvs.reduce((acc, c) => acc + c.unreadCount, 0);
  const sellerUnreadCount = sellerConvs.reduce((acc, c) => acc + c.unreadCount, 0);

  return {
    success: true,
    data: {
      buyerConversationCount: buyerConvs.length,
      buyerUnreadCount,
      sellerInquiryCount: sellerConvs.length,
      sellerUnreadCount,
      totalUnreadCount: buyerUnreadCount + sellerUnreadCount,
      recentBuyerConversations: buyerConvs.slice(0, 5),
      recentSellerInquiries: sellerConvs.slice(0, 5),
    },
  };
}
