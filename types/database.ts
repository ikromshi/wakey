/**
 * Database Types for Supabase
 *
 * Defines the schema types for all database tables.
 * Keep this in sync with your Supabase database schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: 'none' | 'basic' | 'full';
          status: 'active' | 'canceled' | 'expired' | 'trial';
          provider: 'apple' | 'google' | 'stripe' | null;
          provider_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: 'none' | 'basic' | 'full';
          status?: 'active' | 'canceled' | 'expired' | 'trial';
          provider?: 'apple' | 'google' | 'stripe' | null;
          provider_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan?: 'none' | 'basic' | 'full';
          status?: 'active' | 'canceled' | 'expired' | 'trial';
          provider?: 'apple' | 'google' | 'stripe' | null;
          provider_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
      };
      alarms: {
        Row: {
          id: string;
          user_id: string;
          time: string;
          label: string | null;
          is_enabled: boolean;
          repeat_days: number[];
          audio_source_type: 'default' | 'recording' | 'template' | 'tts';
          audio_source_uri: string | null;
          audio_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          time: string;
          label?: string | null;
          is_enabled?: boolean;
          repeat_days?: number[];
          audio_source_type?: 'default' | 'recording' | 'template' | 'tts';
          audio_source_uri?: string | null;
          audio_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          time?: string;
          label?: string | null;
          is_enabled?: boolean;
          repeat_days?: number[];
          audio_source_type?: 'default' | 'recording' | 'template' | 'tts';
          audio_source_uri?: string | null;
          audio_name?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      plan_type: 'none' | 'basic' | 'full';
      subscription_status: 'active' | 'canceled' | 'expired' | 'trial';
      subscription_provider: 'apple' | 'google' | 'stripe';
      audio_source_type: 'default' | 'recording' | 'template' | 'tts';
    };
  };
};

// Convenience types for table rows
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

export type AlarmRecord = Database['public']['Tables']['alarms']['Row'];
export type AlarmInsert = Database['public']['Tables']['alarms']['Insert'];
export type AlarmUpdate = Database['public']['Tables']['alarms']['Update'];
