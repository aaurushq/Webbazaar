export type ConversationStatus = "active" | "archived" | "closed";

export interface ConversationListingInfo {
  id: string;
  title: string;
  slug: string;
  price_inr: number;
  listing_type: string;
  category_id: string;
  featured_image_path: string | null;
  demo_url: string | null;
  status: string;
}

export interface ConversationParticipantInfo {
  id: string;
  display_name: string | null;
  avatar_path: string | null;
}

export interface MessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  // Client-only optimistic flags
  optimistic?: boolean;
  failed?: boolean;
  clientTempId?: string;
}

export interface ConversationSummary {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
  listing: ConversationListingInfo | null;
  buyer: ConversationParticipantInfo | null;
  seller: ConversationParticipantInfo | null;
  lastMessage: {
    id: string;
    body: string;
    sender_id: string;
    created_at: string;
    read_at: string | null;
  } | null;
  unreadCount: number;
}

export interface MessagingDashboardStats {
  buyerConversationCount: number;
  buyerUnreadCount: number;
  sellerInquiryCount: number;
  sellerUnreadCount: number;
  totalUnreadCount: number;
  recentBuyerConversations: ConversationSummary[];
  recentSellerInquiries: ConversationSummary[];
}
