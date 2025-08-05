export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
          recipient_email: string
          recipient_name: string
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
          recipient_email: string
          recipient_name: string
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
          recipient_email?: string
          recipient_name?: string
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
      leads: {
        Row: {
          city: string
          created_at: string
          email: string
          how_heard: string
          id: string
          name: string
          state: string
        }
        Insert: {
          city: string
          created_at?: string
          email: string
          how_heard: string
          id?: string
          name: string
          state: string
        }
        Update: {
          city?: string
          created_at?: string
          email?: string
          how_heard?: string
          id?: string
          name?: string
          state?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_number: string | null
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          updated_at: string
          user_id: string | null
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
          updated_at?: string
          user_id?: string | null
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
          updated_at?: string
          user_id?: string | null
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
      has_contributor_access: {
        Args: {
          target_user_id: string
          required_role: Database["public"]["Enums"]["contributor_role"]
        }
        Returns: boolean
      }
      update_user_storage_usage: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
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
      contributor_role: ["administrator", "contributor", "viewer"],
    },
  },
} as const
