export type CustomizationRequestStatus =
  | "submitted"
  | "discussing"
  | "quoted"
  | "cancelled"
  | "closed";

export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "declined"
  | "withdrawn"
  | "expired";

export interface QuoteRecord {
  id: string;
  customization_request_id: string;
  version: number;
  seller_id: string;
  buyer_id: string;
  base_product_price: number;
  customization_price: number;
  total_price: number;
  scope_of_work: string;
  estimated_delivery_days: number;
  revision_policy: string;
  payment_terms: string;
  status: QuoteStatus;
  accepted_at: string | null;
  created_at: string;
  expires_at: string;
}

export interface CustomizationRequestRecord {
  id: string;
  conversation_id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  title: string;
  requirements: string;
  requested_features: string[];
  optional_budget: number | null;
  desired_delivery_date: string | null;
  status: CustomizationRequestStatus;
  created_at: string;
  updated_at: string;
  quotes: QuoteRecord[];
  listing?: {
    id: string;
    title: string;
    slug: string;
    price_inr: number;
  } | null;
  buyer?: {
    id: string;
    display_name: string | null;
  } | null;
  seller?: {
    id: string;
    display_name: string | null;
  } | null;
}

export interface CustomizationDashboardStats {
  // Buyer counts
  myCustomizationRequestsCount: number;
  quotesReceivedCount: number;
  pendingDecisionsCount: number;
  recentBuyerRequests: CustomizationRequestRecord[];
  // Seller counts
  newCustomizationRequestsCount: number;
  quotesSentCount: number;
  acceptedQuotesCount: number;
  recentSellerRequests: CustomizationRequestRecord[];
}
