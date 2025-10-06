import type { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Survey = Database['public']['Tables']['surveys']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];
export type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
export type Response = Database['public']['Tables']['responses']['Row'];
export type Clarification = Database['public']['Tables']['clarifications']['Row'];
export type SessionSummary = Database['public']['Tables']['session_summaries']['Row'];
export type TrialLink = Database['public']['Tables']['trial_links']['Row'];
export type TrialRedemption = Database['public']['Tables']['trial_redemptions']['Row'];
export type AdminAuditLog = Database['public']['Tables']['admin_audit_log']['Row'];
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
export type AdminNote = Database['public']['Tables']['admin_notes']['Row'];
export type DataExportRequest = Database['public']['Tables']['data_export_requests']['Row'];
export type AccountDeletionRequest = Database['public']['Tables']['account_deletion_requests']['Row'];

export type SurveyGoal =
  | 'customer_insight'
  | 'performance'
  | 'product_feedback'
  | 'team_morale'
  | 'process_improvement'
  | 'other';

export interface SurveyWithQuestions extends Survey {
  questions: Question[];
}

export interface SessionWithResponses extends ChatSession {
  responses: ResponseWithClarifications[];
  summary?: SessionSummary;
}

export interface ResponseWithClarifications extends Response {
  clarifications: Clarification[];
  question: Question;
}

export interface ActionPoint {
  text: string;
  priority: 'high' | 'medium' | 'low';
}
