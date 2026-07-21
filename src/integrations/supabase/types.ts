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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_closure_requests: {
        Row: {
          account_id: string | null
          anonymized_at: string | null
          comments: string | null
          completed_at: string | null
          created_at: string
          current_period_end: string | null
          deleted_account_id: string | null
          deletion_scheduled_date: string | null
          email_hash: string | null
          id: string
          legal_hold: boolean
          legal_hold_applied_at: string | null
          legal_hold_applied_by: string | null
          legal_hold_reason: string | null
          legal_hold_released_at: string | null
          legal_hold_released_by: string | null
          owner_user_id: string | null
          reason: string | null
          request_date: string
          reversed_at: string | null
          status: string
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          anonymized_at?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string
          current_period_end?: string | null
          deleted_account_id?: string | null
          deletion_scheduled_date?: string | null
          email_hash?: string | null
          id?: string
          legal_hold?: boolean
          legal_hold_applied_at?: string | null
          legal_hold_applied_by?: string | null
          legal_hold_reason?: string | null
          legal_hold_released_at?: string | null
          legal_hold_released_by?: string | null
          owner_user_id?: string | null
          reason?: string | null
          request_date?: string
          reversed_at?: string | null
          status?: string
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          anonymized_at?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string
          current_period_end?: string | null
          deleted_account_id?: string | null
          deletion_scheduled_date?: string | null
          email_hash?: string | null
          id?: string
          legal_hold?: boolean
          legal_hold_applied_at?: string | null
          legal_hold_applied_by?: string | null
          legal_hold_reason?: string | null
          legal_hold_released_at?: string | null
          legal_hold_released_by?: string | null
          owner_user_id?: string | null
          reason?: string | null
          request_date?: string
          reversed_at?: string | null
          status?: string
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_closure_requests_deleted_account_id_fkey"
            columns: ["deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_continuity_requests: {
        Row: {
          account_id: string
          admin_notes: string | null
          assigned_reviewer_id: string | null
          completed_at: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          executed_at: string | null
          executed_by: string | null
          execution_status: string | null
          freeze_applied_at: string | null
          freeze_applied_by: string | null
          freeze_reason: string | null
          freeze_status: string | null
          freeze_type: string | null
          id: string
          legacy_admin_id: string | null
          metadata: Json | null
          notes: string | null
          owner_dispute_reason: string | null
          owner_dispute_status: string | null
          owner_disputed_at: string | null
          owner_last_active_at: string | null
          preservation_hold: boolean
          preservation_hold_applied_at: string | null
          preservation_hold_applied_by: string | null
          preservation_hold_reason: string | null
          priority: string
          reason: string
          request_type: string
          requested_by_user_id: string
          reviewed_at: string | null
          reviewed_by_admin_id: string | null
          risk_flags: Json
          risk_level: string
          scheduled_execution_at: string | null
          senior_approver_id: string | null
          snapshot_reference: string | null
          status: string
          transfer_preview_reviewed_at: string | null
          transfer_scope: string | null
          updated_at: string
          waiting_period_bypass_reason: string | null
          waiting_period_bypassed_at: string | null
          waiting_period_bypassed_by: string | null
          waiting_period_starts_at: string | null
        }
        Insert: {
          account_id: string
          admin_notes?: string | null
          assigned_reviewer_id?: string | null
          completed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          executed_at?: string | null
          executed_by?: string | null
          execution_status?: string | null
          freeze_applied_at?: string | null
          freeze_applied_by?: string | null
          freeze_reason?: string | null
          freeze_status?: string | null
          freeze_type?: string | null
          id?: string
          legacy_admin_id?: string | null
          metadata?: Json | null
          notes?: string | null
          owner_dispute_reason?: string | null
          owner_dispute_status?: string | null
          owner_disputed_at?: string | null
          owner_last_active_at?: string | null
          preservation_hold?: boolean
          preservation_hold_applied_at?: string | null
          preservation_hold_applied_by?: string | null
          preservation_hold_reason?: string | null
          priority?: string
          reason: string
          request_type: string
          requested_by_user_id: string
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          risk_flags?: Json
          risk_level?: string
          scheduled_execution_at?: string | null
          senior_approver_id?: string | null
          snapshot_reference?: string | null
          status?: string
          transfer_preview_reviewed_at?: string | null
          transfer_scope?: string | null
          updated_at?: string
          waiting_period_bypass_reason?: string | null
          waiting_period_bypassed_at?: string | null
          waiting_period_bypassed_by?: string | null
          waiting_period_starts_at?: string | null
        }
        Update: {
          account_id?: string
          admin_notes?: string | null
          assigned_reviewer_id?: string | null
          completed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          executed_at?: string | null
          executed_by?: string | null
          execution_status?: string | null
          freeze_applied_at?: string | null
          freeze_applied_by?: string | null
          freeze_reason?: string | null
          freeze_status?: string | null
          freeze_type?: string | null
          id?: string
          legacy_admin_id?: string | null
          metadata?: Json | null
          notes?: string | null
          owner_dispute_reason?: string | null
          owner_dispute_status?: string | null
          owner_disputed_at?: string | null
          owner_last_active_at?: string | null
          preservation_hold?: boolean
          preservation_hold_applied_at?: string | null
          preservation_hold_applied_by?: string | null
          preservation_hold_reason?: string | null
          priority?: string
          reason?: string
          request_type?: string
          requested_by_user_id?: string
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          risk_flags?: Json
          risk_level?: string
          scheduled_execution_at?: string | null
          senior_approver_id?: string | null
          snapshot_reference?: string | null
          status?: string
          transfer_preview_reviewed_at?: string | null
          transfer_scope?: string | null
          updated_at?: string
          waiting_period_bypass_reason?: string | null
          waiting_period_bypassed_at?: string | null
          waiting_period_bypassed_by?: string | null
          waiting_period_starts_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_continuity_requests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_continuity_requests_legacy_admin_id_fkey"
            columns: ["legacy_admin_id"]
            isOneToOne: false
            referencedRelation: "legacy_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      account_deletion_requests: {
        Row: {
          account_owner_id: string | null
          anonymized_at: string | null
          created_at: string
          deleted_account_id: string | null
          email_hash: string | null
          grace_period_days: number
          grace_period_ends_at: string
          id: string
          reason: string | null
          requested_at: string
          requester_user_id: string | null
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_owner_id?: string | null
          anonymized_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          email_hash?: string | null
          grace_period_days?: number
          grace_period_ends_at: string
          id?: string
          reason?: string | null
          requested_at?: string
          requester_user_id?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_owner_id?: string | null
          anonymized_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          email_hash?: string | null
          grace_period_days?: number
          grace_period_ends_at?: string
          id?: string
          reason?: string | null
          requested_at?: string
          requester_user_id?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_deletion_requests_deleted_account_id_fkey"
            columns: ["deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_export_audit: {
        Row: {
          account_id: string | null
          bundle_file_name: string | null
          bundle_sha256: string | null
          bundle_size_bytes: number | null
          completed_at: string | null
          created_at: string
          download_count: number
          download_limit: number
          error_message: string | null
          expires_at: string | null
          export_type: string
          file_count: number | null
          id: string
          last_downloaded_at: string | null
          metadata: Json
          signed_url_ttl_seconds: number | null
          started_at: string
          status: string
          storage_bucket: string
          storage_path: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          bundle_file_name?: string | null
          bundle_sha256?: string | null
          bundle_size_bytes?: number | null
          completed_at?: string | null
          created_at?: string
          download_count?: number
          download_limit?: number
          error_message?: string | null
          expires_at?: string | null
          export_type?: string
          file_count?: number | null
          id?: string
          last_downloaded_at?: string | null
          metadata?: Json
          signed_url_ttl_seconds?: number | null
          started_at?: string
          status?: string
          storage_bucket?: string
          storage_path?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          bundle_file_name?: string | null
          bundle_sha256?: string | null
          bundle_size_bytes?: number | null
          completed_at?: string | null
          created_at?: string
          download_count?: number
          download_limit?: number
          error_message?: string | null
          expires_at?: string | null
          export_type?: string
          file_count?: number | null
          id?: string
          last_downloaded_at?: string | null
          metadata?: Json
          signed_url_ttl_seconds?: number | null
          started_at?: string
          status?: string
          storage_bucket?: string
          storage_path?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      account_memberships: {
        Row: {
          accepted_at: string | null
          account_id: string
          created_at: string
          email: string | null
          id: string
          invited_by: string | null
          revoked_at: string | null
          role: Database["public"]["Enums"]["membership_role"]
          role_changed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          account_id: string
          created_at?: string
          email?: string | null
          id?: string
          invited_by?: string | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["membership_role"]
          role_changed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          account_id?: string
          created_at?: string
          email?: string | null
          id?: string
          invited_by?: string | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["membership_role"]
          role_changed_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_memberships_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_ownership_metadata: {
        Row: {
          account_id: string
          continuity_case_id: string | null
          continuity_setup_required: boolean
          created_at: string
          executed_by_admin_id: string | null
          new_owner_id: string | null
          ownership_origin: string | null
          previous_owner_id: string | null
          senior_approver_id: string | null
          snapshot_reference: string | null
          transfer_date: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          continuity_case_id?: string | null
          continuity_setup_required?: boolean
          created_at?: string
          executed_by_admin_id?: string | null
          new_owner_id?: string | null
          ownership_origin?: string | null
          previous_owner_id?: string | null
          senior_approver_id?: string | null
          snapshot_reference?: string | null
          transfer_date?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          continuity_case_id?: string | null
          continuity_setup_required?: boolean
          created_at?: string
          executed_by_admin_id?: string | null
          new_owner_id?: string | null
          ownership_origin?: string | null
          previous_owner_id?: string | null
          senior_approver_id?: string | null
          snapshot_reference?: string | null
          transfer_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      account_verification: {
        Row: {
          account_age_met: boolean
          created_at: string
          email_verified: boolean
          has_2fa: boolean
          has_contributors: boolean
          has_documents: boolean
          has_property: boolean
          has_recovery_delegate: boolean
          has_vault_data_and_passwords: boolean
          has_vault_encryption: boolean
          id: string
          is_verified: boolean
          is_verified_plus: boolean
          last_checked_at: string
          milestone_count: number
          profile_complete: boolean
          updated_at: string
          upload_count: number
          upload_count_met: boolean
          user_id: string
          verified_at: string | null
          verified_plus_at: string | null
        }
        Insert: {
          account_age_met?: boolean
          created_at?: string
          email_verified?: boolean
          has_2fa?: boolean
          has_contributors?: boolean
          has_documents?: boolean
          has_property?: boolean
          has_recovery_delegate?: boolean
          has_vault_data_and_passwords?: boolean
          has_vault_encryption?: boolean
          id?: string
          is_verified?: boolean
          is_verified_plus?: boolean
          last_checked_at?: string
          milestone_count?: number
          profile_complete?: boolean
          updated_at?: string
          upload_count?: number
          upload_count_met?: boolean
          user_id: string
          verified_at?: string | null
          verified_plus_at?: string | null
        }
        Update: {
          account_age_met?: boolean
          created_at?: string
          email_verified?: boolean
          has_2fa?: boolean
          has_contributors?: boolean
          has_documents?: boolean
          has_property?: boolean
          has_recovery_delegate?: boolean
          has_vault_data_and_passwords?: boolean
          has_vault_encryption?: boolean
          id?: string
          is_verified?: boolean
          is_verified_plus?: boolean
          last_checked_at?: string
          milestone_count?: number
          profile_complete?: boolean
          updated_at?: string
          upload_count?: number
          upload_count_met?: boolean
          user_id?: string
          verified_at?: string | null
          verified_plus_at?: string | null
        }
        Relationships: []
      }
      accounts: {
        Row: {
          account_freeze_status: string | null
          account_freeze_type: string | null
          account_name: string | null
          continuity_setup_required: boolean
          created_at: string
          id: string
          memorialized: boolean
          memorialized_at: string | null
          memorialized_by: string | null
          memorialized_reason: string | null
          owner_state: string
          owner_user_id: string
        }
        Insert: {
          account_freeze_status?: string | null
          account_freeze_type?: string | null
          account_name?: string | null
          continuity_setup_required?: boolean
          created_at?: string
          id?: string
          memorialized?: boolean
          memorialized_at?: string | null
          memorialized_by?: string | null
          memorialized_reason?: string | null
          owner_state?: string
          owner_user_id: string
        }
        Update: {
          account_freeze_status?: string | null
          account_freeze_type?: string | null
          account_name?: string | null
          continuity_setup_required?: boolean
          created_at?: string
          id?: string
          memorialized?: boolean
          memorialized_at?: string | null
          memorialized_by?: string | null
          memorialized_reason?: string | null
          owner_state?: string
          owner_user_id?: string
        }
        Relationships: []
      }
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
      admin_fulfillment_overrides: {
        Row: {
          admin_user_id: string
          created_at: string
          decision: string
          email_matched: boolean | null
          fulfillment_id: string | null
          id: string
          manual_review_reason_at_decision: string | null
          notes: string | null
          original_metadata_user_id: string | null
          outcome: string
          override_reason: string | null
          override_user_email: string | null
          override_user_id: string | null
          stripe_customer_id: string | null
          stripe_email: string | null
          stripe_session_id: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          decision: string
          email_matched?: boolean | null
          fulfillment_id?: string | null
          id?: string
          manual_review_reason_at_decision?: string | null
          notes?: string | null
          original_metadata_user_id?: string | null
          outcome: string
          override_reason?: string | null
          override_user_email?: string | null
          override_user_id?: string | null
          stripe_customer_id?: string | null
          stripe_email?: string | null
          stripe_session_id: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          decision?: string
          email_matched?: boolean | null
          fulfillment_id?: string | null
          id?: string
          manual_review_reason_at_decision?: string | null
          notes?: string | null
          original_metadata_user_id?: string | null
          outcome?: string
          override_reason?: string | null
          override_user_email?: string | null
          override_user_id?: string | null
          stripe_customer_id?: string | null
          stripe_email?: string | null
          stripe_session_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          anonymized_at: string | null
          created_at: string | null
          deleted_account_id: string | null
          email_hash: string | null
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
          anonymized_at?: string | null
          created_at?: string | null
          deleted_account_id?: string | null
          email_hash?: string | null
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
          anonymized_at?: string | null
          created_at?: string | null
          deleted_account_id?: string | null
          email_hash?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_deleted_account_id_fkey"
            columns: ["deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_codes: {
        Row: {
          code_hash: string
          code_hash_algo: string
          created_at: string
          expires_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          code_hash_algo?: string
          created_at?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          code_hash_algo?: string
          created_at?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendar_event_attachments: {
        Row: {
          created_at: string
          event_id: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_event_attachments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          category:
            | Database["public"]["Enums"]["calendar_event_category"]
            | null
          completed_at: string | null
          created_at: string
          end_date: string | null
          id: string
          is_dismissed: boolean
          is_suggested: boolean
          linked_asset_id: string | null
          linked_property_id: string | null
          notes: string | null
          notify_1_week: boolean
          notify_30_days: boolean
          notify_day_of: boolean
          recurrence: string
          recurrence_end_date: string | null
          start_date: string
          status: string
          template_key: string | null
          title: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          category?:
            | Database["public"]["Enums"]["calendar_event_category"]
            | null
          completed_at?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_dismissed?: boolean
          is_suggested?: boolean
          linked_asset_id?: string | null
          linked_property_id?: string | null
          notes?: string | null
          notify_1_week?: boolean
          notify_30_days?: boolean
          notify_day_of?: boolean
          recurrence?: string
          recurrence_end_date?: string | null
          start_date: string
          status?: string
          template_key?: string | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          category?:
            | Database["public"]["Enums"]["calendar_event_category"]
            | null
          completed_at?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_dismissed?: boolean
          is_suggested?: boolean
          linked_asset_id?: string | null
          linked_property_id?: string | null
          notes?: string | null
          notify_1_week?: boolean
          notify_30_days?: boolean
          notify_day_of?: boolean
          recurrence?: string
          recurrence_end_date?: string | null
          start_date?: string
          status?: string
          template_key?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_linked_asset_id_fkey"
            columns: ["linked_asset_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_linked_property_id_fkey"
            columns: ["linked_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_fulfillments: {
        Row: {
          anonymized_at: string | null
          completed_at: string | null
          created_at: string
          deleted_account_id: string | null
          email: string | null
          email_hash: string | null
          fulfillment_source: string | null
          id: string
          last_email_error: string | null
          magic_link_delivery_status: string | null
          magic_link_sent_at: string | null
          manual_review_reason: string | null
          manual_review_resolved_at: string | null
          manual_review_resolved_by: string | null
          metadata: Json | null
          plan_lookup_key: string | null
          processing_started_at: string | null
          status: string
          stripe_customer_id: string | null
          stripe_session_id: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          anonymized_at?: string | null
          completed_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          email?: string | null
          email_hash?: string | null
          fulfillment_source?: string | null
          id?: string
          last_email_error?: string | null
          magic_link_delivery_status?: string | null
          magic_link_sent_at?: string | null
          manual_review_reason?: string | null
          manual_review_resolved_at?: string | null
          manual_review_resolved_by?: string | null
          metadata?: Json | null
          plan_lookup_key?: string | null
          processing_started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          anonymized_at?: string | null
          completed_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          email?: string | null
          email_hash?: string | null
          fulfillment_source?: string | null
          id?: string
          last_email_error?: string | null
          magic_link_delivery_status?: string | null
          magic_link_sent_at?: string | null
          manual_review_reason?: string | null
          manual_review_resolved_at?: string | null
          manual_review_resolved_by?: string | null
          metadata?: Json | null
          plan_lookup_key?: string | null
          processing_started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_fulfillments_deleted_account_id_fkey"
            columns: ["deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_session_audit: {
        Row: {
          anonymized_at: string | null
          created_at: string
          deleted_account_id: string | null
          email: string | null
          email_hash: string | null
          error_message: string | null
          id: string
          ip: string | null
          lookup_key: string | null
          outcome: string | null
          stripe_session_id: string | null
          user_agent: string | null
        }
        Insert: {
          anonymized_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          email?: string | null
          email_hash?: string | null
          error_message?: string | null
          id?: string
          ip?: string | null
          lookup_key?: string | null
          outcome?: string | null
          stripe_session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          anonymized_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          email?: string | null
          email_hash?: string | null
          error_message?: string | null
          id?: string
          ip?: string | null
          lookup_key?: string | null
          outcome?: string | null
          stripe_session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_session_audit_deleted_account_id_fkey"
            columns: ["deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      closure_requests: {
        Row: {
          account_id: string
          approved_by_admin_id: string | null
          cancellation_reason: string | null
          completed_at: string | null
          created_at: string
          id: string
          request_id: string | null
          requested_by_user_id: string | null
          snapshot_reference: string | null
          status: string
          waiting_period_ends_at: string | null
          waiting_period_starts_at: string | null
        }
        Insert: {
          account_id: string
          approved_by_admin_id?: string | null
          cancellation_reason?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          request_id?: string | null
          requested_by_user_id?: string | null
          snapshot_reference?: string | null
          status?: string
          waiting_period_ends_at?: string | null
          waiting_period_starts_at?: string | null
        }
        Update: {
          account_id?: string
          approved_by_admin_id?: string | null
          cancellation_reason?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          request_id?: string | null
          requested_by_user_id?: string | null
          snapshot_reference?: string | null
          status?: string
          waiting_period_ends_at?: string | null
          waiting_period_starts_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "closure_requests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "closure_requests_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "account_continuity_requests"
            referencedColumns: ["id"]
          },
        ]
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
      continuity_account_freezes: {
        Row: {
          account_id: string
          applied_at: string
          applied_by: string
          freeze_type: string
          id: string
          reason: string
          removal_reason: string | null
          removed_at: string | null
          removed_by: string | null
          request_id: string | null
          status: string
        }
        Insert: {
          account_id: string
          applied_at?: string
          applied_by: string
          freeze_type: string
          id?: string
          reason: string
          removal_reason?: string | null
          removed_at?: string | null
          removed_by?: string | null
          request_id?: string | null
          status?: string
        }
        Update: {
          account_id?: string
          applied_at?: string
          applied_by?: string
          freeze_type?: string
          id?: string
          reason?: string
          removal_reason?: string | null
          removed_at?: string | null
          removed_by?: string | null
          request_id?: string | null
          status?: string
        }
        Relationships: []
      }
      continuity_account_snapshots: {
        Row: {
          account_id: string
          checksum: string | null
          created_at: string
          created_by_admin_id: string
          id: string
          included_assets: Json
          included_audit_history: Json
          included_documents: Json
          included_permissions: Json
          included_user_relationships: Json
          request_id: string
          snapshot_reference: string
          snapshot_type: string
          storage_location: string | null
        }
        Insert: {
          account_id: string
          checksum?: string | null
          created_at?: string
          created_by_admin_id: string
          id?: string
          included_assets?: Json
          included_audit_history?: Json
          included_documents?: Json
          included_permissions?: Json
          included_user_relationships?: Json
          request_id: string
          snapshot_reference: string
          snapshot_type?: string
          storage_location?: string | null
        }
        Update: {
          account_id?: string
          checksum?: string | null
          created_at?: string
          created_by_admin_id?: string
          id?: string
          included_assets?: Json
          included_audit_history?: Json
          included_documents?: Json
          included_permissions?: Json
          included_user_relationships?: Json
          request_id?: string
          snapshot_reference?: string
          snapshot_type?: string
          storage_location?: string | null
        }
        Relationships: []
      }
      continuity_archive_custodian_access: {
        Row: {
          account_id: string
          audit_log_reference: string | null
          can_delete: boolean
          can_download: boolean
          can_export: boolean
          can_modify: boolean
          can_view: boolean
          created_at: string
          custodian_user_id: string
          expires_at: string | null
          granted_by_admin_id: string
          id: string
          reason: string | null
          request_id: string
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          audit_log_reference?: string | null
          can_delete?: boolean
          can_download?: boolean
          can_export?: boolean
          can_modify?: boolean
          can_view?: boolean
          created_at?: string
          custodian_user_id: string
          expires_at?: string | null
          granted_by_admin_id: string
          id?: string
          reason?: string | null
          request_id: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          audit_log_reference?: string | null
          can_delete?: boolean
          can_download?: boolean
          can_export?: boolean
          can_modify?: boolean
          can_view?: boolean
          created_at?: string
          custodian_user_id?: string
          expires_at?: string | null
          granted_by_admin_id?: string
          id?: string
          reason?: string | null
          request_id?: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      continuity_audit_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_role: string | null
          admin_user_id: string
          affected_account_id: string | null
          created_at: string
          device_info: string | null
          id: string
          ip_address: string | null
          request_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_role?: string | null
          admin_user_id: string
          affected_account_id?: string | null
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          request_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_role?: string | null
          admin_user_id?: string
          affected_account_id?: string | null
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "continuity_audit_logs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "account_continuity_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      continuity_billing_succession: {
        Row: {
          account_id: string
          billing_review_notes: string | null
          created_at: string
          id: string
          new_owner_user_id: string
          payment_method_confirmed_at: string | null
          request_id: string
          status: string
          terms_accepted_at: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          billing_review_notes?: string | null
          created_at?: string
          id?: string
          new_owner_user_id: string
          payment_method_confirmed_at?: string | null
          request_id: string
          status?: string
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          billing_review_notes?: string | null
          created_at?: string
          id?: string
          new_owner_user_id?: string
          payment_method_confirmed_at?: string | null
          request_id?: string
          status?: string
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      continuity_checklist_items: {
        Row: {
          category: string
          created_at: string
          id: string
          item_key: string
          label: string
          request_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          item_key: string
          label: string
          request_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          item_key?: string
          label?: string
          request_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "continuity_checklist_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "account_continuity_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      continuity_documents: {
        Row: {
          access_restriction: string | null
          document_category: string | null
          encryption_status: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          last_accessed_at: string | null
          last_accessed_by: string | null
          request_id: string
          retention_category: string | null
          retention_expires_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          uploaded_at: string
          uploaded_by: string
          verification_status: string
        }
        Insert: {
          access_restriction?: string | null
          document_category?: string | null
          encryption_status?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          last_accessed_at?: string | null
          last_accessed_by?: string | null
          request_id: string
          retention_category?: string | null
          retention_expires_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          uploaded_at?: string
          uploaded_by: string
          verification_status?: string
        }
        Update: {
          access_restriction?: string | null
          document_category?: string | null
          encryption_status?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          last_accessed_at?: string | null
          last_accessed_by?: string | null
          request_id?: string
          retention_category?: string | null
          retention_expires_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          uploaded_at?: string
          uploaded_by?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "continuity_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "account_continuity_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      continuity_email_audit_log: {
        Row: {
          clicked_at: string | null
          created_at: string
          delivery_status: string
          dispute_submitted_at: string | null
          email_type: string
          id: string
          metadata: Json
          opened_at: string | null
          provider_message_id: string | null
          recipient_email: string
          recipient_role: string
          request_id: string | null
          token_expires_at: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string
          delivery_status?: string
          dispute_submitted_at?: string | null
          email_type: string
          id?: string
          metadata?: Json
          opened_at?: string | null
          provider_message_id?: string | null
          recipient_email: string
          recipient_role: string
          request_id?: string | null
          token_expires_at?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string
          delivery_status?: string
          dispute_submitted_at?: string | null
          email_type?: string
          id?: string
          metadata?: Json
          opened_at?: string | null
          provider_message_id?: string | null
          recipient_email?: string
          recipient_role?: string
          request_id?: string | null
          token_expires_at?: string | null
        }
        Relationships: []
      }
      continuity_execution_events: {
        Row: {
          account_id: string
          audit_log_reference: string | null
          completed_at: string | null
          executed_by_admin_id: string
          execution_type: string
          failure_reason: string | null
          id: string
          request_id: string
          started_at: string
          status: string
        }
        Insert: {
          account_id: string
          audit_log_reference?: string | null
          completed_at?: string | null
          executed_by_admin_id: string
          execution_type: string
          failure_reason?: string | null
          id?: string
          request_id: string
          started_at?: string
          status?: string
        }
        Update: {
          account_id?: string
          audit_log_reference?: string | null
          completed_at?: string | null
          executed_by_admin_id?: string
          execution_type?: string
          failure_reason?: string | null
          id?: string
          request_id?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      continuity_export_authorizations: {
        Row: {
          account_id: string
          authorized_at: string
          authorized_by_admin_id: string | null
          download_count: number
          download_limit: number | null
          expires_at: string | null
          id: string
          internal_reason: string | null
          request_id: string | null
          scope: Json
          sensitive_areas_included: boolean
          status: string
        }
        Insert: {
          account_id: string
          authorized_at?: string
          authorized_by_admin_id?: string | null
          download_count?: number
          download_limit?: number | null
          expires_at?: string | null
          id?: string
          internal_reason?: string | null
          request_id?: string | null
          scope?: Json
          sensitive_areas_included?: boolean
          status?: string
        }
        Update: {
          account_id?: string
          authorized_at?: string
          authorized_by_admin_id?: string | null
          download_count?: number
          download_limit?: number | null
          expires_at?: string | null
          id?: string
          internal_reason?: string | null
          request_id?: string | null
          scope?: Json
          sensitive_areas_included?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "continuity_export_authorizations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "continuity_export_authorizations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "account_continuity_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      continuity_export_forensics: {
        Row: {
          account_id: string
          approved_by: string | null
          created_at: string
          downloaded_at: string | null
          downloaded_by: string | null
          export_type: string
          exported_sections: Json
          file_hash: string | null
          file_name: string | null
          file_size_bytes: number | null
          id: string
          ip_address: unknown
          request_id: string
          requested_by: string | null
          user_agent: string | null
        }
        Insert: {
          account_id: string
          approved_by?: string | null
          created_at?: string
          downloaded_at?: string | null
          downloaded_by?: string | null
          export_type: string
          exported_sections?: Json
          file_hash?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          ip_address?: unknown
          request_id: string
          requested_by?: string | null
          user_agent?: string | null
        }
        Update: {
          account_id?: string
          approved_by?: string | null
          created_at?: string
          downloaded_at?: string | null
          downloaded_by?: string | null
          export_type?: string
          exported_sections?: Json
          file_hash?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          ip_address?: unknown
          request_id?: string
          requested_by?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      continuity_messages: {
        Row: {
          created_at: string
          id: string
          message_body: string
          request_id: string
          sent_by: string
          sent_to: string | null
          sent_to_email: string | null
          subject: string | null
          template_key: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message_body: string
          request_id: string
          sent_by: string
          sent_to?: string | null
          sent_to_email?: string | null
          subject?: string | null
          template_key?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message_body?: string
          request_id?: string
          sent_by?: string
          sent_to?: string | null
          sent_to_email?: string | null
          subject?: string | null
          template_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "continuity_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "account_continuity_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      continuity_notes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          internal_only: boolean
          note_body: string
          note_category: string
          request_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          internal_only?: boolean
          note_body: string
          note_category?: string
          request_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          internal_only?: boolean
          note_body?: string
          note_category?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "continuity_notes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "account_continuity_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      continuity_owner_dispute_tokens: {
        Row: {
          account_id: string
          expires_at: string
          id: string
          issued_at: string
          owner_user_id: string
          purpose: string
          request_id: string
          token_hash: string
          used_at: string | null
          used_ip: unknown
          used_user_agent: string | null
        }
        Insert: {
          account_id: string
          expires_at: string
          id?: string
          issued_at?: string
          owner_user_id: string
          purpose?: string
          request_id: string
          token_hash: string
          used_at?: string | null
          used_ip?: unknown
          used_user_agent?: string | null
        }
        Update: {
          account_id?: string
          expires_at?: string
          id?: string
          issued_at?: string
          owner_user_id?: string
          purpose?: string
          request_id?: string
          token_hash?: string
          used_at?: string | null
          used_ip?: unknown
          used_user_agent?: string | null
        }
        Relationships: []
      }
      continuity_owner_notifications: {
        Row: {
          account_id: string
          clicked_at: string | null
          created_at: string
          delivered_at: string | null
          delivery_status: string
          dispute_clicked_at: string | null
          email_type: string
          id: string
          metadata: Json
          opened_at: string | null
          provider_message_id: string | null
          recipient_email: string
          recipient_role: string
          recipient_user_id: string | null
          request_id: string
          sent_at: string | null
          subject: string | null
          token_expires_at: string | null
        }
        Insert: {
          account_id: string
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string
          dispute_clicked_at?: string | null
          email_type: string
          id?: string
          metadata?: Json
          opened_at?: string | null
          provider_message_id?: string | null
          recipient_email: string
          recipient_role: string
          recipient_user_id?: string | null
          request_id: string
          sent_at?: string | null
          subject?: string | null
          token_expires_at?: string | null
        }
        Update: {
          account_id?: string
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string
          dispute_clicked_at?: string | null
          email_type?: string
          id?: string
          metadata?: Json
          opened_at?: string | null
          provider_message_id?: string | null
          recipient_email?: string
          recipient_role?: string
          recipient_user_id?: string | null
          request_id?: string
          sent_at?: string | null
          subject?: string | null
          token_expires_at?: string | null
        }
        Relationships: []
      }
      continuity_ownership_transfers: {
        Row: {
          accepted_at: string | null
          account_id: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_reason: string | null
          created_at: string
          current_owner_id: string
          executed_at: string | null
          executed_by: string | null
          id: string
          identity_confirmed_at: string | null
          invitation_opened_at: string | null
          invitation_sent_at: string | null
          proposed_owner_id: string
          recommendation_rationale: string
          recommended_at: string
          recommended_by: string
          request_id: string
          senior_approval_notes: string | null
          senior_approved_at: string | null
          senior_approved_by: string | null
          status: string
          terms_accepted_at: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          account_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_reason?: string | null
          created_at?: string
          current_owner_id: string
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          identity_confirmed_at?: string | null
          invitation_opened_at?: string | null
          invitation_sent_at?: string | null
          proposed_owner_id: string
          recommendation_rationale: string
          recommended_at?: string
          recommended_by: string
          request_id: string
          senior_approval_notes?: string | null
          senior_approved_at?: string | null
          senior_approved_by?: string | null
          status?: string
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          account_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_reason?: string | null
          created_at?: string
          current_owner_id?: string
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          identity_confirmed_at?: string | null
          invitation_opened_at?: string | null
          invitation_sent_at?: string | null
          proposed_owner_id?: string
          recommendation_rationale?: string
          recommended_at?: string
          recommended_by?: string
          request_id?: string
          senior_approval_notes?: string | null
          senior_approved_at?: string | null
          senior_approved_by?: string | null
          status?: string
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "continuity_ownership_transfers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "account_continuity_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      continuity_secondary_legacy_admins: {
        Row: {
          account_id: string
          created_at: string
          designated_at: string
          id: string
          notes: string | null
          secondary_user_id: string
          status: string
        }
        Insert: {
          account_id: string
          created_at?: string
          designated_at?: string
          id?: string
          notes?: string | null
          secondary_user_id: string
          status?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          designated_at?: string
          id?: string
          notes?: string | null
          secondary_user_id?: string
          status?: string
        }
        Relationships: []
      }
      continuity_temporary_access: {
        Row: {
          account_holder_id: string
          account_id: string | null
          created_at: string
          expires_at: string
          granted_by: string
          id: string
          legacy_admin_id: string
          permissions: Json
          reason: string
          request_id: string
          revoked_at: string | null
          revoked_by: string | null
          revoked_reason: string | null
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          account_holder_id: string
          account_id?: string | null
          created_at?: string
          expires_at: string
          granted_by: string
          id?: string
          legacy_admin_id: string
          permissions?: Json
          reason: string
          request_id: string
          revoked_at?: string | null
          revoked_by?: string | null
          revoked_reason?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_holder_id?: string
          account_id?: string | null
          created_at?: string
          expires_at?: string
          granted_by?: string
          id?: string
          legacy_admin_id?: string
          permissions?: Json
          reason?: string
          request_id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          revoked_reason?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "continuity_temporary_access_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "account_continuity_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      continuity_timeline_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_description: string | null
          event_type: string
          id: string
          metadata: Json | null
          request_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          request_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "continuity_timeline_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "account_continuity_requests"
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
          first_name: string | null
          id: string
          invite_token: string | null
          invited_at: string
          last_name: string | null
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
          first_name?: string | null
          id?: string
          invite_token?: string | null
          invited_at?: string
          last_name?: string | null
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
          first_name?: string | null
          id?: string
          invite_token?: string | null
          invited_at?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["contributor_role"]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      cron_job_health: {
        Row: {
          consecutive_failures: number
          created_at: string
          description: string | null
          expected_interval_minutes: number
          job_name: string
          last_duration_ms: number | null
          last_error: string | null
          last_failed_at: string | null
          last_result: Json
          last_started_at: string | null
          last_status: string
          last_succeeded_at: string | null
          page_after_minutes: number
          updated_at: string
          warn_after_minutes: number
        }
        Insert: {
          consecutive_failures?: number
          created_at?: string
          description?: string | null
          expected_interval_minutes: number
          job_name: string
          last_duration_ms?: number | null
          last_error?: string | null
          last_failed_at?: string | null
          last_result?: Json
          last_started_at?: string | null
          last_status?: string
          last_succeeded_at?: string | null
          page_after_minutes: number
          updated_at?: string
          warn_after_minutes: number
        }
        Update: {
          consecutive_failures?: number
          created_at?: string
          description?: string | null
          expected_interval_minutes?: number
          job_name?: string
          last_duration_ms?: number | null
          last_error?: string | null
          last_failed_at?: string | null
          last_result?: Json
          last_started_at?: string | null
          last_status?: string
          last_succeeded_at?: string | null
          page_after_minutes?: number
          updated_at?: string
          warn_after_minutes?: number
        }
        Relationships: []
      }
      damage_reports: {
        Row: {
          actions_taken: string[] | null
          additional_observations: string | null
          approximate_time: string | null
          areas_affected: string[] | null
          belongings_items: string[] | null
          claim_number: string | null
          company_names: string | null
          contacted_someone: string | null
          created_at: string
          damage_ongoing: string | null
          date_of_damage: string | null
          estimated_cost: string | null
          id: string
          impact_buckets: string[] | null
          incident_types: string[] | null
          is_archived: boolean
          other_area: string | null
          other_belongings: string | null
          other_incident_type: string | null
          professionals_contacted: string[] | null
          property_id: string
          safety_concerns: string[] | null
          updated_at: string
          user_id: string
          visible_damage: string[] | null
        }
        Insert: {
          actions_taken?: string[] | null
          additional_observations?: string | null
          approximate_time?: string | null
          areas_affected?: string[] | null
          belongings_items?: string[] | null
          claim_number?: string | null
          company_names?: string | null
          contacted_someone?: string | null
          created_at?: string
          damage_ongoing?: string | null
          date_of_damage?: string | null
          estimated_cost?: string | null
          id?: string
          impact_buckets?: string[] | null
          incident_types?: string[] | null
          is_archived?: boolean
          other_area?: string | null
          other_belongings?: string | null
          other_incident_type?: string | null
          professionals_contacted?: string[] | null
          property_id: string
          safety_concerns?: string[] | null
          updated_at?: string
          user_id: string
          visible_damage?: string[] | null
        }
        Update: {
          actions_taken?: string[] | null
          additional_observations?: string | null
          approximate_time?: string | null
          areas_affected?: string[] | null
          belongings_items?: string[] | null
          claim_number?: string | null
          company_names?: string | null
          contacted_someone?: string | null
          created_at?: string
          damage_ongoing?: string | null
          date_of_damage?: string | null
          estimated_cost?: string | null
          id?: string
          impact_buckets?: string[] | null
          incident_types?: string[] | null
          is_archived?: boolean
          other_area?: string | null
          other_belongings?: string | null
          other_incident_type?: string | null
          professionals_contacted?: string[] | null
          property_id?: string
          safety_concerns?: string[] | null
          updated_at?: string
          user_id?: string
          visible_damage?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "damage_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_resume_activities: {
        Row: {
          account_id: string
          activity_label: string
          activity_type: string
          created_at: string
          destination_route: string
          id: string
          related_entity_id: string | null
          related_entity_type: string | null
          user_id: string
          workspace_context: string
        }
        Insert: {
          account_id: string
          activity_label: string
          activity_type: string
          created_at?: string
          destination_route: string
          id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id: string
          workspace_context: string
        }
        Update: {
          account_id?: string
          activity_label?: string
          activity_type?: string
          created_at?: string
          destination_route?: string
          id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id?: string
          workspace_context?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_resume_activities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
      deleted_accounts: {
        Row: {
          deleted_at: string
          deleted_by: string | null
          deletion_reason: string | null
          deletion_status: string
          email: string
          email_hash: string | null
          former_user_id_hash: string | null
          id: string
          legal_hold: boolean
          original_user_id: string | null
          retention_expires_at: string | null
          retention_purge_status: string
          retention_purged_at: string | null
          stripe_customer_id: string | null
        }
        Insert: {
          deleted_at?: string
          deleted_by?: string | null
          deletion_reason?: string | null
          deletion_status?: string
          email: string
          email_hash?: string | null
          former_user_id_hash?: string | null
          id?: string
          legal_hold?: boolean
          original_user_id?: string | null
          retention_expires_at?: string | null
          retention_purge_status?: string
          retention_purged_at?: string | null
          stripe_customer_id?: string | null
        }
        Update: {
          deleted_at?: string
          deleted_by?: string | null
          deletion_reason?: string | null
          deletion_status?: string
          email?: string
          email_hash?: string | null
          former_user_id_hash?: string | null
          id?: string
          legal_hold?: boolean
          original_user_id?: string | null
          retention_expires_at?: string | null
          retention_purge_status?: string
          retention_purged_at?: string | null
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      dev_blockers: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["dev_blocker_status"]
          title: string
          type: Database["public"]["Enums"]["dev_blocker_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["dev_blocker_status"]
          title: string
          type?: Database["public"]["Enums"]["dev_blocker_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["dev_blocker_status"]
          title?: string
          type?: Database["public"]["Enums"]["dev_blocker_type"]
        }
        Relationships: []
      }
      dev_bugs: {
        Row: {
          assignee_id: string | null
          created_at: string
          description: string | null
          expected_behavior: string | null
          id: string
          reporter_id: string | null
          severity: Database["public"]["Enums"]["dev_bug_severity"]
          status: Database["public"]["Enums"]["dev_bug_status"]
          steps_to_reproduce: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          expected_behavior?: string | null
          id?: string
          reporter_id?: string | null
          severity?: Database["public"]["Enums"]["dev_bug_severity"]
          status?: Database["public"]["Enums"]["dev_bug_status"]
          steps_to_reproduce?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          expected_behavior?: string | null
          id?: string
          reporter_id?: string | null
          severity?: Database["public"]["Enums"]["dev_bug_severity"]
          status?: Database["public"]["Enums"]["dev_bug_status"]
          steps_to_reproduce?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      dev_decisions: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          decided_at: string | null
          decision: string
          id: string
          rationale: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          decision: string
          id?: string
          rationale?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          decision?: string
          id?: string
          rationale?: string | null
        }
        Relationships: []
      }
      dev_milestones: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["dev_milestone_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["dev_milestone_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["dev_milestone_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      dev_notes: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      dev_releases: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          key_changes: string[] | null
          known_issues: string[] | null
          release_date: string | null
          status: Database["public"]["Enums"]["dev_release_status"]
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          key_changes?: string[] | null
          known_issues?: string[] | null
          release_date?: string | null
          status?: Database["public"]["Enums"]["dev_release_status"]
          title: string
          updated_at?: string
          version: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          key_changes?: string[] | null
          known_issues?: string[] | null
          release_date?: string | null
          status?: Database["public"]["Enums"]["dev_release_status"]
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      dev_support_issues: {
        Row: {
          assignee_id: string | null
          billing_verification_status: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          identity_verification_status: string
          pii_scrub_metadata: Json
          pii_scrubbed_at: string | null
          priority: Database["public"]["Enums"]["dev_support_priority"]
          recovery_action_notes: string | null
          recovery_action_status: string
          recovery_completed_at: string | null
          recovery_scenario: string | null
          reported_by: string | null
          resolution: string | null
          status: Database["public"]["Enums"]["dev_support_status"]
          title: string
          type: Database["public"]["Enums"]["dev_support_type"]
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          billing_verification_status?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          identity_verification_status?: string
          pii_scrub_metadata?: Json
          pii_scrubbed_at?: string | null
          priority?: Database["public"]["Enums"]["dev_support_priority"]
          recovery_action_notes?: string | null
          recovery_action_status?: string
          recovery_completed_at?: string | null
          recovery_scenario?: string | null
          reported_by?: string | null
          resolution?: string | null
          status?: Database["public"]["Enums"]["dev_support_status"]
          title: string
          type?: Database["public"]["Enums"]["dev_support_type"]
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          billing_verification_status?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          identity_verification_status?: string
          pii_scrub_metadata?: Json
          pii_scrubbed_at?: string | null
          priority?: Database["public"]["Enums"]["dev_support_priority"]
          recovery_action_notes?: string | null
          recovery_action_status?: string
          recovery_completed_at?: string | null
          recovery_scenario?: string | null
          reported_by?: string | null
          resolution?: string | null
          status?: Database["public"]["Enums"]["dev_support_status"]
          title?: string
          type?: Database["public"]["Enums"]["dev_support_type"]
          updated_at?: string
        }
        Relationships: []
      }
      dev_tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["dev_task_priority"]
          status: Database["public"]["Enums"]["dev_task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["dev_task_priority"]
          status?: Database["public"]["Enums"]["dev_task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["dev_task_priority"]
          status?: Database["public"]["Enums"]["dev_task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      dev_team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invitation_token: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          token_expires_at: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invitation_token: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token_expires_at?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invitation_token?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token_expires_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_folders: {
        Row: {
          account_id: string
          created_at: string
          description: string | null
          folder_name: string
          gradient_color: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description?: string | null
          folder_name: string
          gradient_color?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string | null
          folder_name?: string
          gradient_color?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_folders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_change_requests: {
        Row: {
          cancelled_at: string | null
          confirmed_at: string | null
          expires_at: string
          id: string
          ip: string | null
          new_email: string
          requested_at: string
          token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          expires_at?: string
          id?: string
          ip?: string | null
          new_email: string
          requested_at?: string
          token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          expires_at?: string
          id?: string
          ip?: string | null
          new_email?: string
          requested_at?: string
          token_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_deliverability_events: {
        Row: {
          created_at: string
          email_stream: string | null
          event_type: string
          from_email: string | null
          id: string
          occurred_at: string
          provider: string
          provider_event_id: string | null
          provider_message_id: string | null
          raw_payload: Json
          recipient_domain: string | null
          recipient_email_hash: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email_stream?: string | null
          event_type: string
          from_email?: string | null
          id?: string
          occurred_at?: string
          provider?: string
          provider_event_id?: string | null
          provider_message_id?: string | null
          raw_payload?: Json
          recipient_domain?: string | null
          recipient_email_hash?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email_stream?: string | null
          event_type?: string
          from_email?: string | null
          id?: string
          occurred_at?: string
          provider?: string
          provider_event_id?: string | null
          provider_message_id?: string | null
          raw_payload?: Json
          recipient_domain?: string | null
          recipient_email_hash?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      emergency_instructions: {
        Row: {
          access_notes: Json | null
          created_at: string
          family_notes: string | null
          first_actions: Json | null
          id: string
          primary_contact: Json | null
          professionals: Json | null
          property_assets: Json | null
          secondary_contact: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_notes?: Json | null
          created_at?: string
          family_notes?: string | null
          first_actions?: Json | null
          id?: string
          primary_contact?: Json | null
          professionals?: Json | null
          property_assets?: Json | null
          secondary_contact?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_notes?: Json | null
          created_at?: string
          family_notes?: string | null
          first_actions?: Json | null
          id?: string
          primary_contact?: Json | null
          professionals?: Json | null
          property_assets?: Json | null
          secondary_contact?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          base_storage_gb: number
          billing_status: string | null
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          entitlement_source: string
          expires_at: string | null
          id: string
          plan: string
          plan_lookup_key: string | null
          source_event_id: string | null
          status: string
          storage_addon_blocks_qty: number
          stripe_customer_id: string | null
          stripe_plan_price_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          total_storage_gb: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_storage_gb?: number
          billing_status?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          entitlement_source?: string
          expires_at?: string | null
          id?: string
          plan?: string
          plan_lookup_key?: string | null
          source_event_id?: string | null
          status?: string
          storage_addon_blocks_qty?: number
          stripe_customer_id?: string | null
          stripe_plan_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          total_storage_gb?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_storage_gb?: number
          billing_status?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          entitlement_source?: string
          expires_at?: string | null
          id?: string
          plan?: string
          plan_lookup_key?: string | null
          source_event_id?: string | null
          status?: string
          storage_addon_blocks_qty?: number
          stripe_customer_id?: string | null
          stripe_plan_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          total_storage_gb?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      external_account_assistance_requests: {
        Row: {
          account_holder_email: string | null
          account_holder_name: string
          account_holder_other_info: string | null
          account_holder_phone: string | null
          acknowledgements: Json
          assigned_reviewer_id: string | null
          billing_action_taken: string | null
          billing_action_timestamp: string | null
          billing_review_notes: string | null
          completed_at: string | null
          explanation: string
          id: string
          ip_address: string | null
          metadata: Json
          owner_dispute_reason: string | null
          owner_dispute_status: string | null
          owner_disputed_at: string | null
          owner_notified_at: string | null
          preservation_hold: boolean
          preservation_hold_expires_at: string | null
          preservation_hold_started_at: string | null
          reason_for_contact: string
          requester_email: string
          requester_name: string
          requester_phone: string | null
          requester_relationship: string
          risk_level: string
          status: string
          submitted_at: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          account_holder_email?: string | null
          account_holder_name: string
          account_holder_other_info?: string | null
          account_holder_phone?: string | null
          acknowledgements?: Json
          assigned_reviewer_id?: string | null
          billing_action_taken?: string | null
          billing_action_timestamp?: string | null
          billing_review_notes?: string | null
          completed_at?: string | null
          explanation: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          owner_dispute_reason?: string | null
          owner_dispute_status?: string | null
          owner_disputed_at?: string | null
          owner_notified_at?: string | null
          preservation_hold?: boolean
          preservation_hold_expires_at?: string | null
          preservation_hold_started_at?: string | null
          reason_for_contact: string
          requester_email: string
          requester_name: string
          requester_phone?: string | null
          requester_relationship: string
          risk_level?: string
          status?: string
          submitted_at?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          account_holder_email?: string | null
          account_holder_name?: string
          account_holder_other_info?: string | null
          account_holder_phone?: string | null
          acknowledgements?: Json
          assigned_reviewer_id?: string | null
          billing_action_taken?: string | null
          billing_action_timestamp?: string | null
          billing_review_notes?: string | null
          completed_at?: string | null
          explanation?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          owner_dispute_reason?: string | null
          owner_dispute_status?: string | null
          owner_disputed_at?: string | null
          owner_notified_at?: string | null
          preservation_hold?: boolean
          preservation_hold_expires_at?: string | null
          preservation_hold_started_at?: string | null
          reason_for_contact?: string
          requester_email?: string
          requester_name?: string
          requester_phone?: string | null
          requester_relationship?: string
          risk_level?: string
          status?: string
          submitted_at?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      external_assistance_account_matches: {
        Row: {
          id: string
          internal_only: boolean
          match_confidence: string
          match_method: string | null
          matched_account_id: string | null
          matched_at: string
          matched_by: string | null
          matched_user_id: string | null
          notes: string | null
          request_id: string
        }
        Insert: {
          id?: string
          internal_only?: boolean
          match_confidence?: string
          match_method?: string | null
          matched_account_id?: string | null
          matched_at?: string
          matched_by?: string | null
          matched_user_id?: string | null
          notes?: string | null
          request_id: string
        }
        Update: {
          id?: string
          internal_only?: boolean
          match_confidence?: string
          match_method?: string | null
          matched_account_id?: string | null
          matched_at?: string
          matched_by?: string | null
          matched_user_id?: string | null
          notes?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_assistance_account_matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "external_account_assistance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      external_assistance_audit_logs: {
        Row: {
          action_details: Json
          action_type: string
          actor_id: string | null
          actor_type: string
          created_at: string
          device_info: string | null
          id: string
          ip_address: string | null
          request_id: string | null
        }
        Insert: {
          action_details?: Json
          action_type: string
          actor_id?: string | null
          actor_type: string
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          request_id?: string | null
        }
        Update: {
          action_details?: Json
          action_type?: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_assistance_audit_logs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "external_account_assistance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      external_assistance_documents: {
        Row: {
          document_category: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          request_id: string
          reviewer_notes: string | null
          updated_at: string
          uploaded_at: string
          verification_status: string
        }
        Insert: {
          document_category?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          request_id: string
          reviewer_notes?: string | null
          updated_at?: string
          uploaded_at?: string
          verification_status?: string
        }
        Update: {
          document_category?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          request_id?: string
          reviewer_notes?: string | null
          updated_at?: string
          uploaded_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_assistance_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "external_account_assistance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      external_assistance_notifications: {
        Row: {
          clicked_at: string | null
          created_at: string
          delivery_status: string
          error_message: string | null
          id: string
          notification_type: string
          opened_at: string | null
          recipient_email: string | null
          recipient_type: string
          request_id: string
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string
          delivery_status?: string
          error_message?: string | null
          id?: string
          notification_type: string
          opened_at?: string | null
          recipient_email?: string | null
          recipient_type: string
          request_id: string
        }
        Update: {
          clicked_at?: string | null
          created_at?: string
          delivery_status?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          opened_at?: string | null
          recipient_email?: string | null
          recipient_type?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_assistance_notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "external_account_assistance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      family_important_locations: {
        Row: {
          attachment_file_name: string | null
          category: string | null
          created_at: string
          delete_attempts: number
          delete_error: string | null
          delete_processing_at: string | null
          id: string
          item_name: string
          location_description: string | null
          notes: string | null
          pending_delete: boolean
          pending_delete_at: string | null
          property_id: string | null
          related_contact_name: string | null
          room_area: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_file_name?: string | null
          category?: string | null
          created_at?: string
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          id?: string
          item_name: string
          location_description?: string | null
          notes?: string | null
          pending_delete?: boolean
          pending_delete_at?: string | null
          property_id?: string | null
          related_contact_name?: string | null
          room_area?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_file_name?: string | null
          category?: string | null
          created_at?: string
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          id?: string
          item_name?: string
          location_description?: string | null
          notes?: string | null
          pending_delete?: boolean
          pending_delete_at?: string | null
          property_id?: string | null
          related_contact_name?: string | null
          room_area?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_important_locations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      family_medications: {
        Row: {
          bucket_name: string | null
          caregiver_notes: string | null
          created_at: string
          currently_taking: boolean
          delete_attempts: number
          delete_error: string | null
          delete_processing_at: string | null
          dosage: string | null
          end_date: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_url: string | null
          frequency_instructions: string | null
          id: string
          medication_category: string | null
          medication_name: string
          notes: string | null
          pending_delete: boolean
          pending_delete_at: string | null
          pharmacy_name: string | null
          pharmacy_phone: string | null
          prescribing_doctor: string | null
          prescription_number: string | null
          reason: string | null
          refill_number: string | null
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket_name?: string | null
          caregiver_notes?: string | null
          created_at?: string
          currently_taking?: boolean
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          dosage?: string | null
          end_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          frequency_instructions?: string | null
          id?: string
          medication_category?: string | null
          medication_name: string
          notes?: string | null
          pending_delete?: boolean
          pending_delete_at?: string | null
          pharmacy_name?: string | null
          pharmacy_phone?: string | null
          prescribing_doctor?: string | null
          prescription_number?: string | null
          reason?: string | null
          refill_number?: string | null
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket_name?: string | null
          caregiver_notes?: string | null
          created_at?: string
          currently_taking?: boolean
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          dosage?: string | null
          end_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          frequency_instructions?: string | null
          id?: string
          medication_category?: string | null
          medication_name?: string
          notes?: string | null
          pending_delete?: boolean
          pending_delete_at?: string | null
          pharmacy_name?: string | null
          pharmacy_phone?: string | null
          prescribing_doctor?: string | null
          prescription_number?: string | null
          reason?: string | null
          refill_number?: string | null
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_recipes: {
        Row: {
          bucket_name: string | null
          created_at: string
          created_by_person: string | null
          delete_attempts: number
          delete_error: string | null
          delete_processing_at: string | null
          details: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_url: string | null
          id: string
          pending_delete: boolean
          pending_delete_at: string | null
          recipe_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket_name?: string | null
          created_at?: string
          created_by_person?: string | null
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          details?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          pending_delete?: boolean
          pending_delete_at?: string | null
          recipe_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket_name?: string | null
          created_at?: string
          created_by_person?: string | null
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          details?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          pending_delete?: boolean
          pending_delete_at?: string | null
          recipe_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          created_at: string
          current_balance: number | null
          id: string
          institution_name: string
          notes: string | null
          routing_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          account_type: string
          created_at?: string
          current_balance?: number | null
          id?: string
          institution_name: string
          notes?: string | null
          routing_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          created_at?: string
          current_balance?: number | null
          id?: string
          institution_name?: string
          notes?: string | null
          routing_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_loan_folders: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          folder_name: string
          gradient_color: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          folder_name: string
          gradient_color?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          folder_name?: string
          gradient_color?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_loans: {
        Row: {
          account_number: string | null
          apr: number | null
          bucket_name: string
          created_at: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          folder_id: string | null
          id: string
          institution: string | null
          loan_terms: string | null
          loan_type: string | null
          maturity_date: string | null
          monthly_payment: number | null
          notes: string | null
          start_date: string | null
          status: string
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          apr?: number | null
          bucket_name?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id?: string | null
          id?: string
          institution?: string | null
          loan_terms?: string | null
          loan_type?: string | null
          maturity_date?: string | null
          monthly_payment?: number | null
          notes?: string | null
          start_date?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          apr?: number | null
          bucket_name?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id?: string | null
          id?: string
          institution?: string | null
          loan_terms?: string | null
          loan_type?: string | null
          maturity_date?: string | null
          monthly_payment?: number | null
          notes?: string | null
          start_date?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_loans_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "financial_loan_folders"
            referencedColumns: ["id"]
          },
        ]
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
          anonymized_at: string | null
          cancelled_at: string | null
          claim_token_hash: string | null
          created_at: string
          currency: string | null
          deleted_account_id: string | null
          delivered_at: string | null
          delivery_attempted_at: string | null
          delivery_date: string
          delivery_method: string
          delivery_status: string
          email_hash: string | null
          expires_at: string | null
          failed_at: string | null
          failure_reason: string | null
          first_login_at: string | null
          gift_code: string
          gift_message: string | null
          id: string
          last_delivery_error: string | null
          manually_voided_at: string | null
          paid_at: string | null
          payment_status: string
          plan_type: string
          purchaser_deleted_account_id: string | null
          purchaser_email: string | null
          purchaser_email_sent_at: string | null
          purchaser_name: string
          purchaser_phone: string | null
          purchaser_user_id: string | null
          recipient_deleted_account_id: string | null
          recipient_email: string | null
          recipient_email_sent_at: string | null
          recipient_name: string | null
          recipient_user_id: string | null
          redeemed: boolean | null
          redeemed_at: string | null
          redeemed_by_user_id: string | null
          redemption_status: string
          refunded_at: string | null
          reminder_email_sent: boolean | null
          reminder_email_sent_at: string | null
          resend_purchaser_email_id: string | null
          resend_recipient_email_id: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          success_token_expires_at: string | null
          success_token_hash: string | null
          term: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          anonymized_at?: string | null
          cancelled_at?: string | null
          claim_token_hash?: string | null
          created_at?: string
          currency?: string | null
          deleted_account_id?: string | null
          delivered_at?: string | null
          delivery_attempted_at?: string | null
          delivery_date: string
          delivery_method?: string
          delivery_status?: string
          email_hash?: string | null
          expires_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          first_login_at?: string | null
          gift_code: string
          gift_message?: string | null
          id?: string
          last_delivery_error?: string | null
          manually_voided_at?: string | null
          paid_at?: string | null
          payment_status?: string
          plan_type: string
          purchaser_deleted_account_id?: string | null
          purchaser_email?: string | null
          purchaser_email_sent_at?: string | null
          purchaser_name: string
          purchaser_phone?: string | null
          purchaser_user_id?: string | null
          recipient_deleted_account_id?: string | null
          recipient_email?: string | null
          recipient_email_sent_at?: string | null
          recipient_name?: string | null
          recipient_user_id?: string | null
          redeemed?: boolean | null
          redeemed_at?: string | null
          redeemed_by_user_id?: string | null
          redemption_status?: string
          refunded_at?: string | null
          reminder_email_sent?: boolean | null
          reminder_email_sent_at?: string | null
          resend_purchaser_email_id?: string | null
          resend_recipient_email_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          success_token_expires_at?: string | null
          success_token_hash?: string | null
          term?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          anonymized_at?: string | null
          cancelled_at?: string | null
          claim_token_hash?: string | null
          created_at?: string
          currency?: string | null
          deleted_account_id?: string | null
          delivered_at?: string | null
          delivery_attempted_at?: string | null
          delivery_date?: string
          delivery_method?: string
          delivery_status?: string
          email_hash?: string | null
          expires_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          first_login_at?: string | null
          gift_code?: string
          gift_message?: string | null
          id?: string
          last_delivery_error?: string | null
          manually_voided_at?: string | null
          paid_at?: string | null
          payment_status?: string
          plan_type?: string
          purchaser_deleted_account_id?: string | null
          purchaser_email?: string | null
          purchaser_email_sent_at?: string | null
          purchaser_name?: string
          purchaser_phone?: string | null
          purchaser_user_id?: string | null
          recipient_deleted_account_id?: string | null
          recipient_email?: string | null
          recipient_email_sent_at?: string | null
          recipient_name?: string | null
          recipient_user_id?: string | null
          redeemed?: boolean | null
          redeemed_at?: string | null
          redeemed_by_user_id?: string | null
          redemption_status?: string
          refunded_at?: string | null
          reminder_email_sent?: boolean | null
          reminder_email_sent_at?: string | null
          resend_purchaser_email_id?: string | null
          resend_recipient_email_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          success_token_expires_at?: string | null
          success_token_hash?: string | null
          term?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_subscriptions_deleted_account_id_fkey"
            columns: ["deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_subscriptions_purchaser_deleted_account_id_fkey"
            columns: ["purchaser_deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_subscriptions_recipient_deleted_account_id_fkey"
            columns: ["recipient_deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      gifts: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          expires_at: string | null
          from_name: string
          gift_message: string | null
          id: string
          recipient_email: string
          redeemed: boolean
          redeemed_by_user_id: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_subscription_id: string | null
          term: string
          token: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          from_name: string
          gift_message?: string | null
          id?: string
          recipient_email: string
          redeemed?: boolean
          redeemed_by_user_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_subscription_id?: string | null
          term?: string
          token?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          from_name?: string
          gift_message?: string | null
          id?: string
          recipient_email?: string
          redeemed?: boolean
          redeemed_by_user_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_subscription_id?: string | null
          term?: string
          token?: string
        }
        Relationships: []
      }
      insurance_policies: {
        Row: {
          agent_email: string | null
          agent_name: string | null
          agent_phone: string | null
          coverage_amount: number | null
          coverage_details: string | null
          created_at: string
          deductible: number | null
          id: string
          insurance_company: string
          notes: string | null
          policy_end_date: string | null
          policy_number: string
          policy_start_date: string | null
          policy_type: string
          premium_amount: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_email?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          coverage_amount?: number | null
          coverage_details?: string | null
          created_at?: string
          deductible?: number | null
          id?: string
          insurance_company: string
          notes?: string | null
          policy_end_date?: string | null
          policy_number: string
          policy_start_date?: string | null
          policy_type?: string
          premium_amount?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_email?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          coverage_amount?: number | null
          coverage_details?: string | null
          created_at?: string
          deductible?: number | null
          id?: string
          insurance_company?: string
          notes?: string | null
          policy_end_date?: string | null
          policy_number?: string
          policy_start_date?: string | null
          policy_type?: string
          premium_amount?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          accepted_at: string | null
          account_id: string
          canceled_at: string | null
          created_at: string
          delivered_at: string | null
          delivery_status: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          last_delivery_error: string | null
          last_sent_at: string | null
          resend_count: number
          role: Database["public"]["Enums"]["membership_role"]
          status: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          account_id: string
          canceled_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          last_delivery_error?: string | null
          last_sent_at?: string | null
          resend_count?: number
          role?: Database["public"]["Enums"]["membership_role"]
          status?: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          account_id?: string
          canceled_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          last_delivery_error?: string | null
          last_sent_at?: string | null
          resend_count?: number
          role?: Database["public"]["Enums"]["membership_role"]
          status?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
      legacy_admin_consent_history: {
        Row: {
          account_id: string
          account_owner_id: string
          consent_acknowledged_at: string
          consent_terms_version: string | null
          consent_text: string | null
          created_at: string
          id: string
          ip_address: unknown
          legacy_admin_user_id: string
          mfa_completed: boolean
          optional_review_acknowledged: boolean
          preferences_version: number | null
          user_agent: string | null
        }
        Insert: {
          account_id: string
          account_owner_id: string
          consent_acknowledged_at?: string
          consent_terms_version?: string | null
          consent_text?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          legacy_admin_user_id: string
          mfa_completed?: boolean
          optional_review_acknowledged?: boolean
          preferences_version?: number | null
          user_agent?: string | null
        }
        Update: {
          account_id?: string
          account_owner_id?: string
          consent_acknowledged_at?: string
          consent_terms_version?: string | null
          consent_text?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          legacy_admin_user_id?: string
          mfa_completed?: boolean
          optional_review_acknowledged?: boolean
          preferences_version?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      legacy_admins: {
        Row: {
          account_id: string
          assigned_at: string
          assigned_by_owner_id: string
          consent_acknowledged_at: string | null
          consent_ip: unknown
          consent_mfa_completed: boolean
          consent_terms_version: string | null
          consent_user_agent: string | null
          created_at: string
          id: string
          legacy_admin_user_id: string
          notes: string | null
          preferences_version_at_consent: number | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          assigned_at?: string
          assigned_by_owner_id: string
          consent_acknowledged_at?: string | null
          consent_ip?: unknown
          consent_mfa_completed?: boolean
          consent_terms_version?: string | null
          consent_user_agent?: string | null
          created_at?: string
          id?: string
          legacy_admin_user_id: string
          notes?: string | null
          preferences_version_at_consent?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          assigned_at?: string
          assigned_by_owner_id?: string
          consent_acknowledged_at?: string | null
          consent_ip?: unknown
          consent_mfa_completed?: boolean
          consent_terms_version?: string | null
          consent_user_agent?: string | null
          created_at?: string
          id?: string
          legacy_admin_user_id?: string
          notes?: string | null
          preferences_version_at_consent?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_admins_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_locker: {
        Row: {
          address: string | null
          allow_admin_access: boolean
          attorney_contact: string | null
          attorney_firm: string | null
          attorney_name: string | null
          backup_executor_contact: string | null
          backup_executor_name: string | null
          backup_guardian_contact: string | null
          backup_guardian_name: string | null
          burial_or_cremation: string | null
          business_partner_company: string | null
          business_partner_contact: string | null
          business_partner_name: string | null
          business_succession_plan: string | null
          ceremony_preferences: string | null
          charitable_giving: string | null
          continuity_annual_reminder: boolean
          continuity_notes: string | null
          continuity_notes_encrypted: string | null
          continuity_preference: string | null
          continuity_preferences: Json
          continuity_preferences_reviewed_at: string | null
          continuity_preferences_version: number
          created_at: string
          crypto_passwords: string | null
          debts_expenses: string | null
          delegate_user_id: string | null
          developmental_goals: string | null
          digital_assets: Json | null
          digital_identity: string | null
          emotional_behavioral: string | null
          encryption_key_encrypted_for_delegate: string | null
          encryption_key_encrypted_for_user: string | null
          ethical_will: string | null
          executor_contact: string | null
          executor_instructions: string | null
          executor_name: string | null
          executor_relationship: string | null
          financial_advisor_contact: string | null
          financial_advisor_firm: string | null
          financial_advisor_name: string | null
          financial_crypto: string | null
          full_legal_name: string | null
          funeral_wishes: string | null
          general_bequests: Json | null
          guardian_contact: string | null
          guardian_name: string | null
          guardian_relationship: string | null
          home_maintenance: string | null
          household_operations: string | null
          id: string
          investment_advisor_name: string | null
          investment_firm_contact: string | null
          investment_firm_name: string | null
          is_encrypted: boolean
          legacy_messages: string | null
          letters_to_children: string | null
          letters_to_loved_ones: string | null
          life_overview: string | null
          medical_preferences: string | null
          neighborhood_contacts: string | null
          no_contest_clause: boolean | null
          organ_donation: boolean | null
          parenting_preferences: string | null
          personal_philosophies: string | null
          pet_care_instructions: string | null
          photo_video_documentation: string | null
          physical_documents: string | null
          property_walkthrough: string | null
          real_estate_instructions: string | null
          recovery_grace_period_days: number | null
          recovery_requested_at: string | null
          recovery_status: string | null
          rental_property: string | null
          residuary_estate: string | null
          sentimental_distribution: string | null
          sentimental_items: string | null
          specific_bequests: Json | null
          spouse_contact: string | null
          spouse_name: string | null
          subscriptions: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          allow_admin_access?: boolean
          attorney_contact?: string | null
          attorney_firm?: string | null
          attorney_name?: string | null
          backup_executor_contact?: string | null
          backup_executor_name?: string | null
          backup_guardian_contact?: string | null
          backup_guardian_name?: string | null
          burial_or_cremation?: string | null
          business_partner_company?: string | null
          business_partner_contact?: string | null
          business_partner_name?: string | null
          business_succession_plan?: string | null
          ceremony_preferences?: string | null
          charitable_giving?: string | null
          continuity_annual_reminder?: boolean
          continuity_notes?: string | null
          continuity_notes_encrypted?: string | null
          continuity_preference?: string | null
          continuity_preferences?: Json
          continuity_preferences_reviewed_at?: string | null
          continuity_preferences_version?: number
          created_at?: string
          crypto_passwords?: string | null
          debts_expenses?: string | null
          delegate_user_id?: string | null
          developmental_goals?: string | null
          digital_assets?: Json | null
          digital_identity?: string | null
          emotional_behavioral?: string | null
          encryption_key_encrypted_for_delegate?: string | null
          encryption_key_encrypted_for_user?: string | null
          ethical_will?: string | null
          executor_contact?: string | null
          executor_instructions?: string | null
          executor_name?: string | null
          executor_relationship?: string | null
          financial_advisor_contact?: string | null
          financial_advisor_firm?: string | null
          financial_advisor_name?: string | null
          financial_crypto?: string | null
          full_legal_name?: string | null
          funeral_wishes?: string | null
          general_bequests?: Json | null
          guardian_contact?: string | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          home_maintenance?: string | null
          household_operations?: string | null
          id?: string
          investment_advisor_name?: string | null
          investment_firm_contact?: string | null
          investment_firm_name?: string | null
          is_encrypted?: boolean
          legacy_messages?: string | null
          letters_to_children?: string | null
          letters_to_loved_ones?: string | null
          life_overview?: string | null
          medical_preferences?: string | null
          neighborhood_contacts?: string | null
          no_contest_clause?: boolean | null
          organ_donation?: boolean | null
          parenting_preferences?: string | null
          personal_philosophies?: string | null
          pet_care_instructions?: string | null
          photo_video_documentation?: string | null
          physical_documents?: string | null
          property_walkthrough?: string | null
          real_estate_instructions?: string | null
          recovery_grace_period_days?: number | null
          recovery_requested_at?: string | null
          recovery_status?: string | null
          rental_property?: string | null
          residuary_estate?: string | null
          sentimental_distribution?: string | null
          sentimental_items?: string | null
          specific_bequests?: Json | null
          spouse_contact?: string | null
          spouse_name?: string | null
          subscriptions?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          allow_admin_access?: boolean
          attorney_contact?: string | null
          attorney_firm?: string | null
          attorney_name?: string | null
          backup_executor_contact?: string | null
          backup_executor_name?: string | null
          backup_guardian_contact?: string | null
          backup_guardian_name?: string | null
          burial_or_cremation?: string | null
          business_partner_company?: string | null
          business_partner_contact?: string | null
          business_partner_name?: string | null
          business_succession_plan?: string | null
          ceremony_preferences?: string | null
          charitable_giving?: string | null
          continuity_annual_reminder?: boolean
          continuity_notes?: string | null
          continuity_notes_encrypted?: string | null
          continuity_preference?: string | null
          continuity_preferences?: Json
          continuity_preferences_reviewed_at?: string | null
          continuity_preferences_version?: number
          created_at?: string
          crypto_passwords?: string | null
          debts_expenses?: string | null
          delegate_user_id?: string | null
          developmental_goals?: string | null
          digital_assets?: Json | null
          digital_identity?: string | null
          emotional_behavioral?: string | null
          encryption_key_encrypted_for_delegate?: string | null
          encryption_key_encrypted_for_user?: string | null
          ethical_will?: string | null
          executor_contact?: string | null
          executor_instructions?: string | null
          executor_name?: string | null
          executor_relationship?: string | null
          financial_advisor_contact?: string | null
          financial_advisor_firm?: string | null
          financial_advisor_name?: string | null
          financial_crypto?: string | null
          full_legal_name?: string | null
          funeral_wishes?: string | null
          general_bequests?: Json | null
          guardian_contact?: string | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          home_maintenance?: string | null
          household_operations?: string | null
          id?: string
          investment_advisor_name?: string | null
          investment_firm_contact?: string | null
          investment_firm_name?: string | null
          is_encrypted?: boolean
          legacy_messages?: string | null
          letters_to_children?: string | null
          letters_to_loved_ones?: string | null
          life_overview?: string | null
          medical_preferences?: string | null
          neighborhood_contacts?: string | null
          no_contest_clause?: boolean | null
          organ_donation?: boolean | null
          parenting_preferences?: string | null
          personal_philosophies?: string | null
          pet_care_instructions?: string | null
          photo_video_documentation?: string | null
          physical_documents?: string | null
          property_walkthrough?: string | null
          real_estate_instructions?: string | null
          recovery_grace_period_days?: number | null
          recovery_requested_at?: string | null
          recovery_status?: string | null
          rental_property?: string | null
          residuary_estate?: string | null
          sentimental_distribution?: string | null
          sentimental_items?: string | null
          specific_bequests?: Json | null
          spouse_contact?: string | null
          spouse_name?: string | null
          subscriptions?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      legacy_locker_files: {
        Row: {
          bucket_name: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          file_url: string
          folder_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          bucket_name: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          file_url: string
          folder_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          bucket_name?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          folder_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_locker_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "legacy_locker_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_locker_folders: {
        Row: {
          created_at: string
          description: string | null
          folder_name: string
          gradient_color: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          folder_name: string
          gradient_color?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          folder_name?: string
          gradient_color?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      legacy_locker_voice_notes: {
        Row: {
          audio_path: string | null
          audio_url: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          file_size: number | null
          id: string
          is_encrypted: boolean
          legacy_locker_id: string | null
          storage_bucket: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audio_path?: string | null
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          is_encrypted?: boolean
          legacy_locker_id?: string | null
          storage_bucket?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audio_path?: string | null
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          is_encrypted?: boolean
          legacy_locker_id?: string | null
          storage_bucket?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_locker_voice_notes_legacy_locker_id_fkey"
            columns: ["legacy_locker_id"]
            isOneToOne: false
            referencedRelation: "legacy_locker"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_agreement_signatures: {
        Row: {
          acknowledgments: Json | null
          agreement_type: string
          anonymized_at: string | null
          created_at: string
          deleted_account_id: string | null
          email_hash: string | null
          id: string
          ip_address: string | null
          signature_date: string | null
          signature_text: string | null
          signed_at: string | null
          signer_email: string | null
          signer_location: string | null
          signer_name: string | null
          signer_role: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          acknowledgments?: Json | null
          agreement_type: string
          anonymized_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          email_hash?: string | null
          id?: string
          ip_address?: string | null
          signature_date?: string | null
          signature_text?: string | null
          signed_at?: string | null
          signer_email?: string | null
          signer_location?: string | null
          signer_name?: string | null
          signer_role: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          acknowledgments?: Json | null
          agreement_type?: string
          anonymized_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          email_hash?: string | null
          id?: string
          ip_address?: string | null
          signature_date?: string | null
          signature_text?: string | null
          signed_at?: string | null
          signer_email?: string | null
          signer_location?: string | null
          signer_name?: string | null
          signer_role?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_agreement_signatures_deleted_account_id_fkey"
            columns: ["deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_terms_versions: {
        Row: {
          created_at: string
          current_version: string
          effective_at: string
          id: string
          is_active: boolean
          notes: string | null
        }
        Insert: {
          created_at?: string
          current_version: string
          effective_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
        }
        Update: {
          created_at?: string
          current_version?: string
          effective_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
        }
        Relationships: []
      }
      lifetime_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number
          times_redeemed: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          times_redeemed?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          times_redeemed?: number
          updated_at?: string
        }
        Relationships: []
      }
      manual_damage_entries: {
        Row: {
          claim_number: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          damage_type: string
          date_occurred: string | null
          description: string | null
          emergency_services: boolean | null
          estimated_cost: string | null
          id: string
          insurance_company: string | null
          is_archived: boolean | null
          location: string | null
          name: string
          policy_number: string | null
          priority_level: string | null
          property_id: string
          repairs_needed: string | null
          severity: string
          updated_at: string
          user_id: string
        }
        Insert: {
          claim_number?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          damage_type: string
          date_occurred?: string | null
          description?: string | null
          emergency_services?: boolean | null
          estimated_cost?: string | null
          id?: string
          insurance_company?: string | null
          is_archived?: boolean | null
          location?: string | null
          name: string
          policy_number?: string | null
          priority_level?: string | null
          property_id: string
          repairs_needed?: string | null
          severity?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          claim_number?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          damage_type?: string
          date_occurred?: string | null
          description?: string | null
          emergency_services?: boolean | null
          estimated_cost?: string | null
          id?: string
          insurance_company?: string | null
          is_archived?: boolean | null
          location?: string | null
          name?: string
          policy_number?: string | null
          priority_level?: string | null
          property_id?: string
          repairs_needed?: string | null
          severity?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_damage_entries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      memorialized_accounts: {
        Row: {
          account_id: string
          billing_handling_status: string
          export_allowed: boolean
          id: string
          memorialized_at: string
          memorialized_by_admin_id: string | null
          reason: string | null
          request_id: string | null
          status: string
          steward_access_level: string
        }
        Insert: {
          account_id: string
          billing_handling_status?: string
          export_allowed?: boolean
          id?: string
          memorialized_at?: string
          memorialized_by_admin_id?: string | null
          reason?: string | null
          request_id?: string | null
          status?: string
          steward_access_level?: string
        }
        Update: {
          account_id?: string
          billing_handling_status?: string
          export_allowed?: boolean
          id?: string
          memorialized_at?: string
          memorialized_by_admin_id?: string | null
          reason?: string | null
          request_id?: string | null
          status?: string
          steward_access_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "memorialized_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorialized_accounts_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "account_continuity_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_safe_folders: {
        Row: {
          created_at: string
          description: string | null
          folder_name: string
          gradient_color: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          folder_name: string
          gradient_color?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          folder_name?: string
          gradient_color?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_safe_items: {
        Row: {
          created_at: string
          delete_attempts: number
          delete_error: string | null
          delete_processing_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          file_url: string | null
          folder_id: string | null
          id: string
          pending_delete: boolean
          pending_delete_at: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id?: string | null
          id?: string
          pending_delete?: boolean
          pending_delete_at?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id?: string | null
          id?: string
          pending_delete?: boolean
          pending_delete_at?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mfa_attempt_log: {
        Row: {
          created_at: string
          id: string
          ip: string | null
          kind: string
          metadata: Json
          outcome: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip?: string | null
          kind: string
          metadata?: Json
          outcome: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string | null
          kind?: string
          metadata?: Json
          outcome?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mfa_step_up_sessions: {
        Row: {
          action: string | null
          consumed_at: string | null
          consumed_by: string | null
          created_at: string
          id: string
          ip: string | null
          last_step_up_at: string
          method: string
          nonce: string | null
          stepped_up_until: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action?: string | null
          consumed_at?: string | null
          consumed_by?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          last_step_up_at?: string
          method: string
          nonce?: string | null
          stepped_up_until: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string | null
          consumed_at?: string | null
          consumed_by?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          last_step_up_at?: string
          method?: string
          nonce?: string | null
          stepped_up_until?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monitoring_alert_policies: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          monitor_key: string
          monitor_label: string
          owner_team: string
          page_channel: string
          page_rule: string
          runbook_url: string | null
          updated_at: string
          warn_rule: string
          warning_channel: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          monitor_key: string
          monitor_label: string
          owner_team?: string
          page_channel?: string
          page_rule: string
          runbook_url?: string | null
          updated_at?: string
          warn_rule: string
          warning_channel?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          monitor_key?: string
          monitor_label?: string
          owner_team?: string
          page_channel?: string
          page_rule?: string
          runbook_url?: string | null
          updated_at?: string
          warn_rule?: string
          warning_channel?: string
        }
        Relationships: []
      }
      notes_traditions: {
        Row: {
          bucket_name: string | null
          content: string | null
          created_at: string
          delete_attempts: number
          delete_error: string | null
          delete_processing_at: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_url: string | null
          holiday: string | null
          id: string
          pending_delete: boolean
          pending_delete_at: string | null
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket_name?: string | null
          content?: string | null
          created_at?: string
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          holiday?: string | null
          id?: string
          pending_delete?: boolean
          pending_delete_at?: string | null
          subject?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket_name?: string | null
          content?: string | null
          created_at?: string
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          holiday?: string | null
          id?: string
          pending_delete?: boolean
          pending_delete_at?: string | null
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          authorized_user_access_alerts: boolean
          billing_notifications: boolean
          created_at: string
          email_notifications: boolean
          id: string
          marketing_communications: boolean
          property_updates: boolean
          security_alerts: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          authorized_user_access_alerts?: boolean
          billing_notifications?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          marketing_communications?: boolean
          property_updates?: boolean
          security_alerts?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          authorized_user_access_alerts?: boolean
          billing_notifications?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          marketing_communications?: boolean
          property_updates?: boolean
          security_alerts?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ownership_transfer_history: {
        Row: {
          account_id: string
          audit_log_reference: string | null
          created_at: string
          executed_by_admin_id: string
          execution_timestamp: string
          id: string
          new_owner_id: string
          new_owner_role: string
          notes: string | null
          previous_owner_final_state: string
          previous_owner_id: string
          request_id: string | null
          rollback_eligible: boolean
          senior_approver_id: string | null
          snapshot_reference: string | null
          transfer_reason: string | null
          transfer_type: string
        }
        Insert: {
          account_id: string
          audit_log_reference?: string | null
          created_at?: string
          executed_by_admin_id: string
          execution_timestamp?: string
          id?: string
          new_owner_id: string
          new_owner_role?: string
          notes?: string | null
          previous_owner_final_state?: string
          previous_owner_id: string
          request_id?: string | null
          rollback_eligible?: boolean
          senior_approver_id?: string | null
          snapshot_reference?: string | null
          transfer_reason?: string | null
          transfer_type?: string
        }
        Update: {
          account_id?: string
          audit_log_reference?: string | null
          created_at?: string
          executed_by_admin_id?: string
          execution_timestamp?: string
          id?: string
          new_owner_id?: string
          new_owner_role?: string
          notes?: string | null
          previous_owner_final_state?: string
          previous_owner_id?: string
          request_id?: string | null
          rollback_eligible?: boolean
          senior_approver_id?: string | null
          snapshot_reference?: string | null
          transfer_reason?: string | null
          transfer_type?: string
        }
        Relationships: []
      }
      paint_codes: {
        Row: {
          created_at: string
          delete_attempts: number
          delete_error: string | null
          delete_processing_at: string | null
          id: string
          is_interior: boolean
          paint_brand: string
          paint_code: string
          paint_name: string
          pending_delete: boolean
          pending_delete_at: string | null
          property_id: string | null
          room_location: string | null
          swatch_image_path: string | null
          swatch_image_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          id?: string
          is_interior?: boolean
          paint_brand: string
          paint_code: string
          paint_name: string
          pending_delete?: boolean
          pending_delete_at?: string | null
          property_id?: string | null
          room_location?: string | null
          swatch_image_path?: string | null
          swatch_image_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          id?: string
          is_interior?: boolean
          paint_brand?: string
          paint_code?: string
          paint_name?: string
          pending_delete?: boolean
          pending_delete_at?: string | null
          property_id?: string | null
          room_location?: string | null
          swatch_image_path?: string | null
          swatch_image_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paint_codes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      password_catalog: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          password: string
          updated_at: string
          user_id: string
          username: string | null
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
          username?: string | null
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
          username?: string | null
          website_name?: string
          website_url?: string
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount: number | null
          anonymized_at: string | null
          created_at: string
          currency: string | null
          customer_id: string | null
          deleted_account_id: string | null
          email_hash: string | null
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
          anonymized_at?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          deleted_account_id?: string | null
          email_hash?: string | null
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
          anonymized_at?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          deleted_account_id?: string | null
          email_hash?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          processed_at?: string | null
          status?: string | null
          stripe_event_id?: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_deleted_account_id_fkey"
            columns: ["deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_folders: {
        Row: {
          account_id: string
          created_at: string
          description: string | null
          folder_name: string
          gradient_color: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description?: string | null
          folder_name: string
          gradient_color?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string | null
          folder_name?: string
          gradient_color?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_folders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      photographer_interest: {
        Row: {
          additional_notes: string | null
          business_name: string | null
          city_state: string
          created_at: string
          currently_active: boolean
          email: string
          full_name: string
          id: string
          phone: string
          primary_service_area: string
          website_url: string | null
          years_experience: string
        }
        Insert: {
          additional_notes?: string | null
          business_name?: string | null
          city_state: string
          created_at?: string
          currently_active?: boolean
          email: string
          full_name: string
          id?: string
          phone: string
          primary_service_area: string
          website_url?: string | null
          years_experience: string
        }
        Update: {
          additional_notes?: string | null
          business_name?: string | null
          city_state?: string
          created_at?: string
          currently_active?: boolean
          email?: string
          full_name?: string
          id?: string
          phone?: string
          primary_service_area?: string
          website_url?: string | null
          years_experience?: string
        }
        Relationships: []
      }
      preservation_states: {
        Row: {
          account_id: string
          applied_at: string
          applied_by_admin_id: string | null
          id: string
          reason: string | null
          request_id: string | null
          restrictions: Json
          state_type: string
          status: string
        }
        Insert: {
          account_id: string
          applied_at?: string
          applied_by_admin_id?: string | null
          id?: string
          reason?: string | null
          request_id?: string | null
          restrictions?: Json
          state_type: string
          status?: string
        }
        Update: {
          account_id?: string
          applied_at?: string
          applied_by_admin_id?: string | null
          id?: string
          reason?: string | null
          request_id?: string | null
          restrictions?: Json
          state_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "preservation_states_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preservation_states_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "account_continuity_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_number: string | null
          account_status: string
          avatar_url: string | null
          bio: string | null
          cancellation_notice_sent_at: string | null
          created_at: string
          current_period_end: string | null
          first_name: string | null
          grace_period_ends_at: string | null
          household_income: string | null
          id: string
          last_name: string | null
          last_used_account_id: string | null
          mfa_enabled_email_sent_at: string | null
          onboarding_complete: boolean
          password_set: boolean
          payment_failed_at: string | null
          phone: string | null
          phone_verified: boolean | null
          phone_verified_at: string | null
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
          account_status?: string
          avatar_url?: string | null
          bio?: string | null
          cancellation_notice_sent_at?: string | null
          created_at?: string
          current_period_end?: string | null
          first_name?: string | null
          grace_period_ends_at?: string | null
          household_income?: string | null
          id?: string
          last_name?: string | null
          last_used_account_id?: string | null
          mfa_enabled_email_sent_at?: string | null
          onboarding_complete?: boolean
          password_set?: boolean
          payment_failed_at?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
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
          account_status?: string
          avatar_url?: string | null
          bio?: string | null
          cancellation_notice_sent_at?: string | null
          created_at?: string
          current_period_end?: string | null
          first_name?: string | null
          grace_period_ends_at?: string | null
          household_income?: string | null
          id?: string
          last_name?: string | null
          last_used_account_id?: string | null
          mfa_enabled_email_sent_at?: string | null
          onboarding_complete?: boolean
          password_set?: boolean
          payment_failed_at?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          plan_id?: string | null
          plan_status?: string | null
          property_limit?: number | null
          storage_quota_gb?: number | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_last_used_account_id_fkey"
            columns: ["last_used_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          created_at: string | null
          delete_attempts: number
          estimated_value: number | null
          id: string
          last_delete_error: string | null
          last_updated: string | null
          lease_expires_at: string | null
          lease_token: string | null
          name: string
          pending_delete: boolean
          pending_delete_at: string | null
          square_footage: number | null
          type: string
          updated_at: string | null
          user_id: string
          year_built: number | null
        }
        Insert: {
          address: string
          created_at?: string | null
          delete_attempts?: number
          estimated_value?: number | null
          id?: string
          last_delete_error?: string | null
          last_updated?: string | null
          lease_expires_at?: string | null
          lease_token?: string | null
          name: string
          pending_delete?: boolean
          pending_delete_at?: string | null
          square_footage?: number | null
          type: string
          updated_at?: string | null
          user_id: string
          year_built?: number | null
        }
        Update: {
          address?: string
          created_at?: string | null
          delete_attempts?: number
          estimated_value?: number | null
          id?: string
          last_delete_error?: string | null
          last_updated?: string | null
          lease_expires_at?: string | null
          lease_token?: string | null
          name?: string
          pending_delete?: boolean
          pending_delete_at?: string | null
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
          damage_report_id: string | null
          delete_attempts: number
          delete_error: string | null
          delete_processing_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          file_url: string
          folder_id: string | null
          id: string
          is_high_value: boolean
          item_values: Json | null
          pending_delete: boolean
          pending_delete_at: string | null
          property_id: string
          source: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          bucket_name: string
          created_at?: string | null
          damage_report_id?: string | null
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          file_url: string
          folder_id?: string | null
          id?: string
          is_high_value?: boolean
          item_values?: Json | null
          pending_delete?: boolean
          pending_delete_at?: string | null
          property_id: string
          source?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          bucket_name?: string
          created_at?: string | null
          damage_report_id?: string | null
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          folder_id?: string | null
          id?: string
          is_high_value?: boolean
          item_values?: Json | null
          pending_delete?: boolean
          pending_delete_at?: string | null
          property_id?: string
          source?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_files_damage_report_id_fkey"
            columns: ["damage_report_id"]
            isOneToOne: false
            referencedRelation: "damage_reports"
            referencedColumns: ["id"]
          },
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
      recovery_requests: {
        Row: {
          created_at: string
          delegate_user_id: string
          documentation_url: string | null
          grace_period_ends_at: string
          id: string
          legacy_locker_id: string
          owner_user_id: string
          reason: string | null
          relationship: string | null
          requested_at: string
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delegate_user_id: string
          documentation_url?: string | null
          grace_period_ends_at: string
          id?: string
          legacy_locker_id: string
          owner_user_id: string
          reason?: string | null
          relationship?: string | null
          requested_at?: string
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delegate_user_id?: string
          documentation_url?: string | null
          grace_period_ends_at?: string
          id?: string
          legacy_locker_id?: string
          owner_user_id?: string
          reason?: string | null
          relationship?: string | null
          requested_at?: string
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_legacy_locker"
            columns: ["legacy_locker_id"]
            isOneToOne: false
            referencedRelation: "legacy_locker"
            referencedColumns: ["id"]
          },
        ]
      }
      restore_drill_runs: {
        Row: {
          approved_by_user_id: string | null
          auth_smoke_passed: boolean
          completed_at: string | null
          created_at: string
          db_smoke_passed: boolean
          drill_type: string
          edge_smoke_passed: boolean
          environment: string
          findings: string[]
          follow_up_actions: string[]
          id: string
          notes: string | null
          operator_user_id: string | null
          restore_point_at: string | null
          rpo_minutes: number | null
          rto_minutes: number | null
          runbook_version: string
          signed_url_smoke_passed: boolean
          source_project_ref: string | null
          started_at: string | null
          status: string
          storage_smoke_passed: boolean
          target_project_ref: string | null
          updated_at: string
        }
        Insert: {
          approved_by_user_id?: string | null
          auth_smoke_passed?: boolean
          completed_at?: string | null
          created_at?: string
          db_smoke_passed?: boolean
          drill_type?: string
          edge_smoke_passed?: boolean
          environment?: string
          findings?: string[]
          follow_up_actions?: string[]
          id?: string
          notes?: string | null
          operator_user_id?: string | null
          restore_point_at?: string | null
          rpo_minutes?: number | null
          rto_minutes?: number | null
          runbook_version?: string
          signed_url_smoke_passed?: boolean
          source_project_ref?: string | null
          started_at?: string | null
          status?: string
          storage_smoke_passed?: boolean
          target_project_ref?: string | null
          updated_at?: string
        }
        Update: {
          approved_by_user_id?: string | null
          auth_smoke_passed?: boolean
          completed_at?: string | null
          created_at?: string
          db_smoke_passed?: boolean
          drill_type?: string
          edge_smoke_passed?: boolean
          environment?: string
          findings?: string[]
          follow_up_actions?: string[]
          id?: string
          notes?: string | null
          operator_user_id?: string | null
          restore_point_at?: string | null
          rpo_minutes?: number | null
          rto_minutes?: number | null
          runbook_version?: string
          signed_url_smoke_passed?: boolean
          source_project_ref?: string | null
          started_at?: string | null
          status?: string
          storage_smoke_passed?: boolean
          target_project_ref?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_provider_contacts: {
        Row: {
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          id: string
          role: string | null
          service_provider_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          role?: string | null
          service_provider_id: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          role?: string | null
          service_provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_contacts_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider_projects: {
        Row: {
          created_at: string
          date_of_work: string | null
          id: string
          notes: string | null
          project_cost: number | null
          satisfaction_rating: number | null
          service_provider_id: string
          work_completed: string
        }
        Insert: {
          created_at?: string
          date_of_work?: string | null
          id?: string
          notes?: string | null
          project_cost?: number | null
          satisfaction_rating?: number | null
          service_provider_id: string
          work_completed: string
        }
        Update: {
          created_at?: string
          date_of_work?: string | null
          id?: string
          notes?: string | null
          project_cost?: number | null
          satisfaction_rating?: number | null
          service_provider_id?: string
          work_completed?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_projects_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          address: string | null
          company_name: string
          company_website: string | null
          created_at: string
          id: string
          notes: string | null
          property_id: string | null
          service_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company_name: string
          company_website?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string | null
          service_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company_name?: string
          company_website?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string | null
          service_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      source_websites: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          updated_at: string
          user_id: string
          website_name: string
          website_url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          user_id: string
          website_name: string
          website_url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          website_name?: string
          website_url?: string
        }
        Relationships: []
      }
      storage_bucket_lifecycle_policies: {
        Row: {
          bucket: string
          cleanup_owner: string
          created_at: string
          data_class: string
          expected_public: boolean
          launch_required: boolean
          lifecycle_days: number | null
          notes: string | null
          retention_rule: string
          updated_at: string
        }
        Insert: {
          bucket: string
          cleanup_owner: string
          created_at?: string
          data_class: string
          expected_public?: boolean
          launch_required?: boolean
          lifecycle_days?: number | null
          notes?: string | null
          retention_rule: string
          updated_at?: string
        }
        Update: {
          bucket?: string
          cleanup_owner?: string
          created_at?: string
          data_class?: string
          expected_public?: boolean
          launch_required?: boolean
          lifecycle_days?: number | null
          notes?: string | null
          retention_rule?: string
          updated_at?: string
        }
        Relationships: []
      }
      storage_deletion_jobs: {
        Row: {
          account_id: string | null
          attempt_count: number
          bucket: string
          completed_at: string | null
          created_at: string
          deleted_account_id: string | null
          id: string
          last_attempt_at: string | null
          last_error: string | null
          next_attempt_at: string
          object_path: string
          owner_user_id: string | null
          processing_started_at: string | null
          source: string | null
          source_table: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          attempt_count?: number
          bucket: string
          completed_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          next_attempt_at?: string
          object_path: string
          owner_user_id?: string | null
          processing_started_at?: string | null
          source?: string | null
          source_table?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          attempt_count?: number
          bucket?: string
          completed_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          next_attempt_at?: string
          object_path?: string
          owner_user_id?: string | null
          processing_started_at?: string | null
          source?: string | null
          source_table?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_deletion_jobs_deleted_account_id_fkey"
            columns: ["deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_orphan_candidates: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bucket: string
          created_at: string
          first_seen_at: string
          id: string
          last_seen_at: string
          notes: string | null
          object_created_at: string | null
          object_path: string
          object_size_bytes: number | null
          queued_at: string | null
          resolved_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bucket: string
          created_at?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          notes?: string | null
          object_created_at?: string | null
          object_path: string
          object_size_bytes?: number | null
          queued_at?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bucket?: string
          created_at?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          notes?: string | null
          object_created_at?: string | null
          object_path?: string
          object_size_bytes?: number | null
          queued_at?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
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
      storage_usage_reconciliation_state: {
        Row: {
          last_corrected: boolean
          last_drift_bytes: number
          last_drift_ratio: number
          last_reconciled_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          last_corrected?: boolean
          last_drift_bytes?: number
          last_drift_ratio?: number
          last_reconciled_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          last_corrected?: boolean
          last_drift_bytes?: number
          last_drift_ratio?: number
          last_reconciled_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stripe_dispute_reviews: {
        Row: {
          access_action_status: string
          amount: number | null
          closed_at: string | null
          created_at: string
          currency: string | null
          customer_email: string | null
          evidence_due_by: string | null
          id: string
          latest_event_id: string | null
          opened_at: string | null
          outcome: string | null
          raw_payload: Json | null
          reason: string | null
          status: string | null
          stripe_charge_id: string | null
          stripe_customer_id: string | null
          stripe_dispute_id: string
          stripe_payment_intent_id: string | null
          support_issue_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_action_status?: string
          amount?: number | null
          closed_at?: string | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          evidence_due_by?: string | null
          id?: string
          latest_event_id?: string | null
          opened_at?: string | null
          outcome?: string | null
          raw_payload?: Json | null
          reason?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_dispute_id: string
          stripe_payment_intent_id?: string | null
          support_issue_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_action_status?: string
          amount?: number | null
          closed_at?: string | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          evidence_due_by?: string | null
          id?: string
          latest_event_id?: string | null
          opened_at?: string | null
          outcome?: string | null
          raw_payload?: Json | null
          reason?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_dispute_id?: string
          stripe_payment_intent_id?: string | null
          support_issue_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_dispute_reviews_support_issue_id_fkey"
            columns: ["support_issue_id"]
            isOneToOne: false
            referencedRelation: "dev_support_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_event_replay_requests: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          notes: string | null
          processed_at: string | null
          requested_at: string
          requested_by: string | null
          result_outcome: string | null
          status: string
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_at?: string
          requested_by?: string | null
          result_outcome?: string | null
          status?: string
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_at?: string
          requested_by?: string | null
          result_outcome?: string | null
          status?: string
          stripe_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_event_replay_requests_stripe_event_id_fkey"
            columns: ["stripe_event_id"]
            isOneToOne: false
            referencedRelation: "stripe_events"
            referencedColumns: ["stripe_event_id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          last_error_at: string | null
          last_replayed_at: string | null
          outcome: string | null
          payload: Json | null
          processed_at: string
          replay_request_count: number
          replay_requested_at: string | null
          replay_requested_by: string | null
          replay_status: string
          status: string
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          last_error_at?: string | null
          last_replayed_at?: string | null
          outcome?: string | null
          payload?: Json | null
          processed_at?: string
          replay_request_count?: number
          replay_requested_at?: string | null
          replay_requested_by?: string | null
          replay_status?: string
          status?: string
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          last_error_at?: string | null
          last_replayed_at?: string | null
          outcome?: string | null
          payload?: Json | null
          processed_at?: string
          replay_request_count?: number
          replay_requested_at?: string | null
          replay_requested_by?: string | null
          replay_status?: string
          status?: string
          stripe_event_id?: string
        }
        Relationships: []
      }
      stripe_refund_reviews: {
        Row: {
          access_action_status: string
          amount: number | null
          created_at: string
          currency: string | null
          customer_email: string | null
          id: string
          latest_event_id: string | null
          manual_review_status: string
          outcome: string | null
          raw_payload: Json | null
          reason: string | null
          status: string | null
          stripe_charge_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_refund_id: string
          support_issue_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_action_status?: string
          amount?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          id?: string
          latest_event_id?: string | null
          manual_review_status?: string
          outcome?: string | null
          raw_payload?: Json | null
          reason?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id: string
          support_issue_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_action_status?: string
          amount?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          id?: string
          latest_event_id?: string | null
          manual_review_status?: string
          outcome?: string | null
          raw_payload?: Json | null
          reason?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string
          support_issue_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_refund_reviews_support_issue_id_fkey"
            columns: ["support_issue_id"]
            isOneToOne: false
            referencedRelation: "dev_support_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          anonymized_at: string | null
          created_at: string
          deleted_account_id: string | null
          email: string | null
          email_hash: string | null
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
          user_id: string | null
        }
        Insert: {
          anonymized_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          email?: string | null
          email_hash?: string | null
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
          user_id?: string | null
        }
        Update: {
          anonymized_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          email?: string | null
          email_hash?: string | null
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
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_deleted_account_id_fkey"
            columns: ["deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_cancellations: {
        Row: {
          account_id: string | null
          anonymized_at: string | null
          cancelled_at: string
          comments: string | null
          created_at: string
          deleted_account_id: string | null
          email_hash: string | null
          id: string
          owner_user_id: string | null
          period_end: string | null
          plan: string | null
          reason: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          account_id?: string | null
          anonymized_at?: string | null
          cancelled_at?: string
          comments?: string | null
          created_at?: string
          deleted_account_id?: string | null
          email_hash?: string | null
          id?: string
          owner_user_id?: string | null
          period_end?: string | null
          plan?: string | null
          reason?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          account_id?: string | null
          anonymized_at?: string | null
          cancelled_at?: string
          comments?: string | null
          created_at?: string
          deleted_account_id?: string | null
          email_hash?: string | null
          id?: string
          owner_user_id?: string | null
          period_end?: string | null
          plan?: string | null
          reason?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_cancellations_deleted_account_id_fkey"
            columns: ["deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_email_events: {
        Row: {
          account_id: string | null
          created_at: string
          event_type: string
          id: string
          idempotency_key: string | null
          recipient_email: string
          resend_message_id: string | null
          sent_at: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          idempotency_key?: string | null
          recipient_email: string
          resend_message_id?: string | null
          sent_at?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          idempotency_key?: string | null
          recipient_email?: string
          resend_message_id?: string | null
          sent_at?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_maintenance_windows: {
        Row: {
          created_at: string
          created_by: string | null
          ended_by: string | null
          ends_at: string | null
          id: string
          message: string | null
          metadata: Json
          reason: string
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ended_by?: string | null
          ends_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json
          reason: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ended_by?: string | null
          ends_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json
          reason?: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      tax_return_folders: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          folder_name: string
          gradient_color: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          folder_name: string
          gradient_color?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          folder_name?: string
          gradient_color?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_returns: {
        Row: {
          bucket_name: string
          created_at: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          folder_id: string | null
          id: string
          notes: string | null
          tags: string | null
          tax_year: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket_name?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id?: string | null
          id?: string
          notes?: string | null
          tags?: string | null
          tax_year?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket_name?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id?: string | null
          id?: string
          notes?: string | null
          tags?: string | null
          tax_year?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_returns_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "tax_return_folders"
            referencedColumns: ["id"]
          },
        ]
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
      trust_information: {
        Row: {
          amendment_count: number | null
          attorney_email: string | null
          attorney_firm: string | null
          attorney_name: string | null
          attorney_phone: string | null
          beneficiaries: Json | null
          cpa_email: string | null
          cpa_firm: string | null
          cpa_name: string | null
          cpa_phone: string | null
          created_at: string
          current_trustees: Json | null
          effective_date: string | null
          grantors: Json | null
          id: string
          is_encrypted: boolean
          keyholder_contact: string | null
          keyholder_name: string | null
          originals_location: string | null
          physical_access_instructions: string | null
          successor_trustees: Json | null
          trust_assets: Json | null
          trust_documents: Json | null
          trust_name: string | null
          trust_purpose: string | null
          trust_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amendment_count?: number | null
          attorney_email?: string | null
          attorney_firm?: string | null
          attorney_name?: string | null
          attorney_phone?: string | null
          beneficiaries?: Json | null
          cpa_email?: string | null
          cpa_firm?: string | null
          cpa_name?: string | null
          cpa_phone?: string | null
          created_at?: string
          current_trustees?: Json | null
          effective_date?: string | null
          grantors?: Json | null
          id?: string
          is_encrypted?: boolean
          keyholder_contact?: string | null
          keyholder_name?: string | null
          originals_location?: string | null
          physical_access_instructions?: string | null
          successor_trustees?: Json | null
          trust_assets?: Json | null
          trust_documents?: Json | null
          trust_name?: string | null
          trust_purpose?: string | null
          trust_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amendment_count?: number | null
          attorney_email?: string | null
          attorney_firm?: string | null
          attorney_name?: string | null
          attorney_phone?: string | null
          beneficiaries?: Json | null
          cpa_email?: string | null
          cpa_firm?: string | null
          cpa_name?: string | null
          cpa_phone?: string | null
          created_at?: string
          current_trustees?: Json | null
          effective_date?: string | null
          grantors?: Json | null
          id?: string
          is_encrypted?: boolean
          keyholder_contact?: string | null
          keyholder_name?: string | null
          originals_location?: string | null
          physical_access_instructions?: string | null
          successor_trustees?: Json | null
          trust_assets?: Json | null
          trust_documents?: Json | null
          trust_name?: string | null
          trust_purpose?: string | null
          trust_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      upgrade_repair_vendors: {
        Row: {
          company_name: string
          contact_name: string | null
          created_at: string | null
          email: string | null
          id: string
          phone: string | null
          upgrade_repair_id: string
        }
        Insert: {
          company_name: string
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          upgrade_repair_id: string
        }
        Update: {
          company_name?: string
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          upgrade_repair_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upgrade_repair_vendors_upgrade_repair_id_fkey"
            columns: ["upgrade_repair_id"]
            isOneToOne: false
            referencedRelation: "upgrade_repairs"
            referencedColumns: ["id"]
          },
        ]
      }
      upgrade_repairs: {
        Row: {
          created_at: string | null
          date_completed: string | null
          description: string | null
          id: string
          item_cost: number | null
          labor_cost: number | null
          location: string | null
          notes: string | null
          property_id: string | null
          repair_type: string | null
          title: string
          total_cost: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_completed?: string | null
          description?: string | null
          id?: string
          item_cost?: number | null
          labor_cost?: number | null
          location?: string | null
          notes?: string | null
          property_id?: string | null
          repair_type?: string | null
          title: string
          total_cost?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_completed?: string | null
          description?: string | null
          id?: string
          item_cost?: number | null
          labor_cost?: number | null
          location?: string | null
          notes?: string | null
          property_id?: string | null
          repair_type?: string | null
          title?: string
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upgrade_repairs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action_category: string
          action_type: string
          actor_user_id: string | null
          anonymized_at: string | null
          created_at: string
          deleted_account_id: string | null
          details: Json | null
          email_hash: string | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_name: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_category: string
          action_type: string
          actor_user_id?: string | null
          anonymized_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          details?: Json | null
          email_hash?: string | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_category?: string
          action_type?: string
          actor_user_id?: string | null
          anonymized_at?: string | null
          created_at?: string
          deleted_account_id?: string | null
          details?: Json | null
          email_hash?: string | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_deleted_account_id_fkey"
            columns: ["deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consents: {
        Row: {
          anonymized_at: string | null
          consent_type: string
          created_at: string
          deleted_account_id: string | null
          email_hash: string | null
          id: string
          ip_address: string | null
          terms_version: string
          user_email: string
        }
        Insert: {
          anonymized_at?: string | null
          consent_type: string
          created_at?: string
          deleted_account_id?: string | null
          email_hash?: string | null
          id?: string
          ip_address?: string | null
          terms_version?: string
          user_email: string
        }
        Update: {
          anonymized_at?: string | null
          consent_type?: string
          created_at?: string
          deleted_account_id?: string | null
          email_hash?: string | null
          id?: string
          ip_address?: string | null
          terms_version?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_consents_deleted_account_id_fkey"
            columns: ["deleted_account_id"]
            isOneToOne: false
            referencedRelation: "deleted_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_documents: {
        Row: {
          category: string
          created_at: string
          delete_attempts: number
          delete_error: string | null
          delete_processing_at: string | null
          description: string | null
          document_name: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          file_url: string
          folder_id: string | null
          id: string
          pending_delete: boolean
          pending_delete_at: string | null
          property_id: string | null
          tags: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          description?: string | null
          document_name?: string | null
          document_type?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          file_url: string
          folder_id?: string | null
          id?: string
          pending_delete?: boolean
          pending_delete_at?: string | null
          property_id?: string | null
          tags?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          description?: string | null
          document_name?: string | null
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          folder_id?: string | null
          id?: string
          pending_delete?: boolean
          pending_delete_at?: string | null
          property_id?: string | null
          tags?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notes: {
        Row: {
          bucket_name: string | null
          content: string
          created_at: string
          file_name: string | null
          file_path: string | null
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket_name?: string | null
          content: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket_name?: string | null
          content?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
      vault_delegate_grants: {
        Row: {
          created_at: string
          delegate_key_version: number
          delegate_user_id: string
          id: string
          issued_at: string
          legacy_locker_id: string
          owner_user_id: string
          recovery_request_id: string | null
          revoked_at: string | null
          status: string
          updated_at: string
          wrapped_vault_key: string
        }
        Insert: {
          created_at?: string
          delegate_key_version?: number
          delegate_user_id: string
          id?: string
          issued_at?: string
          legacy_locker_id: string
          owner_user_id: string
          recovery_request_id?: string | null
          revoked_at?: string | null
          status?: string
          updated_at?: string
          wrapped_vault_key: string
        }
        Update: {
          created_at?: string
          delegate_key_version?: number
          delegate_user_id?: string
          id?: string
          issued_at?: string
          legacy_locker_id?: string
          owner_user_id?: string
          recovery_request_id?: string | null
          revoked_at?: string | null
          status?: string
          updated_at?: string
          wrapped_vault_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_delegate_grants_legacy_locker_id_fkey"
            columns: ["legacy_locker_id"]
            isOneToOne: false
            referencedRelation: "legacy_locker"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_delegate_grants_recovery_request_id_fkey"
            columns: ["recovery_request_id"]
            isOneToOne: false
            referencedRelation: "recovery_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_delegate_keypairs: {
        Row: {
          created_at: string
          id: string
          key_version: number
          public_key_jwk: Json
          updated_at: string
          user_id: string
          wrap_iv: string
          wrapped_private_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_version?: number
          public_key_jwk: Json
          updated_at?: string
          user_id: string
          wrap_iv: string
          wrapped_private_key: string
        }
        Update: {
          created_at?: string
          id?: string
          key_version?: number
          public_key_jwk?: Json
          updated_at?: string
          user_id?: string
          wrap_iv?: string
          wrapped_private_key?: string
        }
        Relationships: []
      }
      video_folders: {
        Row: {
          created_at: string
          description: string | null
          folder_name: string
          gradient_color: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          folder_name: string
          gradient_color?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          folder_name?: string
          gradient_color?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vip_contact_attachments: {
        Row: {
          attachment_type: string
          contact_id: string
          created_at: string
          delete_attempts: number
          delete_error: string | null
          delete_processing_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          pending_delete: boolean
          pending_delete_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_type?: string
          contact_id: string
          created_at?: string
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          pending_delete?: boolean
          pending_delete_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_type?: string
          contact_id?: string
          created_at?: string
          delete_attempts?: number
          delete_error?: string | null
          delete_processing_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          pending_delete?: boolean
          pending_delete_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vip_contact_attachments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "vip_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_contacts: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          is_emergency_contact: boolean
          name: string
          notes: string | null
          phone: string | null
          priority: number
          relationship: string | null
          state: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_emergency_contact?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          priority?: number
          relationship?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_emergency_contact?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          priority?: number
          relationship?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      voice_note_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_encrypted: boolean
          legacy_locker_id: string | null
          storage_bucket: string
          updated_at: string | null
          user_id: string
          voice_note_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_encrypted?: boolean
          legacy_locker_id?: string | null
          storage_bucket?: string
          updated_at?: string | null
          user_id: string
          voice_note_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_encrypted?: boolean
          legacy_locker_id?: string | null
          storage_bucket?: string
          updated_at?: string | null
          user_id?: string
          voice_note_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_note_attachments_legacy_locker_id_fkey"
            columns: ["legacy_locker_id"]
            isOneToOne: false
            referencedRelation: "legacy_locker"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_note_attachments_voice_note_id_fkey"
            columns: ["voice_note_id"]
            isOneToOne: false
            referencedRelation: "legacy_locker_voice_notes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      cron_job_health_status: {
        Row: {
          consecutive_failures: number | null
          created_at: string | null
          description: string | null
          expected_interval_minutes: number | null
          health_status: string | null
          job_name: string | null
          last_duration_ms: number | null
          last_error: string | null
          last_failed_at: string | null
          last_result: Json | null
          last_started_at: string | null
          last_status: string | null
          last_succeeded_at: string | null
          minutes_since_success: number | null
          page_after_minutes: number | null
          updated_at: string | null
          warn_after_minutes: number | null
        }
        Insert: {
          consecutive_failures?: number | null
          created_at?: string | null
          description?: string | null
          expected_interval_minutes?: number | null
          health_status?: never
          job_name?: string | null
          last_duration_ms?: number | null
          last_error?: string | null
          last_failed_at?: string | null
          last_result?: Json | null
          last_started_at?: string | null
          last_status?: string | null
          last_succeeded_at?: string | null
          minutes_since_success?: never
          page_after_minutes?: number | null
          updated_at?: string | null
          warn_after_minutes?: number | null
        }
        Update: {
          consecutive_failures?: number | null
          created_at?: string | null
          description?: string | null
          expected_interval_minutes?: number | null
          health_status?: never
          job_name?: string | null
          last_duration_ms?: number | null
          last_error?: string | null
          last_failed_at?: string | null
          last_result?: Json | null
          last_started_at?: string | null
          last_status?: string | null
          last_succeeded_at?: string | null
          minutes_since_success?: never
          page_after_minutes?: number | null
          updated_at?: string | null
          warn_after_minutes?: number | null
        }
        Relationships: []
      }
      email_deliverability_health_status: {
        Row: {
          bounce_rate_24h: number | null
          bounced_24h: number | null
          complained_24h: number | null
          complaint_rate_24h: number | null
          delayed_24h: number | null
          description: string | null
          events_24h: number | null
          health_status: string | null
          latest_event_at: string | null
          latest_problem_at: string | null
          latest_problem_domain: string | null
          latest_problem_event_type: string | null
          monitor_name: string | null
          sent_or_delivered_24h: number | null
        }
        Relationships: []
      }
      profiles_safe: {
        Row: {
          account_number: string | null
          avatar_url: string | null
          first_name: string | null
          last_name: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_authoritative_consent: {
        Row: {
          consent_type: string | null
          created_at: string | null
          ip_address: string | null
          strength: number | null
          terms_version: string | null
          user_email: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _safe_uuid: { Args: { _text: string }; Returns: string }
      _storage_path_owner: { Args: { _name: string }; Returns: string }
      accept_invite_atomic: {
        Args: { _token_hash: string; _user_email: string; _user_id: string }
        Returns: Json
      }
      activate_maintenance_mode: {
        Args: {
          p_ends_at?: string
          p_message?: string
          p_metadata?: Json
          p_reason: string
        }
        Returns: string
      }
      admin_resolve_manual_review: {
        Args: {
          p_decision: string
          p_fulfillment_id: string
          p_notes?: string
          p_override_reason?: string
          p_override_user_id?: string
        }
        Returns: Json
      }
      anonymize_user_data: {
        Args: { p_deleted_by?: string; p_email: string; p_user_id: string }
        Returns: string
      }
      apply_account_closure_legal_hold: {
        Args: { p_closure_request_id: string; p_reason: string }
        Returns: {
          account_id: string | null
          anonymized_at: string | null
          comments: string | null
          completed_at: string | null
          created_at: string
          current_period_end: string | null
          deleted_account_id: string | null
          deletion_scheduled_date: string | null
          email_hash: string | null
          id: string
          legal_hold: boolean
          legal_hold_applied_at: string | null
          legal_hold_applied_by: string | null
          legal_hold_reason: string | null
          legal_hold_released_at: string | null
          legal_hold_released_by: string | null
          owner_user_id: string | null
          reason: string | null
          request_date: string
          reversed_at: string | null
          status: string
          subscription_status: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "account_closure_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_account_freeze: {
        Args: {
          _account_id: string
          _freeze_type: string
          _reason: string
          _request_id: string
        }
        Returns: string
      }
      apply_deleted_account_legal_hold: {
        Args: { p_deleted_account_id: string; p_reason?: string }
        Returns: {
          deleted_at: string
          deleted_by: string | null
          deletion_reason: string | null
          deletion_status: string
          email: string
          email_hash: string | null
          former_user_id_hash: string | null
          id: string
          legal_hold: boolean
          original_user_id: string | null
          retention_expires_at: string | null
          retention_purge_status: string
          retention_purged_at: string | null
          stripe_customer_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "deleted_accounts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      approve_closure_request: {
        Args: { _reason?: string; _request_id: string; _waiting_days?: number }
        Returns: string
      }
      assert_columns_in_diff_subset: {
        Args: { p_allowed: string[]; p_new: Json; p_old: Json }
        Returns: undefined
      }
      authorize_continuity_export: {
        Args: {
          _download_limit?: number
          _expires_at: string
          _internal_reason?: string
          _request_id: string
          _scope: Json
          _sensitive_areas_included?: boolean
        }
        Returns: string
      }
      bypass_waiting_period: {
        Args: { _reason: string; _request_id: string }
        Returns: undefined
      }
      calculate_user_storage_usage: {
        Args: { target_user_id: string }
        Returns: {
          bucket_name: string
          file_count: number
          total_size_bytes: number
        }[]
      }
      can_accept_au_invite: { Args: { _account_id: string }; Returns: boolean }
      can_access_vault_path: {
        Args: { _locker: string; _owner: string }
        Returns: boolean
      }
      can_send_au_invite: { Args: { _account_id: string }; Returns: boolean }
      cancel_closure: {
        Args: { _closure_id: string; _reason: string }
        Returns: string
      }
      check_gift_claim_rate_limit: {
        Args: { p_email: string; p_gift_code: string; p_ip_address: unknown }
        Returns: Json
      }
      claim_gift_subscription: { Args: { p_gift_code: string }; Returns: Json }
      claim_property_deletion: {
        Args: {
          p_caller: string
          p_lease_ttl_seconds?: number
          p_property_id: string
        }
        Returns: string
      }
      claim_property_file_delete: {
        Args: { p_file_id: string; p_now?: string; p_stale_before: string }
        Returns: boolean
      }
      cleanup_abandoned_gift_checkouts: {
        Args: { _older_than?: string }
        Returns: number
      }
      clear_last_used_account_if_revoked: {
        Args: { _account_id: string; _user_id: string }
        Returns: undefined
      }
      complete_closure: {
        Args: { _closure_id: string; _override?: boolean }
        Returns: string
      }
      complete_phone_verification: { Args: never; Returns: undefined }
      compute_continuity_readiness: {
        Args: { _user_id: string }
        Returns: Json
      }
      compute_user_verification: {
        Args: { target_user_id: string }
        Returns: Json
      }
      consume_account_export_bundle: {
        Args: { p_audit_id: string }
        Returns: {
          account_id: string
          audit_id: string
          bundle_file_name: string
          download_count: number
          download_limit: number
          expires_at: string
          signed_url_ttl_seconds: number
          storage_bucket: string
          storage_path: string
        }[]
      }
      consume_continuity_export_authorization: {
        Args: {
          _authorization_id: string
          _file_hash?: string
          _file_name?: string
          _file_size_bytes?: number
          _ip_address?: unknown
          _user_agent?: string
        }
        Returns: {
          account_id: string
          authorization_id: string
          download_count: number
          download_limit: number
          expires_at: string
          request_id: string
          scope: Json
          sensitive_areas_included: boolean
        }[]
      }
      create_account_export_bundle_request: {
        Args: {
          p_download_limit?: number
          p_export_type?: string
          p_file_count?: number
          p_metadata?: Json
          p_signed_url_ttl_seconds?: number
        }
        Returns: {
          audit_id: string
          download_limit: number
          expires_at: string
          storage_bucket: string
          storage_path: string
        }[]
      }
      create_continuity_snapshot: {
        Args: { _request_id: string }
        Returns: string
      }
      end_maintenance_mode: { Args: { p_id?: string }; Returns: number }
      enforce_continuity_execution_guard: {
        Args: { _request_id: string }
        Returns: undefined
      }
      execute_archive_custodian: {
        Args: {
          _expires_at: string
          _permissions: Json
          _reason: string
          _request_id: string
        }
        Returns: string
      }
      execute_memorialization: {
        Args: {
          _billing_handling_status?: string
          _export_allowed?: boolean
          _reason?: string
          _request_id: string
          _steward_access_level?: string
        }
        Returns: string
      }
      execute_ownership_transfer: {
        Args: {
          _reason: string
          _request_id: string
          _senior_approver_id: string
          _snapshot_reference: string
        }
        Returns: string
      }
      execute_preservation_mode: {
        Args: {
          _reason?: string
          _request_id: string
          _restrictions?: Json
          _state_type: string
        }
        Returns: string
      }
      execute_temporary_stewardship: {
        Args: {
          _expires_at: string
          _permissions: Json
          _reason: string
          _request_id: string
        }
        Returns: string
      }
      expire_account_export_bundles: {
        Args: { p_dry_run?: boolean; p_limit?: number }
        Returns: {
          audit_id: string
          storage_bucket: string
          storage_path: string
        }[]
      }
      expire_continuity_export_authorizations: { Args: never; Returns: number }
      expire_grace_periods: { Args: never; Returns: number }
      finalize_property_deletion: {
        Args: { p_lease_token: string; p_property_id: string }
        Returns: boolean
      }
      finalize_property_file_delete: {
        Args: { p_file_id: string }
        Returns: boolean
      }
      get_account_write_state: {
        Args: { p_account_id: string }
        Returns: {
          account_id: string
          is_read_only: boolean
          owner_account_status: string
          owner_user_id: string
        }[]
      }
      get_activation_funnel: {
        Args: never
        Returns: {
          activated: number
          activation_rate_pct: number
          signups: number
          wk: string
        }[]
      }
      get_active_maintenance_mode: {
        Args: never
        Returns: {
          ends_at: string
          id: string
          is_active: boolean
          message: string
          reason: string
          started_at: string
        }[]
      }
      get_admin_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_asset_values_page: {
        Args: {
          p_account_id: string
          p_cursor_id?: string
          p_cursor_ordinal?: number
          p_limit?: number
        }
        Returns: {
          category: string
          entry_date: string
          entry_id: string
          entry_name: string
          item_ordinal: number
          parent_name: string
          source: string
          value: number
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
      get_feature_adoption: {
        Args: never
        Returns: {
          adoption_percentage: number
          feature_name: string
          total_users: number
          users_with_feature: number
        }[]
      }
      get_gift_status_by_session_and_token: {
        Args: { _session_id: string; _token_hash: string }
        Returns: Json
      }
      get_leads_by_source: {
        Args: never
        Returns: {
          count: number
          source: string
        }[]
      }
      get_profiles_safe: {
        Args: never
        Returns: {
          account_number: string
          avatar_url: string
          first_name: string
          last_name: string
          user_id: string
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
      get_recent_activity_summary: {
        Args: never
        Returns: {
          action_count: number
          action_date: string
          last_action: string
          last_action_time: string
          user_id: string
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
      get_revenue_metrics: {
        Args: never
        Returns: {
          metric_name: string
          metric_period: string
          metric_value: number
        }[]
      }
      get_storage_bucket_lifecycle_status: {
        Args: never
        Returns: {
          actual_public: boolean
          bucket: string
          bucket_exists: boolean
          cleanup_owner: string
          data_class: string
          expected_public: boolean
          launch_required: boolean
          lifecycle_days: number
          notes: string
          public_matches: boolean
          retention_rule: string
        }[]
      }
      get_storage_stats: {
        Args: never
        Returns: {
          file_count: number
          storage_quota_gb: number
          total_used_bytes: number
          usage_percentage: number
          user_id: string
        }[]
      }
      get_trial_management_data: {
        Args: never
        Returns: {
          days_remaining: number
          email: string
          plan_status: string
          trial_end: string
          trial_reminder_sent: boolean
          user_id: string
        }[]
      }
      get_user_account_id: { Args: { _user_id: string }; Returns: string }
      get_user_engagement_stats: {
        Args: never
        Returns: {
          document_count: number
          engagement_score: number
          item_count: number
          photo_count: number
          property_count: number
          receipt_count: number
          total_item_value: number
          total_property_value: number
          user_id: string
        }[]
      }
      get_user_plan: { Args: { target_user_id: string }; Returns: string }
      get_vault_delegate_public_key: {
        Args: { p_delegate_user_id: string }
        Returns: {
          key_version: number
          public_key_jwk: Json
        }[]
      }
      has_account_access: {
        Args: { _min_role: string; _owner_user_id: string; _user_id: string }
        Returns: boolean
      }
      has_active_entitlement: {
        Args: { target_user_id: string }
        Returns: boolean
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
      has_contributor_access:
        | {
            Args: {
              _account_owner_id: string
              _required_role: Database["public"]["Enums"]["contributor_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              _required_role: Database["public"]["Enums"]["contributor_role"]
              _user_id: string
            }
            Returns: boolean
          }
      has_dev_workspace_access: { Args: { _user_id: string }; Returns: boolean }
      has_owner_workspace_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_account_member: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      is_account_owner: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      is_account_read_only: { Args: { _user_id: string }; Returns: boolean }
      is_active_legacy_admin: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      is_deleted_account_email: { Args: { p_email: string }; Returns: boolean }
      is_owner_account_writable: {
        Args: { _owner_user_id: string }
        Returns: boolean
      }
      is_service_role: { Args: never; Returns: boolean }
      is_system_maintenance_active: { Args: never; Returns: boolean }
      is_trusted_db_writer: { Args: never; Returns: boolean }
      log_account_export_audit: {
        Args: {
          p_error_message?: string
          p_export_type?: string
          p_file_count?: number
          p_metadata?: Json
          p_signed_url_ttl_seconds?: number
          p_status?: string
        }
        Returns: string
      }
      log_continuity_event: {
        Args: {
          _action_details?: Json
          _affected_account_id?: string
          _event_description: string
          _event_type: string
          _request_id: string
        }
        Returns: undefined
      }
      mark_account_export_bundle_ready: {
        Args: {
          p_audit_id: string
          p_bundle_file_name: string
          p_bundle_sha256?: string
          p_bundle_size_bytes?: number
          p_error_message?: string
          p_storage_bucket: string
          p_storage_path: string
        }
        Returns: string
      }
      process_deleted_account_retention: {
        Args: { p_dry_run?: boolean; p_limit?: number }
        Returns: Json
      }
      reconcile_storage_orphans: {
        Args: {
          p_limit?: number
          p_min_age?: string
          p_queue_approved?: boolean
        }
        Returns: Json
      }
      reconcile_storage_usage_drift: {
        Args: {
          p_limit?: number
          p_min_absolute_bytes?: number
          p_min_relative_ratio?: number
        }
        Returns: Json
      }
      record_cron_job_result: {
        Args: {
          p_duration_ms?: number
          p_error?: string
          p_job_name: string
          p_result?: Json
          p_status: string
        }
        Returns: undefined
      }
      record_cron_job_started: {
        Args: { p_job_name: string }
        Returns: undefined
      }
      redeem_gift: {
        Args: {
          _code: string
          _token_hash: string
          _user_email: string
          _user_id: string
        }
        Returns: Json
      }
      release_account_closure_legal_hold: {
        Args: { p_closure_request_id: string }
        Returns: {
          account_id: string | null
          anonymized_at: string | null
          comments: string | null
          completed_at: string | null
          created_at: string
          current_period_end: string | null
          deleted_account_id: string | null
          deletion_scheduled_date: string | null
          email_hash: string | null
          id: string
          legal_hold: boolean
          legal_hold_applied_at: string | null
          legal_hold_applied_by: string | null
          legal_hold_reason: string | null
          legal_hold_released_at: string | null
          legal_hold_released_by: string | null
          owner_user_id: string | null
          reason: string | null
          request_date: string
          reversed_at: string | null
          status: string
          subscription_status: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "account_closure_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      release_deleted_account_legal_hold: {
        Args: { p_deleted_account_id: string }
        Returns: {
          deleted_at: string
          deleted_by: string | null
          deletion_reason: string | null
          deletion_status: string
          email: string
          email_hash: string | null
          former_user_id_hash: string | null
          id: string
          legal_hold: boolean
          original_user_id: string | null
          retention_expires_at: string | null
          retention_purge_status: string
          retention_purged_at: string | null
          stripe_customer_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "deleted_accounts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      release_property_deletion_lease: {
        Args: { p_error: string; p_lease_token: string; p_property_id: string }
        Returns: boolean
      }
      release_property_file_delete: {
        Args: { p_error?: string; p_file_id: string }
        Returns: boolean
      }
      remove_account_freeze: {
        Args: { _freeze_id: string; _reason: string }
        Returns: undefined
      }
      renew_property_deletion_lease: {
        Args: {
          p_lease_token: string
          p_lease_ttl_seconds?: number
          p_property_id: string
        }
        Returns: boolean
      }
      request_stripe_event_replay: {
        Args: {
          p_notes?: string
          p_requested_by: string
          p_stripe_event_id: string
        }
        Returns: string
      }
      revoke_continuity_access: {
        Args: { _grant_id: string; _grant_type: string; _reason: string }
        Returns: undefined
      }
      set_memorialized_mode: {
        Args: { _account_id: string; _reason: string; _request_id?: string }
        Returns: undefined
      }
      set_my_last_used_account: {
        Args: { p_account_id: string }
        Returns: undefined
      }
      submit_continuity_dispute: {
        Args: { _reason: string; _token: string }
        Returns: Json
      }
      update_my_household_income: {
        Args: { p_household_income: number }
        Returns: undefined
      }
      update_my_profile: {
        Args: {
          p_bio?: string
          p_first_name?: string
          p_last_name?: string
          p_phone?: string
        }
        Returns: undefined
      }
      update_user_storage_usage: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      validate_service_role_context: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "sales"
        | "marketing"
        | "viewer"
        | "dev_lead"
        | "developer"
        | "qa"
        | "owner"
      calendar_event_category:
        | "home_property"
        | "maintenance_care"
        | "utilities_household"
        | "appliances_systems"
        | "warranties_coverage"
        | "property_lifecycle"
        | "compliance_filings"
        | "equipment_assets"
        | "subscriptions_auto_drafts"
        | "hr_admin"
        | "tenant_lifecycle"
        | "inspections_turnover"
        | "rent_financial"
        | "legal_compliance"
        | "legal_document_reviews"
        | "authorized_user_reviews"
        | "legacy_emergency_planning"
      contributor_role: "administrator" | "contributor" | "viewer"
      dev_blocker_status: "open" | "resolved" | "deferred"
      dev_blocker_type:
        | "owner_question"
        | "dependency"
        | "technical"
        | "external"
      dev_bug_severity: "minor" | "major" | "critical" | "blocker"
      dev_bug_status: "open" | "investigating" | "fixed" | "closed" | "wont_fix"
      dev_milestone_status: "planned" | "in_progress" | "completed" | "delayed"
      dev_release_status: "planned" | "in_progress" | "released" | "rolled_back"
      dev_support_priority: "low" | "medium" | "high" | "critical"
      dev_support_status:
        | "new"
        | "investigating"
        | "in_progress"
        | "resolved"
        | "wont_fix"
      dev_support_type:
        | "bug_report"
        | "feature_request"
        | "ux_issue"
        | "question"
        | "account_recovery"
        | "billing_review"
      dev_task_priority: "low" | "medium" | "high" | "critical"
      dev_task_status: "todo" | "in_progress" | "done" | "archived"
      membership_role: "owner" | "full_access" | "read_only"
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
      app_role: [
        "admin",
        "sales",
        "marketing",
        "viewer",
        "dev_lead",
        "developer",
        "qa",
        "owner",
      ],
      calendar_event_category: [
        "home_property",
        "maintenance_care",
        "utilities_household",
        "appliances_systems",
        "warranties_coverage",
        "property_lifecycle",
        "compliance_filings",
        "equipment_assets",
        "subscriptions_auto_drafts",
        "hr_admin",
        "tenant_lifecycle",
        "inspections_turnover",
        "rent_financial",
        "legal_compliance",
        "legal_document_reviews",
        "authorized_user_reviews",
        "legacy_emergency_planning",
      ],
      contributor_role: ["administrator", "contributor", "viewer"],
      dev_blocker_status: ["open", "resolved", "deferred"],
      dev_blocker_type: [
        "owner_question",
        "dependency",
        "technical",
        "external",
      ],
      dev_bug_severity: ["minor", "major", "critical", "blocker"],
      dev_bug_status: ["open", "investigating", "fixed", "closed", "wont_fix"],
      dev_milestone_status: ["planned", "in_progress", "completed", "delayed"],
      dev_release_status: ["planned", "in_progress", "released", "rolled_back"],
      dev_support_priority: ["low", "medium", "high", "critical"],
      dev_support_status: [
        "new",
        "investigating",
        "in_progress",
        "resolved",
        "wont_fix",
      ],
      dev_support_type: [
        "bug_report",
        "feature_request",
        "ux_issue",
        "question",
        "account_recovery",
        "billing_review",
      ],
      dev_task_priority: ["low", "medium", "high", "critical"],
      dev_task_status: ["todo", "in_progress", "done", "archived"],
      membership_role: ["owner", "full_access", "read_only"],
    },
  },
} as const
