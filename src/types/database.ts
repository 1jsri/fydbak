export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'manager' | 'rep' | 'admin'
          current_plan: 'free' | 'pro' | 'pro_plus'
          responses_used_this_month: number
          billing_period_start: string
          billing_period_end: string
          is_site_owner: boolean
          trial_active: boolean
          trial_plan: 'pro' | 'pro_plus' | null
          trial_start_date: string | null
          trial_end_date: string | null
          trial_redeemed_at: string | null
          account_status: 'active' | 'suspended' | 'deleted'
          last_login_at: string | null
          suspended_at: string | null
          suspended_by: string | null
          suspended_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'manager' | 'rep' | 'admin'
          current_plan?: 'free' | 'pro' | 'pro_plus'
          responses_used_this_month?: number
          billing_period_start?: string
          billing_period_end?: string
          is_site_owner?: boolean
          trial_active?: boolean
          trial_plan?: 'pro' | 'pro_plus' | null
          trial_start_date?: string | null
          trial_end_date?: string | null
          trial_redeemed_at?: string | null
          account_status?: 'active' | 'suspended' | 'deleted'
          last_login_at?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'manager' | 'rep' | 'admin'
          current_plan?: 'free' | 'pro' | 'pro_plus'
          responses_used_this_month?: number
          billing_period_start?: string
          billing_period_end?: string
          is_site_owner?: boolean
          trial_active?: boolean
          trial_plan?: 'pro' | 'pro_plus' | null
          trial_start_date?: string | null
          trial_end_date?: string | null
          trial_redeemed_at?: string | null
          account_status?: 'active' | 'suspended' | 'deleted'
          last_login_at?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      surveys: {
        Row: {
          id: string
          manager_id: string
          title: string
          description: string | null
          emoji: string | null
          image_url: string | null
          goal: string
          goal_description: string | null
          status: 'draft' | 'active' | 'archived' | 'closed'
          short_code: string
          duration_type: 'hours' | 'days' | 'indefinite'
          duration_value: number | null
          closes_at: string | null
          closed_manually: boolean
          closed_at: string | null
          closed_by: string | null
          collects_pii: boolean
          pii_purpose: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          manager_id: string
          title: string
          description?: string | null
          emoji?: string | null
          image_url?: string | null
          goal: string
          goal_description?: string | null
          status?: 'draft' | 'active' | 'archived' | 'closed'
          short_code: string
          duration_type?: 'hours' | 'days' | 'indefinite'
          duration_value?: number | null
          closes_at?: string | null
          closed_manually?: boolean
          closed_at?: string | null
          closed_by?: string | null
          collects_pii?: boolean
          pii_purpose?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          manager_id?: string
          title?: string
          description?: string | null
          emoji?: string | null
          image_url?: string | null
          goal?: string
          goal_description?: string | null
          status?: 'draft' | 'active' | 'archived' | 'closed'
          short_code?: string
          duration_type?: 'hours' | 'days' | 'indefinite'
          duration_value?: number | null
          closes_at?: string | null
          closed_manually?: boolean
          closed_at?: string | null
          closed_by?: string | null
          collects_pii?: boolean
          pii_purpose?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          survey_id: string
          question_text: string
          order_index: number
          is_required: boolean
          created_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          question_text: string
          order_index: number
          is_required?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          question_text?: string
          order_index?: number
          is_required?: boolean
          created_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          survey_id: string
          rep_name: string | null
          status: 'started' | 'in_progress' | 'completed' | 'abandoned'
          current_question_id: string | null
          started_at: string
          completed_at: string | null
          last_activity_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          rep_name?: string | null
          status?: 'started' | 'in_progress' | 'completed' | 'abandoned'
          current_question_id?: string | null
          started_at?: string
          completed_at?: string | null
          last_activity_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          rep_name?: string | null
          status?: 'started' | 'in_progress' | 'completed' | 'abandoned'
          current_question_id?: string | null
          started_at?: string
          completed_at?: string | null
          last_activity_at?: string
        }
      }
      responses: {
        Row: {
          id: string
          session_id: string
          question_id: string
          answer_text: string | null
          is_skipped: boolean
          skip_reason: string | null
          clarification_count: number
          needs_followup: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: string
          answer_text?: string | null
          is_skipped?: boolean
          skip_reason?: string | null
          clarification_count?: number
          needs_followup?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: string
          answer_text?: string | null
          is_skipped?: boolean
          skip_reason?: string | null
          clarification_count?: number
          needs_followup?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clarifications: {
        Row: {
          id: string
          response_id: string
          clarification_prompt: string
          clarification_answer: string | null
          attempt_number: 1 | 2
          created_at: string
        }
        Insert: {
          id?: string
          response_id: string
          clarification_prompt: string
          clarification_answer?: string | null
          attempt_number: 1 | 2
          created_at?: string
        }
        Update: {
          id?: string
          response_id?: string
          clarification_prompt?: string
          clarification_answer?: string | null
          attempt_number?: 1 | 2
          created_at?: string
        }
      }
      session_summaries: {
        Row: {
          id: string
          session_id: string
          ai_summary: string
          action_points: Json
          honesty_score: number | null
          key_themes: string[] | null
          generated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          ai_summary: string
          action_points?: Json
          honesty_score?: number | null
          key_themes?: string[] | null
          generated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          ai_summary?: string
          action_points?: Json
          honesty_score?: number | null
          key_themes?: string[] | null
          generated_at?: string
        }
      }
      trial_links: {
        Row: {
          id: string
          code: string
          label: string | null
          trial_plan: 'pro' | 'pro_plus'
          duration_days: number
          max_redemptions: number | null
          redemptions_count: number
          active: boolean
          expires_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          label?: string | null
          trial_plan: 'pro' | 'pro_plus'
          duration_days: number
          max_redemptions?: number | null
          redemptions_count?: number
          active?: boolean
          expires_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          label?: string | null
          trial_plan?: 'pro' | 'pro_plus'
          duration_days?: number
          max_redemptions?: number | null
          redemptions_count?: number
          active?: boolean
          expires_at?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      trial_redemptions: {
        Row: {
          id: string
          trial_link_id: string
          user_id: string
          redeemed_at: string
          ip_address: string | null
        }
        Insert: {
          id?: string
          trial_link_id: string
          user_id: string
          redeemed_at?: string
          ip_address?: string | null
        }
        Update: {
          id?: string
          trial_link_id?: string
          user_id?: string
          redeemed_at?: string
          ip_address?: string | null
        }
      }
      owner_audit_log: {
        Row: {
          id: string
          owner_id: string
          action_type: string
          target_user_id: string | null
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          action_type: string
          target_user_id?: string | null
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          action_type?: string
          target_user_id?: string | null
          details?: Json
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          email_on_response: boolean
          email_on_usage_alert: boolean
          email_on_product_updates: boolean
          digest_frequency: 'daily' | 'weekly' | 'never'
          language: string
          timezone: string
          default_survey_duration_type: 'hours' | 'days' | 'indefinite'
          default_survey_duration_value: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_on_response?: boolean
          email_on_usage_alert?: boolean
          email_on_product_updates?: boolean
          digest_frequency?: 'daily' | 'weekly' | 'never'
          language?: string
          timezone?: string
          default_survey_duration_type?: 'hours' | 'days' | 'indefinite'
          default_survey_duration_value?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_on_response?: boolean
          email_on_usage_alert?: boolean
          email_on_product_updates?: boolean
          digest_frequency?: 'daily' | 'weekly' | 'never'
          language?: string
          timezone?: string
          default_survey_duration_type?: 'hours' | 'days' | 'indefinite'
          default_survey_duration_value?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_notes: {
        Row: {
          id: string
          user_id: string
          admin_id: string
          note_text: string
          note_type: 'general' | 'support' | 'billing' | 'security' | 'other'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          admin_id: string
          note_text: string
          note_type?: 'general' | 'support' | 'billing' | 'security' | 'other'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          admin_id?: string
          note_text?: string
          note_type?: 'general' | 'support' | 'billing' | 'security' | 'other'
          created_at?: string
          updated_at?: string
        }
      }
      data_export_requests: {
        Row: {
          id: string
          user_id: string
          requested_by: string
          request_type: 'self' | 'admin'
          status: 'pending' | 'processing' | 'completed' | 'failed'
          export_format: 'json' | 'csv'
          file_url: string | null
          completed_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          requested_by: string
          request_type?: 'self' | 'admin'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          export_format?: 'json' | 'csv'
          file_url?: string | null
          completed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          requested_by?: string
          request_type?: 'self' | 'admin'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          export_format?: 'json' | 'csv'
          file_url?: string | null
          completed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      account_deletion_requests: {
        Row: {
          id: string
          user_id: string
          requested_by: string
          request_type: 'self' | 'admin'
          status: 'pending' | 'scheduled' | 'completed' | 'cancelled'
          deletion_reason: string | null
          scheduled_deletion_date: string | null
          completed_at: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          requested_by: string
          request_type?: 'self' | 'admin'
          status?: 'pending' | 'scheduled' | 'completed' | 'cancelled'
          deletion_reason?: string | null
          scheduled_deletion_date?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          requested_by?: string
          request_type?: 'self' | 'admin'
          status?: 'pending' | 'scheduled' | 'completed' | 'cancelled'
          deletion_reason?: string | null
          scheduled_deletion_date?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
        }
      }
    }
  }
}
