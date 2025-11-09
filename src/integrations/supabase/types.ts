export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          done: boolean | null
          due_at: string | null
          id: string
          summary: string | null
          type: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          done?: boolean | null
          due_at?: string | null
          id?: string
          summary?: string | null
          type: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          done?: boolean | null
          due_at?: string | null
          id?: string
          summary?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          lifecycle: string | null
          owner_id: string | null
          phone: string | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          lifecycle?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          lifecycle?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contributors: {
        Row: {
          accepted_at: string | null
          account_owner_id: string
          contributor_email: string
          contributor_user_id: string | null
          created_at: string
          id: string
          invited_at: string
          role: Database["public"]["Enums"]["contributor_role"]
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          account_owner_id: string
          contributor_email: string
          contributor_user_id?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          role?: Database["public"]["Enums"]["contributor_role"]
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          account_owner_id?: string
          contributor_email?: string
          contributor_user_id?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          role?: Database["public"]["Enums"]["contributor_role"]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          close_date: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          owner_id: string | null
          stage: string
          title: string
          value_cents: number | null
        }
        Insert: {
          close_date?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          owner_id?: string | null
          stage?: string
          title: string
          value_cents?: number | null
        }
        Update: {
          close_date?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          owner_id?: string | null
          stage?: string
          title?: string
          value_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          anon_id: string | null
          event: string
          id: number
          ip: unknown
          occurred_at: string | null
          path: string | null
          props: Json | null
          referrer: string | null
          ua: string | null
          user_id: string | null
          utm: Json | null
        }
        Insert: {
          anon_id?: string | null
          event: string
          id?: number
          ip?: unknown
          occurred_at?: string | null
          path?: string | null
          props?: Json | null
          referrer?: string | null
          ua?: string | null
          user_id?: string | null
          utm?: Json | null
        }
        Update: {
          anon_id?: string | null
          event?: string
          id?: number
          ip?: unknown
          occurred_at?: string | null
          path?: string | null
          props?: Json | null
          referrer?: string | null
          ua?: string | null
          user_id?: string | null
          utm?: Json | null
        }
        Relationships: []
      }
      gift_claim_attempts: {
        Row: {
          attempted_at: string | null
          attempted_email: string
          gift_code: string
          id: string
          ip_address: unknown
          success: boolean | null
        }
        Insert: {
          attempted_at?: string | null
          attempted_email: string
          gift_code: string
          id?: string
          ip_address?: unknown
          success?: boolean | null
        }
        Update: {
          attempted_at?: string | null
          attempted_email?: string
          gift_code?: string
          id?: string
          ip_address?: unknown
          success?: boolean | null
        }
        Relationships: []
      }
      gift_subscriptions: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          delivery_date: string
          first_login_at: string | null
          gift_code: string
          gift_message: string | null
          id: string
          plan_type: string
          purchaser_email: string
          purchaser_name: string
          purchaser_phone: string | null
          purchaser_user_id: string | null
          recipient_email: string
          recipient_name: string
          recipient_user_id: string | null
          redeemed: boolean | null
          redeemed_at: string | null
          redeemed_by_user_id: string | null
          reminder_email_sent: boolean | null
          reminder_email_sent_at: string | null
          status: string
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          delivery_date: string
          first_login_at?: string | null
          gift_code: string
          gift_message?: string | null
          id?: string
          plan_type: string
          purchaser_email: string
          purchaser_name: string
          purchaser_phone?: string | null
          purchaser_user_id?: string | null
          recipient_email: string
          recipient_name: string
          recipient_user_id?: string | null
          redeemed?: boolean | null
          redeemed_at?: string | null
          redeemed_by_user_id?: string | null
          reminder_email_sent?: boolean | null
          reminder_email_sent_at?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          delivery_date?: string
          first_login_at?: string | null
          gift_code?: string
          gift_message?: string | null
          id?: string
          plan_type?: string
          purchaser_email?: string
          purchaser_name?: string
          purchaser_phone?: string | null
          purchaser_user_id?: string | null
          recipient_email?: string
          recipient_name?: string
          recipient_user_id?: string | null
          redeemed?: boolean | null
          redeemed_at?: string | null
          redeemed_by_user_id?: string | null
          reminder_email_sent?: boolean | null
          reminder_email_sent_at?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          ai_generated: boolean | null
          brand: string | null
          category: string | null
          condition: string | null
          confidence: number | null
          created_at: string
          description: string | null
          estimated_value: number | null
          id: string
          is_manual_entry: boolean | null
          item_type: string | null
          location: string | null
          model: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          property_id: string | null
          property_upgrade: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          brand?: string | null
          category?: string | null
          condition?: string | null
          confidence?: number | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          id?: string
          is_manual_entry?: boolean | null
          item_type?: string | null
          location?: string | null
          model?: string | null
          name: string
          photo_path?: string | null
          photo_url?: string | null
          property_id?: string | null
          property_upgrade?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          brand?: string | null
          category?: string | null
          condition?: string | null
          confidence?: number | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          id?: string
          is_manual_entry?: boolean | null
          item_type?: string | null
          location?: string | null
          model?: string | null
          name?: string
          photo_path?: string | null
          photo_url?: string | null
          property_id?: string | null
          property_upgrade?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          city: string
          created_at: string
          email: string
          how_heard: string
          id: string
          ip_address: unknown
          name: string
          state: string
          submitted_at: string | null
          user_agent: string | null
        }
        Insert: {
          city: string
          created_at?: string
          email: string
          how_heard: string
          id?: string
          ip_address?: unknown
          name: string
          state: string
          submitted_at?: string | null
          user_agent?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          email?: string
          how_heard?: string
          id?: string
          ip_address?: unknown
          name?: string
          state?: string
          submitted_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      password_catalog: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          password: string
          updated_at: string
          user_id: string
          website_name: string
          website_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          password: string
          updated_at?: string
          user_id: string
          website_name: string
          website_url: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          password?: string
          updated_at?: string
          user_id?: string
          website_name?: string
          website_url?: string
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          customer_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          processed_at: string | null
          status: string | null
          stripe_event_id: string
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          processed_at?: string | null
          status?: string | null
          stripe_event_id: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          processed_at?: string | null
          status?: string | null
          stripe_event_id?: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_number: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_period_end: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          plan_id: string | null
          plan_status: string | null
          property_limit: number | null
          storage_quota_gb: number | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_period_end?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          plan_id?: string | null
          plan_status?: string | null
          property_limit?: number | null
          storage_quota_gb?: number | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_period_end?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          plan_id?: string | null
          plan_status?: string | null
          property_limit?: number | null
          storage_quota_gb?: number | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          created_at: string | null
          estimated_value: number | null
          id: string
          last_updated: string | null
          name: string
          square_footage: number | null
          type: string
          updated_at: string | null
          user_id: string
          year_built: number | null
        }
        Insert: {
          address: string
          created_at?: string | null
          estimated_value?: number | null
          id?: string
          last_updated?: string | null
          name: string
          square_footage?: number | null
          type: string
          updated_at?: string | null
          user_id: string
          year_built?: number | null
        }
        Update: {
          address?: string
          created_at?: string | null
          estimated_value?: number | null
          id?: string
          last_updated?: string | null
          name?: string
          square_footage?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
          year_built?: number | null
        }
        Relationships: []
      }
      property_files: {
        Row: {
          bucket_name: string
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          bucket_name: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          bucket_name?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_files_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          attempts: number | null
          created_at: string | null
          id: string
          identifier: string
          updated_at: string | null
          window_start: string
        }
        Insert: {
          action: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          identifier: string
          updated_at?: string | null
          window_start: string
        }
        Update: {
          action?: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          identifier?: string
          updated_at?: string | null
          window_start?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          created_at: string
          file_size: number | null
          id: string
          item_id: string
          merchant_name: string | null
          notes: string | null
          purchase_amount: number | null
          purchase_date: string | null
          receipt_name: string
          receipt_path: string
          receipt_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          id?: string
          item_id: string
          merchant_name?: string | null
          notes?: string | null
          purchase_amount?: number | null
          purchase_date?: string | null
          receipt_name: string
          receipt_path: string
          receipt_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          id?: string
          item_id?: string
          merchant_name?: string | null
          notes?: string | null
          purchase_amount?: number | null
          purchase_date?: string | null
          receipt_name?: string
          receipt_path?: string
          receipt_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_usage: {
        Row: {
          bucket_name: string
          created_at: string
          file_count: number
          id: string
          last_calculated_at: string
          total_size_bytes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket_name: string
          created_at?: string
          file_count?: number
          id?: string
          last_calculated_at?: string
          total_size_bytes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket_name?: string
          created_at?: string
          file_count?: number
          id?: string
          last_calculated_at?: string
          total_size_bytes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          last_payment_failure_check: string | null
          payment_failure_reminder_sent: boolean | null
          payment_failure_reminder_sent_at: string | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          trial_end: string | null
          trial_reminder_sent: boolean | null
          trial_reminder_sent_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_payment_failure_check?: string | null
          payment_failure_reminder_sent?: boolean | null
          payment_failure_reminder_sent_at?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          trial_reminder_sent?: boolean | null
          trial_reminder_sent_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_payment_failure_check?: string | null
          payment_failure_reminder_sent?: boolean | null
          payment_failure_reminder_sent_at?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          trial_reminder_sent?: boolean | null
          trial_reminder_sent_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          contact_id: string | null
          created_at: string | null
          id: string
          priority: string | null
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_storage_usage: {
        Args: { target_user_id: string }
        Returns: {
          bucket_name: string
          file_count: number
          total_size_bytes: number
        }[]
      }
      check_gift_claim_rate_limit: {
        Args: { p_email: string; p_gift_code: string; p_ip_address: unknown }
        Returns: Json
      }
      claim_gift_subscription: { Args: { p_gift_code: string }; Returns: Json }
      get_activation_funnel: {
        Args: never
        Returns: {
          activated: number
          activation_rate_pct: number
          signups: number
          wk: string
        }[]
      }
      get_at_risk_customers: {
        Args: never
        Returns: {
          email: string
          last_activity: string
          plan_id: string
        }[]
      }
      get_claimable_gift: {
        Args: { p_gift_code: string }
        Returns: {
          delivery_date: string
          gift_message: string
          id: string
          plan_type: string
          purchaser_name: string
          status: string
        }[]
      }
      get_claimable_gift_preview: {
        Args: { p_gift_code: string }
        Returns: {
          delivery_date: string
          has_gift: boolean
        }[]
      }
      get_leads_by_source: {
        Args: never
        Returns: {
          count: number
          source: string
        }[]
      }
      get_purchaser_gifts: {
        Args: never
        Returns: {
          amount: number
          created_at: string
          currency: string
          delivery_date: string
          gift_message: string
          id: string
          plan_type: string
          recipient_email: string
          recipient_name: string
          redeemed: boolean
          redeemed_at: string
          status: string
        }[]
      }
      get_recipient_gifts: {
        Args: never
        Returns: {
          amount: number
          created_at: string
          delivery_date: string
          gift_code: string
          gift_message: string
          id: string
          plan_type: string
          purchaser_name: string
          redeemed: boolean
          redeemed_at: string
          status: string
        }[]
      }
      has_any_app_role: {
        Args: {
          allowed_roles: Database["public"]["Enums"]["app_role"][]
          target_user_id: string
        }
        Returns: boolean
      }
      has_app_role: {
        Args: {
          required_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: boolean
      }
      has_contributor_access: {
        Args: {
          _required_role: Database["public"]["Enums"]["contributor_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_user_storage_usage: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      validate_service_role_context: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "sales" | "marketing" | "viewer"
      contributor_role: "administrator" | "contributor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "sales", "marketing", "viewer"],
      contributor_role: ["administrator", "contributor", "viewer"],
    },
  },
} as const
