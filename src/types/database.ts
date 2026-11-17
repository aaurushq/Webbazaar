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

export interface Database {
  public: {
    Tables: {
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
    };
  };
}
