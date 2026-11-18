"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Send,
  Search,
  ArrowLeft,
  ExternalLink,
  Check,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  Store,
  User,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import {
  getUserConversationsAction,
  getConversationThreadAction,
  sendMessageAction,
  markConversationReadAction,
} from "@/lib/messaging/actions";
import { MAX_MESSAGE_LENGTH } from "@/lib/messaging/schemas";
import type { ConversationSummary, MessageItem } from "@/lib/messaging/types";
import { cn, formatINR } from "@/lib/utils";

interface MessagingWorkspaceProps {
  activeConversationId?: string;
}

function formatMessageTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function formatSidebarTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const isSameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isSameDay) {
      return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

function getCounterpartyInfo(conv: ConversationSummary, currentUserId: string) {
  const isBuyer = conv.buyer_id === currentUserId;
  const counterparty = isBuyer ? conv.seller : conv.buyer;
  const roleLabel = isBuyer ? "Seller" : "Buyer";
  const displayName = counterparty?.display_name || (isBuyer ? "Listing Seller" : "Interested Buyer");
  return { isBuyer, counterparty, roleLabel, displayName };
}

export function MessagingWorkspace({ activeConversationId }: MessagingWorkspaceProps) {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<ConversationSummary[]>([]);
  const [sidebarState, setSidebarState] = React.useState<"loading" | "ready" | "error">("loading");
  const [sidebarError, setSidebarError] = React.useState<string | null>(null);

  const [roleFilter, setRoleFilter] = React.useState<"all" | "buying" | "selling">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Active thread state
  const [activeConversation, setActiveConversation] = React.useState<ConversationSummary | null>(null);
  const [messages, setMessages] = React.useState<MessageItem[]>([]);
  const [threadState, setThreadState] = React.useState<"idle" | "loading" | "ready" | "error">(
    activeConversationId ? "loading" : "idle"
  );
  const [threadError, setThreadError] = React.useState<string | null>(null);

  // Composer state
  const [draftBody, setDraftBody] = React.useState("");
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);

  // Realtime connection status
  const [realtimeStatus, setRealtimeStatus] = React.useState<"connecting" | "connected" | "reconnecting">(
    "connecting"
  );

  const tempCounterRef = React.useRef(0);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const wasDisconnectedRef = React.useRef(false);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // Load sidebar conversations
  const loadConversations = React.useCallback(async (silent = false) => {
    if (!silent) {
      setSidebarState("loading");
      setSidebarError(null);
    }
    const res = await getUserConversationsAction();
    if (!res.success) {
      if (res.code === "UNAUTHENTICATED") {
        router.push("/login?next=/dashboard/messages");
        return;
      }
      setSidebarError(res.error);
      setSidebarState("error");
      return;
    }
    setCurrentUserId(res.data.userId);
    setConversations(
      res.data.conversations.map((c) =>
        c.id === activeConversationId ? { ...c, unreadCount: 0 } : c
      )
    );
    setSidebarState("ready");
  }, [router, activeConversationId]);

  // Load active conversation thread
  const loadThread = React.useCallback(
    async (convId: string, silent = false) => {
      if (!silent) {
        setThreadState("loading");
        setThreadError(null);
      }
      const res = await getConversationThreadAction(convId);
      if (!res.success) {
        if (res.code === "UNAUTHENTICATED") {
          router.push(`/login?next=/dashboard/messages/${convId}`);
          return;
        }
        setThreadError(res.error);
        setThreadState("error");
        setActiveConversation(null);
        setMessages([]);
        return;
      }

      setCurrentUserId(res.data.userId);
      setActiveConversation(res.data.conversation);
      setMessages(res.data.messages);
      setThreadState("ready");

      // Mark unread incoming messages as read cleanly
      if (res.data.conversation.unreadCount > 0) {
        markConversationReadAction(convId).then((markRes) => {
          if (markRes.success && markRes.data.updatedCount > 0) {
            setConversations((prev) =>
              prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
            );
            setActiveConversation((prev) => (prev ? { ...prev, unreadCount: 0 } : prev));
          }
        });
      }
    },
    [router]
  );

  React.useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  React.useEffect(() => {
    if (!activeConversationId) {
      setActiveConversation(null);
      setMessages([]);
      setThreadState("idle");
      setThreadError(null);
      return;
    }
    loadThread(activeConversationId);
  }, [activeConversationId, loadThread]);

  // Auto-scroll when messages arrive
  React.useEffect(() => {
    if (threadState === "ready" && messages.length > 0) {
      scrollToBottom("auto");
    }
  }, [threadState, messages.length, scrollToBottom]);

  // Supabase Realtime Subscription (Active Thread + Inbox Sync)
  React.useEffect(() => {
    if (!currentUserId) return;

    const supabase = createClient();
    let cancelled = false;
    let activeChannel: ReturnType<typeof supabase.channel> | null = null;

    const handleStatus = (status: string) => {
      if (cancelled) return;
      if (status === "SUBSCRIBED") {
        setRealtimeStatus("connected");
        if (wasDisconnectedRef.current) {
          wasDisconnectedRef.current = false;
          loadConversations(true);
          if (activeConversationId) {
            loadThread(activeConversationId, true);
          }
        }
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        wasDisconnectedRef.current = true;
        setRealtimeStatus("reconnecting");
      }
    };

    const connectRealtime = async () => {
      // Explicitly bind authenticated user JWT to Realtime WebSocket before subscribing
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }

      // 1. User-wide inbox channel (RLS guarantees only participant rows are delivered)
      const inboxChannel = supabase
        .channel(`wb-inbox-${currentUserId}-${activeConversationId || "all"}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "conversations",
          },
          () => {
            loadConversations(true);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "conversations",
          },
          (payload) => {
            const updated = payload.new as { id?: string; updated_at?: string; status?: string };
            if (!updated?.id) return;
            setConversations((prev) => {
              const exists = prev.some((c) => c.id === updated.id);
              if (!exists) {
                loadConversations(true);
                return prev;
              }
              const next = prev.map((c) =>
                c.id === updated.id
                  ? {
                      ...c,
                      updated_at: updated.updated_at || c.updated_at,
                      status: (updated.status as ConversationSummary["status"]) || c.status,
                    }
                  : c
              );
              return next.sort(
                (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            const incoming = payload.new as MessageItem;
            if (!incoming?.id || !incoming?.conversation_id) return;

            const isCurrentThread = incoming.conversation_id === activeConversationId;

            // Update active message list with strict deduplication
            if (isCurrentThread) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === incoming.id)) {
                  return prev;
                }
                // Replace matching optimistic message from current user if present
                if (incoming.sender_id === currentUserId) {
                  const optIdx = prev.findIndex(
                    (m) => m.optimistic && m.sender_id === currentUserId && m.body === incoming.body
                  );
                  if (optIdx !== -1) {
                    const copy = [...prev];
                    copy[optIdx] = incoming;
                    return copy;
                  }
                }
                return [...prev, incoming];
              });

              if (incoming.sender_id !== currentUserId) {
                markConversationReadAction(incoming.conversation_id);
              }
            }

            // Update sidebar summary & unread badge in real time
            setConversations((prev) => {
              const exists = prev.some((c) => c.id === incoming.conversation_id);
              if (!exists) {
                loadConversations(true);
                return prev;
              }
              const updatedList = prev.map((c) => {
                if (c.id !== incoming.conversation_id) return c;
                const shouldIncrementUnread =
                  incoming.sender_id !== currentUserId && !isCurrentThread;
                return {
                  ...c,
                  updated_at: incoming.created_at,
                  lastMessage: {
                    id: incoming.id,
                    body: incoming.body,
                    sender_id: incoming.sender_id,
                    created_at: incoming.created_at,
                    read_at: incoming.read_at,
                  },
                  unreadCount: shouldIncrementUnread
                    ? c.unreadCount + 1
                    : isCurrentThread
                    ? 0
                    : c.unreadCount,
                };
              });
              return updatedList.sort(
                (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            const updatedMsg = payload.new as MessageItem;
            if (!updatedMsg?.id) return;

            if (updatedMsg.conversation_id === activeConversationId) {
              setMessages((prev) =>
                prev.map((m) => (m.id === updatedMsg.id ? { ...m, read_at: updatedMsg.read_at } : m))
              );
            }

            setConversations((prev) =>
              prev.map((c) => {
                if (c.id !== updatedMsg.conversation_id) return c;
                const nextLast =
                  c.lastMessage && c.lastMessage.id === updatedMsg.id
                    ? { ...c.lastMessage, read_at: updatedMsg.read_at }
                    : c.lastMessage;
                return { ...c, lastMessage: nextLast };
              })
            );
          }
        )
        .subscribe(handleStatus);

      activeChannel = inboxChannel;
    };

    connectRealtime();

    return () => {
      cancelled = true;
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, [currentUserId, activeConversationId, loadConversations, loadThread]);

  // Optimistic message send with error rollback
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversationId || !currentUserId || isSending) return;

    const trimmed = draftBody.trim();
    if (!trimmed) {
      setSendError("Please type a message before sending.");
      return;
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setSendError(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    setSendError(null);
    setIsSending(true);
    setDraftBody("");

    tempCounterRef.current += 1;
    const tempId = `optimistic-${tempCounterRef.current}`;
    const optimisticCreatedAt = new Date().toISOString();

    const optimisticMsg: MessageItem = {
      id: tempId,
      clientTempId: tempId,
      conversation_id: activeConversationId,
      sender_id: currentUserId,
      body: trimmed,
      created_at: optimisticCreatedAt,
      read_at: null,
      optimistic: true,
    };

    // Optimistically insert into thread
    setMessages((prev) => [...prev, optimisticMsg]);

    const res = await sendMessageAction({
      conversationId: activeConversationId,
      body: trimmed,
    });

    if (!res.success) {
      // Roll back optimistic bubble cleanly and restore user's draft
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraftBody(trimmed);
      setSendError(res.error);
      setIsSending(false);
      return;
    }

    const persisted = res.data.message;

    // Replace optimistic item with persisted record (deduplicating against Realtime event)
    setMessages((prev) => {
      const hasPersistedAlready = prev.some((m) => m.id === persisted.id);
      if (hasPersistedAlready) {
        return prev.filter((m) => m.id !== tempId);
      }
      return prev.map((m) => (m.id === tempId ? persisted : m));
    });

    // Update sidebar last message preview
    setConversations((prev) =>
      prev
        .map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                updated_at: persisted.created_at,
                lastMessage: {
                  id: persisted.id,
                  body: persisted.body,
                  sender_id: persisted.sender_id,
                  created_at: persisted.created_at,
                  read_at: persisted.read_at,
                },
              }
            : c
        )
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    );

    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filtered sidebar conversations
  const filteredConversations = React.useMemo(() => {
    return conversations.filter((conv) => {
      if (currentUserId) {
        if (roleFilter === "buying" && conv.buyer_id !== currentUserId) return false;
        if (roleFilter === "selling" && conv.seller_id !== currentUserId) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const listingTitle = conv.listing?.title?.toLowerCase() || "";
        const buyerName = conv.buyer?.display_name?.toLowerCase() || "";
        const sellerName = conv.seller?.display_name?.toLowerCase() || "";
        const snippet = conv.lastMessage?.body?.toLowerCase() || "";
        return (
          listingTitle.includes(q) ||
          buyerName.includes(q) ||
          sellerName.includes(q) ||
          snippet.includes(q)
        );
      }
      return true;
    });
  }, [conversations, currentUserId, roleFilter, searchQuery]);

  const totalUnread = React.useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
  );

  const buyingCount = React.useMemo(
    () => (currentUserId ? conversations.filter((c) => c.buyer_id === currentUserId).length : 0),
    [conversations, currentUserId]
  );

  const sellingCount = React.useMemo(
    () => (currentUserId ? conversations.filter((c) => c.seller_id === currentUserId).length : 0),
    [conversations, currentUserId]
  );

  const showSidebarOnMobile = !activeConversationId;
  const showThreadOnMobile = Boolean(activeConversationId);

  return (
    <div className="bg-brand-canvas min-h-[calc(100vh-72px)] py-6 sm:py-8">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 flex flex-col gap-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Messages</h1>
              {totalUnread > 0 && (
                <span
                  data-testid="messages-total-unread"
                  className="rounded-full bg-brand-primary px-2.5 py-0.5 text-xs font-semibold text-white tabular-nums"
                >
                  {totalUnread} unread
                </span>
              )}
            </div>
            <p className="text-sm text-[#58607D]">
              Direct real-time conversations with WebBazaar buyers and sellers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              data-testid="realtime-connection-badge"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                realtimeStatus === "connected"
                  ? "border-[#D7D3FE] bg-white text-[#5146D6]"
                  : "border-brand-border bg-white text-[#646B88]"
              )}
            >
              {realtimeStatus === "connected" ? (
                <Wifi className="size-3.5 text-brand-primary" aria-hidden="true" />
              ) : (
                <WifiOff className="size-3.5 text-[#7A819E]" aria-hidden="true" />
              )}
              <span>
                {realtimeStatus === "connected"
                  ? "Realtime Connected"
                  : realtimeStatus === "reconnecting"
                  ? "Reconnecting..."
                  : "Connecting..."}
              </span>
            </div>

            <Button asChild variant="outline" size="sm" className="bg-white border-brand-border">
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        </div>

        {/* Main Split Messaging Card */}
        <Card className="overflow-hidden border-brand-border bg-white shadow-[0_14px_40px_-18px_rgba(16,21,43,0.12)] grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] h-[calc(100vh-13rem)] min-h-[540px] max-h-[780px]">
          {/* LEFT RAIL: CONVERSATION SIDEBAR */}
          <aside
            aria-label="Conversations list"
            className={cn(
              "min-h-0 flex-col border-r border-brand-border bg-white",
              showSidebarOnMobile ? "flex" : "hidden lg:flex"
            )}
          >
            {/* Sidebar Controls */}
            <div className="p-4 border-b border-brand-border flex flex-col gap-3 shrink-0">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#7A819E]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings or people..."
                  aria-label="Search conversations"
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-brand-border bg-brand-canvas text-sm text-brand-dark placeholder:text-[#8890AD] focus:bg-white focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15 transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-1 rounded-lg bg-brand-canvas p-1 border border-brand-border">
                {[
                  { id: "all", label: `All (${conversations.length})` },
                  { id: "buying", label: `Buying (${buyingCount})` },
                  { id: "selling", label: `Selling (${sellingCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRoleFilter(tab.id as "all" | "buying" | "selling")}
                    className={cn(
                      "rounded-md py-1.5 text-xs font-medium transition-colors tabular-nums",
                      roleFilter === tab.id
                        ? "bg-white text-brand-primary font-semibold shadow-xs"
                        : "text-[#58607D] hover:text-brand-dark"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar Scrollable List */}
            <div className="min-h-0 flex-1 overflow-auto">
              {sidebarState === "loading" && (
                <div role="status" aria-label="Loading conversations" className="p-4 flex flex-col gap-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-start gap-3 p-2">
                      <Skeleton className="size-10 rounded-xl shrink-0" />
                      <div className="flex-1 flex flex-col gap-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sidebarState === "error" && (
                <div role="alert" className="p-6 text-center flex flex-col items-center gap-3">
                  <AlertCircle className="size-6 text-red-500" aria-hidden="true" />
                  <p className="text-sm text-brand-dark font-medium">
                    {sidebarError || "Failed to load conversations."}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => loadConversations()}
                    className="gap-1.5"
                  >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    <span>Retry</span>
                  </Button>
                </div>
              )}

              {sidebarState === "ready" && filteredConversations.length === 0 && (
                <div className="p-8 text-center flex flex-col items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#F2F0FF] text-brand-primary">
                    <MessageSquare className="size-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-brand-dark">No conversations yet</p>
                    <p className="text-xs text-[#646B88] leading-relaxed">
                      {conversations.length === 0
                        ? "Visit any approved listing and click Contact Seller to start chatting."
                        : "No conversations match your current filter."}
                    </p>
                  </div>
                  {conversations.length === 0 ? (
                    <Button asChild size="sm" className="bg-brand-primary hover:bg-primary-700 text-white">
                      <Link href="/marketplace">Explore Listings</Link>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRoleFilter("all");
                        setSearchQuery("");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}

              {sidebarState === "ready" && filteredConversations.length > 0 && (
                <ul className="divide-y divide-[#F0F1FA]">
                  {filteredConversations.map((conv) => {
                    const isSelected = conv.id === activeConversationId;
                    const { roleLabel, displayName } = currentUserId
                      ? getCounterpartyInfo(conv, currentUserId)
                      : { roleLabel: "User", displayName: "Participant" };

                    return (
                      <li key={conv.id}>
                        <Link
                          href={`/dashboard/messages/${conv.id}`}
                          aria-current={isSelected ? "page" : undefined}
                          data-testid={`conversation-item-${conv.id}`}
                          className={cn(
                            "flex items-start gap-3 p-4 transition-colors",
                            isSelected
                              ? "bg-[#F4F3FF] border-l-2 border-l-brand-primary"
                              : "hover:bg-brand-canvas/80"
                          )}
                        >
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6257E8] to-[#9B5DE5] text-white font-semibold text-sm">
                            {displayName.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-brand-dark truncate">
                                {displayName}
                              </span>
                              <span className="text-xs text-[#7A819E] shrink-0 tabular-nums">
                                {formatSidebarTime(conv.lastMessage?.created_at || conv.updated_at)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="rounded bg-[#ECEAFE] px-1.5 py-0.5 text-xs font-medium text-[#5146D6] shrink-0">
                                {roleLabel}
                              </span>
                              <span className="text-xs text-[#58607D] truncate">
                                {conv.listing?.title || "Marketplace Listing"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <p
                                className={cn(
                                  "text-xs truncate",
                                  conv.unreadCount > 0
                                    ? "font-semibold text-brand-dark"
                                    : "text-[#6B7290]"
                                )}
                              >
                                {conv.lastMessage
                                  ? `${
                                      conv.lastMessage.sender_id === currentUserId ? "You: " : ""
                                    }${conv.lastMessage.body}`
                                  : "Conversation started — say hello"}
                              </p>
                              {conv.unreadCount > 0 && (
                                <span
                                  data-testid={`unread-badge-${conv.id}`}
                                  className="flex min-w-[20px] h-5 items-center justify-center rounded-full bg-brand-primary px-1.5 text-xs font-semibold text-white tabular-nums shrink-0"
                                >
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* RIGHT PANE: ACTIVE CONVERSATION THREAD */}
          <section
            aria-label="Conversation thread"
            className={cn(
              "min-h-0 min-w-0 flex-col bg-[#FAFBFD]",
              showThreadOnMobile ? "flex" : "hidden lg:flex"
            )}
          >
            {/* Empty / Unselected State */}
            {!activeConversationId && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F2F0FF] text-brand-primary">
                  <MessageSquare className="size-7" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-1 max-w-sm">
                  <h2 className="text-base font-semibold text-brand-dark">
                    Select a conversation
                  </h2>
                  <p className="text-sm text-[#58607D] leading-relaxed">
                    Choose a thread from the sidebar to read messages, discuss website customization, and coordinate delivery directly.
                  </p>
                </div>
              </div>
            )}

            {/* Loading Thread State */}
            {activeConversationId && threadState === "loading" && (
              <div role="status" aria-label="Loading conversation" className="flex-1 flex flex-col">
                <div className="p-4 border-b border-brand-border bg-white flex items-center gap-3">
                  <Skeleton className="size-11 rounded-xl" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col gap-4">
                  <Skeleton className="h-14 w-2/3 rounded-2xl" />
                  <Skeleton className="h-14 w-1/2 rounded-2xl self-end" />
                  <Skeleton className="h-14 w-3/5 rounded-2xl" />
                </div>
              </div>
            )}

            {/* Thread Error State (Unauthorized or Not Found) */}
            {activeConversationId && threadState === "error" && (
              <div
                role="alert"
                className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <AlertCircle className="size-6" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                  <h2 className="text-base font-semibold text-brand-dark">
                    Unable to open conversation
                  </h2>
                  <p className="text-sm text-[#58607D]">
                    {threadError || "This conversation could not be loaded or you do not have access."}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => loadThread(activeConversationId)}
                    className="gap-1.5"
                  >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    <span>Retry</span>
                  </Button>
                  <Button asChild size="sm" className="bg-brand-primary hover:bg-primary-700 text-white">
                    <Link href="/dashboard/messages">Back to Inbox</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Active Thread Ready */}
            {activeConversationId && threadState === "ready" && activeConversation && (
              <>
                {/* Product & Counterparty Header */}
                <div className="border-b border-brand-border bg-white px-4 py-3.5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link
                      href="/dashboard/messages"
                      aria-label="Back to conversations list"
                      className="lg:hidden flex size-9 items-center justify-center rounded-lg border border-brand-border text-brand-dark hover:bg-brand-canvas shrink-0 transition-colors"
                    >
                      <ArrowLeft className="size-4" aria-hidden="true" />
                    </Link>

                    {/* Listing Thumbnail or Brand Monogram */}
                    <div className="relative size-11 rounded-xl overflow-hidden border border-brand-border bg-brand-canvas shrink-0 flex items-center justify-center">
                      {activeConversation.listing?.featured_image_path ? (
                        <Image
                          src={activeConversation.listing.featured_image_path}
                          alt={activeConversation.listing.title}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <Globe className="size-5 text-brand-primary" aria-hidden="true" />
                      )}
                    </div>

                    <div className="min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <h2 className="text-sm font-bold text-brand-dark truncate">
                          {activeConversation.listing?.title || "Marketplace Listing"}
                        </h2>
                        {activeConversation.listing && (
                          <span className="text-xs font-bold text-brand-primary shrink-0 tabular-nums">
                            {formatINR(Number(activeConversation.listing.price_inr))}
                          </span>
                        )}
                      </div>

                      {currentUserId && (() => {
                        const { isBuyer, displayName, roleLabel } = getCounterpartyInfo(
                          activeConversation,
                          currentUserId
                        );
                        return (
                          <div className="flex items-center gap-2 text-xs text-[#58607D]">
                            {isBuyer ? (
                              <Store className="size-3.5 text-brand-primary shrink-0" aria-hidden="true" />
                            ) : (
                              <User className="size-3.5 text-brand-primary shrink-0" aria-hidden="true" />
                            )}
                            <span className="truncate">
                              Chatting with <strong className="text-brand-dark">{displayName}</strong> ({roleLabel})
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {activeConversation.listing && (
                    <div className="flex items-center gap-2 shrink-0">
                      {activeConversation.listing.demo_url && (
                        <a
                          href={activeConversation.listing.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-brand-border bg-white px-3 text-xs font-medium text-[#4B526E] hover:text-brand-primary hover:border-[#C5C0FA] transition-colors"
                        >
                          <ExternalLink className="size-3.5" aria-hidden="true" />
                          <span>Live Demo</span>
                        </a>
                      )}
                      <Button asChild size="sm" variant="outline" className="border-brand-border">
                        <Link href={`/listings/${activeConversation.listing.slug}`}>
                          View Listing
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Scrollable Message Timeline (parent-owned scroll chain) */}
                <div
                  data-testid="messages-timeline"
                  className="min-h-0 flex-1 overflow-auto px-4 py-5 sm:px-6 flex flex-col gap-3"
                >
                  {/* Honest Direct Collaboration Notice */}
                  <div className="mx-auto max-w-lg rounded-xl border border-brand-border bg-white px-4 py-2.5 text-center text-xs text-[#58607D]">
                    Discuss demo access, customization scope, and delivery terms directly here. WebBazaar does not process payments inside chat.
                  </div>

                  {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-center gap-2">
                      <p className="text-sm font-semibold text-brand-dark">
                        Start the conversation
                      </p>
                      <p className="text-xs text-[#646B88] max-w-xs">
                        Ask about tech stack details, demo credentials, customization options, or delivery timeline.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.sender_id === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          data-testid={isMine ? "message-bubble-mine" : "message-bubble-theirs"}
                          className={cn(
                            "flex flex-col max-w-[82%] sm:max-w-[70%] gap-1",
                            isMine ? "self-end items-end" : "self-start items-start"
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
                              isMine
                                ? "bg-brand-primary text-white rounded-br-sm"
                                : "bg-white text-brand-dark border border-brand-border rounded-bl-sm shadow-[0_2px_8px_-4px_rgba(16,21,43,0.08)]",
                              msg.optimistic && "opacity-75"
                            )}
                          >
                            {msg.body}
                          </div>

                          <div className="flex items-center gap-1.5 px-1 text-xs text-[#7A819E] tabular-nums">
                            <span>{formatMessageTime(msg.created_at)}</span>
                            {isMine && (
                              <span className="inline-flex items-center gap-0.5">
                                {msg.optimistic ? (
                                  <>
                                    <Clock className="size-3" aria-hidden="true" />
                                    <span>Sending</span>
                                  </>
                                ) : msg.read_at ? (
                                  <>
                                    <CheckCheck className="size-3.5 text-brand-primary" aria-hidden="true" />
                                    <span>Read</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="size-3.5" aria-hidden="true" />
                                    <span>Sent</span>
                                  </>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Sticky Message Composer */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-brand-border bg-white p-3.5 sm:px-6 sm:py-4 flex flex-col gap-2 shrink-0"
                >
                  {sendError && (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2"
                    >
                      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                      <span>{sendError}</span>
                    </div>
                  )}

                  <div className="flex items-end gap-2.5">
                    <div className="flex-1 min-w-0">
                      <textarea
                        data-testid="message-composer-input"
                        rows={2}
                        value={draftBody}
                        onChange={(e) => {
                          setDraftBody(e.target.value);
                          if (sendError) setSendError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        maxLength={MAX_MESSAGE_LENGTH}
                        placeholder="Write a message... (Enter to send, Shift+Enter for new line)"
                        aria-label="Message body"
                        disabled={activeConversation.status !== "active"}
                        className="w-full resize-none rounded-xl border border-brand-border bg-brand-canvas px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-[#8890AD] focus:bg-white focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15 transition-colors disabled:opacity-60"
                      />
                    </div>
                    <Button
                      data-testid="message-composer-send"
                      type="submit"
                      disabled={isSending || draftBody.trim().length === 0 || activeConversation.status !== "active"}
                      className="bg-brand-primary hover:bg-primary-700 text-white font-semibold gap-1.5 shrink-0"
                    >
                      <Send className="size-4" aria-hidden="true" />
                      <span>Send</span>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#7A819E]">
                    <span>Messages are private between buyer and seller.</span>
                    <span className="tabular-nums">
                      {draftBody.length} / {MAX_MESSAGE_LENGTH}
                    </span>
                  </div>
                </form>
              </>
            )}
          </section>
        </Card>
      </div>
    </div>
  );
}
