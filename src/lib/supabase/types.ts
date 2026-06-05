// src/lib/supabase/types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          role: string;
          department_code: string | null;
          office_code: string | null;
          preferred_language: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          role?: string;
          department_code?: string | null;
          office_code?: string | null;
          preferred_language?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          role?: string;
          department_code?: string | null;
          office_code?: string | null;
          preferred_language?: string;
          created_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          service_type: string;
          status: string;
          applicant_name: string;
          created_at: string;
          sla_duration_minutes: number;
          sla_deadline: string;
          breached_at: string | null;
          resolved_at: string | null;
          last_status_change: string;
          service_payload: Json;
          assigned_officer_id: string | null;
          department_code: string;
          office_code: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_type: string;
          status?: string;
          applicant_name: string;
          created_at?: string;
          sla_duration_minutes: number;
          sla_deadline: string;
          breached_at?: string | null;
          resolved_at?: string | null;
          last_status_change?: string;
          service_payload?: Json;
          assigned_officer_id?: string | null;
          department_code: string;
          office_code?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_type?: string;
          status?: string;
          applicant_name?: string;
          created_at?: string;
          sla_duration_minutes?: number;
          sla_deadline?: string;
          breached_at?: string | null;
          resolved_at?: string | null;
          last_status_change?: string;
          service_payload?: Json;
          assigned_officer_id?: string | null;
          department_code?: string;
          office_code?: string | null;
          deleted_at?: string | null;
        };
      };
      application_events: {
        Row: {
          id: string;
          application_id: string;
          previous_status: string | null;
          new_status: string;
          actor_id: string | null;
          actor_type: string;
          changed_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          application_id: string;
          previous_status?: string | null;
          new_status: string;
          actor_id?: string | null;
          actor_type?: string;
          changed_at?: string;
          metadata?: Json;
        };
      };
      sla_policies: {
        Row: {
          id: number;
          service_type: string;
          effective_from: string;
          effective_until: string | null;
          duration_minutes: number;
        };
        Insert: {
          id?: number;
          service_type: string;
          effective_from: string;
          effective_until?: string | null;
          duration_minutes: number;
        };
      };
    };
  };
}

export type ServiceType = 
  | 'DRIVING_LICENSE'
  | 'RATION_CARD'
  | 'BIRTH_REGISTRATION'
  | 'RPM_ALERT';

export type ApplicationStatus = 
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'SLA_BREACHED'
  | 'RESOLVED'
  | 'RESOLVED_LATE';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];
export type ApplicationEvent = Database['public']['Tables']['application_events']['Row'];
export type SLAPolicy = Database['public']['Tables']['sla_policies']['Row'];