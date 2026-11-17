export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRoleType = 'BUYER' | 'SELLER_APPLICANT' | 'VERIFIED_SELLER' | 'ADMIN';

export type SellerApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type SellerType = 'individual' | 'developer' | 'agency' | 'business';

export type ListingStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
export type ListingType = 'READY_WEBSITE' | 'TEMPLATE' | 'BUSINESS' | 'SERVICE';
export type MediaType = 'image' | 'video' | 'screenshot';

export interface Database {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          seller_id: string;
          category_id: string;
          listing_type: ListingType;
          title: string;
          slug: string;
          short_description: string;
          full_description: string;
          price_inr: number;
          currency: string;
          status: ListingStatus;
          featured_image_path: string | null;
          demo_url: string | null;
          rejection_reason: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          category_id: string;
          listing_type: ListingType;
          title: string;
          slug: string;
          short_description: string;
          full_description: string;
          price_inr: number;
          currency?: string;
          status?: ListingStatus;
          featured_image_path?: string | null;
          demo_url?: string | null;
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          category_id?: string;
          listing_type?: ListingType;
          title?: string;
          slug?: string;
          short_description?: string;
          full_description?: string;
          price_inr?: number;
          currency?: string;
          status?: ListingStatus;
          featured_image_path?: string | null;
          demo_url?: string | null;
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      listing_media: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string;
          media_type: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          storage_path: string;
          media_type?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          storage_path?: string;
          media_type?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      listing_files: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          storage_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          storage_path?: string;
          file_name?: string;
          file_size?: number;
          mime_type?: string;
          created_at?: string;
        };
      };
      ready_website_details: {
        Row: {
          listing_id: string;
          website_category: string | null;
          tech_stack: string[] | null;
          key_features: string[] | null;
          is_responsive: boolean | null;
          installation_requirements: string | null;
          included_pages: string | null;
          demo_url: string | null;
          delivery_method: string | null;
          license_type: string | null;
        };
        Insert: {
          listing_id: string;
          website_category?: string | null;
          tech_stack?: string[] | null;
          key_features?: string[] | null;
          is_responsive?: boolean | null;
          installation_requirements?: string | null;
          included_pages?: string | null;
          demo_url?: string | null;
          delivery_method?: string | null;
          license_type?: string | null;
        };
        Update: {
          listing_id?: string;
          website_category?: string | null;
          tech_stack?: string[] | null;
          key_features?: string[] | null;
          is_responsive?: boolean | null;
          installation_requirements?: string | null;
          included_pages?: string | null;
          demo_url?: string | null;
          delivery_method?: string | null;
          license_type?: string | null;
        };
      };
      template_details: {
        Row: {
          listing_id: string;
          framework: string | null;
          programming_language: string | null;
          compatible_versions: string | null;
          included_files: string | null;
          has_documentation: boolean | null;
          license_type: string | null;
          installation_instructions: string | null;
          support_duration_days: number | null;
        };
        Insert: {
          listing_id: string;
          framework?: string | null;
          programming_language?: string | null;
          compatible_versions?: string | null;
          included_files?: string | null;
          has_documentation?: boolean | null;
          license_type?: string | null;
          installation_instructions?: string | null;
          support_duration_days?: number | null;
        };
        Update: {
          listing_id?: string;
          framework?: string | null;
          programming_language?: string | null;
          compatible_versions?: string | null;
          included_files?: string | null;
          has_documentation?: boolean | null;
          license_type?: string | null;
          installation_instructions?: string | null;
          support_duration_days?: number | null;
        };
      };
      business_details: {
        Row: {
          listing_id: string;
          business_model: string | null;
          asking_price_inr: number | null;
          industry: string | null;
          operating_history_months: number | null;
          monthly_revenue_inr: number | null;
          monthly_profit_inr: number | null;
          monthly_traffic: number | null;
          monetization_methods: string | null;
          included_assets: string | null;
          reason_for_sale: string | null;
          is_financials_verified: boolean | null;
          confidential_notes: string | null;
        };
        Insert: {
          listing_id: string;
          business_model?: string | null;
          asking_price_inr?: number | null;
          industry?: string | null;
          operating_history_months?: number | null;
          monthly_revenue_inr?: number | null;
          monthly_profit_inr?: number | null;
          monthly_traffic?: number | null;
          monetization_methods?: string | null;
          included_assets?: string | null;
          reason_for_sale?: string | null;
          is_financials_verified?: boolean | null;
          confidential_notes?: string | null;
        };
        Update: {
          listing_id?: string;
          business_model?: string | null;
          asking_price_inr?: number | null;
          industry?: string | null;
          operating_history_months?: number | null;
          monthly_revenue_inr?: number | null;
          monthly_profit_inr?: number | null;
          monthly_traffic?: number | null;
          monetization_methods?: string | null;
          included_assets?: string | null;
          reason_for_sale?: string | null;
          is_financials_verified?: boolean | null;
          confidential_notes?: string | null;
        };
      };
      service_details: {
        Row: {
          listing_id: string;
          service_category: string | null;
          deliverables: string | null;
          starting_price_inr: number | null;
          estimated_delivery_days: number | null;
          revision_policy: string | null;
          supported_technologies: string | null;
          buyer_requirements: string | null;
        };
        Insert: {
          listing_id: string;
          service_category?: string | null;
          deliverables?: string | null;
          starting_price_inr?: number | null;
          estimated_delivery_days?: number | null;
          revision_policy?: string | null;
          supported_technologies?: string | null;
          buyer_requirements?: string | null;
        };
        Update: {
          listing_id?: string;
          service_category?: string | null;
          deliverables?: string | null;
          starting_price_inr?: number | null;
          estimated_delivery_days?: number | null;
          revision_policy?: string | null;
          supported_technologies?: string | null;
          buyer_requirements?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_path: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_path?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_path?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRoleType;
          granted_at: string;
          granted_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: UserRoleType;
          granted_at?: string;
          granted_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: UserRoleType;
          granted_at?: string;
          granted_by?: string | null;
        };
      };
      seller_applications: {
        Row: {
          id: string;
          user_id: string;
          store_name: string;
          seller_type: SellerType;
          portfolio_url: string;
          professional_bio: string;
          product_categories: string[];
          country: string;
          contact_email: string;
          terms_agreed: boolean;
          status: SellerApplicationStatus;
          rejection_reason: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_name: string;
          seller_type: SellerType;
          portfolio_url: string;
          professional_bio: string;
          product_categories?: string[];
          country?: string;
          contact_email: string;
          terms_agreed: boolean;
          status?: SellerApplicationStatus;
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          store_name?: string;
          seller_type?: SellerType;
          portfolio_url?: string;
          professional_bio?: string;
          product_categories?: string[];
          country?: string;
          contact_email?: string;
          terms_agreed?: boolean;
          status?: SellerApplicationStatus;
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      seller_profiles: {
        Row: {
          id: string;
          user_id: string;
          store_name: string;
          handle: string;
          seller_type: SellerType;
          bio: string | null;
          portfolio_url: string | null;
          country: string;
          is_verified: boolean;
          status: 'active' | 'suspended' | 'archived';
          application_id: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_name: string;
          handle: string;
          seller_type: SellerType;
          bio?: string | null;
          portfolio_url?: string | null;
          country?: string;
          is_verified?: boolean;
          status?: 'active' | 'suspended' | 'archived';
          application_id?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          store_name?: string;
          handle?: string;
          seller_type?: SellerType;
          bio?: string | null;
          portfolio_url?: string | null;
          country?: string;
          is_verified?: boolean;
          status?: 'active' | 'suspended' | 'archived';
          application_id?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      seller_verification_events: {
        Row: {
          id: string;
          seller_id: string | null;
          application_id: string;
          event_type: string;
          actor_id: string | null;
          notes: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id?: string | null;
          application_id: string;
          event_type: string;
          actor_id?: string | null;
          notes?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string | null;
          application_id?: string;
          event_type?: string;
          actor_id?: string | null;
          notes?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string;
          target_id: string;
          details: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_type: string;
          target_id: string;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          target_type?: string;
          target_id?: string;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      has_role: {
        Args: { check_user_id: string; check_role: string };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      admin_process_seller_application: {
        Args: {
          target_app_id: string;
          new_status: string;
          admin_reason?: string;
        };
        Returns: Json;
      };
      seller_submit_listing_for_review: {
        Args: {
          p_listing_id: string;
        };
        Returns: Json;
      };
      admin_moderate_listing: {
        Args: {
          p_listing_id: string;
          p_action: string;
          p_reason?: string;
        };
        Returns: Json;
      };
    };
  };
}
