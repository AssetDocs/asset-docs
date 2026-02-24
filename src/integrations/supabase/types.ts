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
      account_deletion_requests: {
        Row: {
          account_owner_id: string
          created_at: string
          grace_period_days: number
          grace_period_ends_at: string
          id: string
          reason: string | null
          requested_at: string
          requester_user_id: string
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_owner_id: string
          created_at?: string
          grace_period_days?: number
          grace_period_ends_at: string
          id?: string
          reason?: string | null
          requested_at?: string
          requester_user_id: string
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_owner_id?: string
          created_at?: string
          grace_period_days?: number
          grace_period_ends_at?: string
          id?: string
          reason?: string | null
          requested_at?: string
          requester_user_id?: string
          responded_at?: string | null
          status?: string
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
      backup_codes: {
        Row: {
          code_hash: string
          created_at: string
          expires_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
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
          first_name: string | null
          id: string
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
          invited_at?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["contributor_role"]
          status?: string
          updated_at?: string
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
          email: string
          id: string
          original_user_id: string | null
        }
        Insert: {
          deleted_at?: string
          deleted_by?: string | null
          email: string
          id?: string
          original_user_id?: string | null
        }
        Update: {
          deleted_at?: string
          deleted_by?: string | null
          email?: string
          id?: string
          original_user_id?: string | null
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
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["dev_support_priority"]
          reported_by: string | null
          resolution: string | null
          status: Database["public"]["Enums"]["dev_support_status"]
          title: string
          type: Database["public"]["Enums"]["dev_support_type"]
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["dev_support_priority"]
          reported_by?: string | null
          resolution?: string | null
          status?: Database["public"]["Enums"]["dev_support_status"]
          title: string
          type?: Database["public"]["Enums"]["dev_support_type"]
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["dev_support_priority"]
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
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          entitlement_source: string
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
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          entitlement_source?: string
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
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          entitlement_source?: string
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
      family_recipes: {
        Row: {
          bucket_name: string | null
          created_at: string
          created_by_person: string | null
          details: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_url: string | null
          id: string
          recipe_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket_name?: string | null
          created_at?: string
          created_by_person?: string | null
          details?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          recipe_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket_name?: string | null
          created_at?: string
          created_by_person?: string | null
          details?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
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
          created_at: string
          debts_expenses: string | null
          delegate_user_id: string | null
          digital_assets: Json | null
          encryption_key_encrypted_for_delegate: string | null
          encryption_key_encrypted_for_user: string | null
          ethical_will: string | null
          executor_contact: string | null
          executor_name: string | null
          executor_relationship: string | null
          financial_advisor_contact: string | null
          financial_advisor_firm: string | null
          financial_advisor_name: string | null
          full_legal_name: string | null
          funeral_wishes: string | null
          general_bequests: Json | null
          guardian_contact: string | null
          guardian_name: string | null
          guardian_relationship: string | null
          id: string
          investment_advisor_name: string | null
          investment_firm_contact: string | null
          investment_firm_name: string | null
          is_encrypted: boolean
          letters_to_loved_ones: string | null
          no_contest_clause: boolean | null
          organ_donation: boolean | null
          pet_care_instructions: string | null
          real_estate_instructions: string | null
          recovery_grace_period_days: number | null
          recovery_requested_at: string | null
          recovery_status: string | null
          residuary_estate: string | null
          specific_bequests: Json | null
          spouse_contact: string | null
          spouse_name: string | null
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
          created_at?: string
          debts_expenses?: string | null
          delegate_user_id?: string | null
          digital_assets?: Json | null
          encryption_key_encrypted_for_delegate?: string | null
          encryption_key_encrypted_for_user?: string | null
          ethical_will?: string | null
          executor_contact?: string | null
          executor_name?: string | null
          executor_relationship?: string | null
          financial_advisor_contact?: string | null
          financial_advisor_firm?: string | null
          financial_advisor_name?: string | null
          full_legal_name?: string | null
          funeral_wishes?: string | null
          general_bequests?: Json | null
          guardian_contact?: string | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          id?: string
          investment_advisor_name?: string | null
          investment_firm_contact?: string | null
          investment_firm_name?: string | null
          is_encrypted?: boolean
          letters_to_loved_ones?: string | null
          no_contest_clause?: boolean | null
          organ_donation?: boolean | null
          pet_care_instructions?: string | null
          real_estate_instructions?: string | null
          recovery_grace_period_days?: number | null
          recovery_requested_at?: string | null
          recovery_status?: string | null
          residuary_estate?: string | null
          specific_bequests?: Json | null
          spouse_contact?: string | null
          spouse_name?: string | null
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
          created_at?: string
          debts_expenses?: string | null
          delegate_user_id?: string | null
          digital_assets?: Json | null
          encryption_key_encrypted_for_delegate?: string | null
          encryption_key_encrypted_for_user?: string | null
          ethical_will?: string | null
          executor_contact?: string | null
          executor_name?: string | null
          executor_relationship?: string | null
          financial_advisor_contact?: string | null
          financial_advisor_firm?: string | null
          financial_advisor_name?: string | null
          full_legal_name?: string | null
          funeral_wishes?: string | null
          general_bequests?: Json | null
          guardian_contact?: string | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          id?: string
          investment_advisor_name?: string | null
          investment_firm_contact?: string | null
          investment_firm_name?: string | null
          is_encrypted?: boolean
          letters_to_loved_ones?: string | null
          no_contest_clause?: boolean | null
          organ_donation?: boolean | null
          pet_care_instructions?: string | null
          real_estate_instructions?: string | null
          recovery_grace_period_days?: number | null
          recovery_requested_at?: string | null
          recovery_status?: string | null
          residuary_estate?: string | null
          specific_bequests?: Json | null
          spouse_contact?: string | null
          spouse_name?: string | null
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
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      legal_agreement_signatures: {
        Row: {
          acknowledgments: Json | null
          agreement_type: string
          created_at: string
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
          created_at?: string
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
          created_at?: string
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
          description: string | null
          file_name: string
          file_path: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          folder_id: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes_traditions: {
        Row: {
          bucket_name: string | null
          content: string | null
          created_at: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_url: string | null
          holiday: string | null
          id: string
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket_name?: string | null
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          holiday?: string | null
          id?: string
          subject?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket_name?: string | null
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          holiday?: string | null
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
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
      paint_codes: {
        Row: {
          created_at: string
          id: string
          is_interior: boolean
          paint_brand: string
          paint_code: string
          paint_name: string
          property_id: string | null
          room_location: string | null
          swatch_image_path: string | null
          swatch_image_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_interior?: boolean
          paint_brand: string
          paint_code: string
          paint_name: string
          property_id?: string | null
          room_location?: string | null
          swatch_image_path?: string | null
          swatch_image_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_interior?: boolean
          paint_brand?: string
          paint_code?: string
          paint_name?: string
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
      photo_folders: {
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
      profiles: {
        Row: {
          account_number: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_period_end: string | null
          first_name: string | null
          household_income: string | null
          id: string
          last_name: string | null
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
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_period_end?: string | null
          first_name?: string | null
          household_income?: string | null
          id?: string
          last_name?: string | null
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
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_period_end?: string | null
          first_name?: string | null
          household_income?: string | null
          id?: string
          last_name?: string | null
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
          damage_report_id: string | null
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
          property_id: string
          source: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          bucket_name: string
          created_at?: string | null
          damage_report_id?: string | null
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
          property_id: string
          source?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          bucket_name?: string
          created_at?: string | null
          damage_report_id?: string | null
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
      stripe_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          outcome: string | null
          payload: Json | null
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          outcome?: string | null
          payload?: Json | null
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          outcome?: string | null
          payload?: Json | null
          processed_at?: string
          stripe_event_id?: string
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
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_name: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_category: string
          action_type: string
          actor_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_category?: string
          action_type?: string
          actor_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          category: string
          created_at: string
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
          property_id: string | null
          tags: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
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
          property_id?: string | null
          tags?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
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
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_type?: string
          contact_id: string
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_type?: string
          contact_id?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
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
          updated_at?: string | null
          user_id?: string
          voice_note_id?: string
        }
        Relationships: [
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
      compute_user_verification: {
        Args: { target_user_id: string }
        Returns: Json
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
      get_admin_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      has_contributor_access: {
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
      dev_task_priority: "low" | "medium" | "high" | "critical"
      dev_task_status: "todo" | "in_progress" | "done" | "archived"
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
      ],
      dev_task_priority: ["low", "medium", "high", "critical"],
      dev_task_status: ["todo", "in_progress", "done", "archived"],
    },
  },
} as const
