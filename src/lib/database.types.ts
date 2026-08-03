// Tipos do banco gerados a partir do schema em supabase/fase-1.sql e supabase/fase-2.sql.
// Formato equivalente ao `supabase gen types` — fonte única de verdade para o client tipado.

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
          full_name: string | null;
          email: string | null;
          whatsapp: string | null;
          city: string;
          state: string;
          send_hour: number;
          daily_report: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          city?: string;
          state?: string;
          send_hour?: number;
          daily_report?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          city?: string;
          state?: string;
          send_hour?: number;
          daily_report?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: Database["public"]["Enums"]["app_role"];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: Database["public"]["Enums"]["app_role"];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          created_at?: string;
        };
        Relationships: [];
      };
      contests: {
        Row: {
          id: string;
          source: string;
          source_id: string;
          title: string;
          organization: string | null;
          role: string | null;
          salary: string | null;
          salary_max: number | null;
          vacancies: number | null;
          talent_pool: boolean;
          education: string | null;
          requirements: string | null;
          city: string | null;
          state: string | null;
          exam_board: string | null;
          published_at: string | null;
          registration_ends_at: string | null;
          status: string | null;
          official_url: string | null;
          news_url: string | null;
          content_hash: string;
          raw: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source: string;
          source_id: string;
          title: string;
          organization?: string | null;
          role?: string | null;
          salary?: string | null;
          salary_max?: number | null;
          vacancies?: number | null;
          talent_pool?: boolean;
          education?: string | null;
          requirements?: string | null;
          city?: string | null;
          state?: string | null;
          exam_board?: string | null;
          published_at?: string | null;
          registration_ends_at?: string | null;
          status?: string | null;
          official_url?: string | null;
          news_url?: string | null;
          content_hash: string;
          raw?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source?: string;
          source_id?: string;
          title?: string;
          organization?: string | null;
          role?: string | null;
          salary?: string | null;
          salary_max?: number | null;
          vacancies?: number | null;
          talent_pool?: boolean;
          education?: string | null;
          requirements?: string | null;
          city?: string | null;
          state?: string | null;
          exam_board?: string | null;
          published_at?: string | null;
          registration_ends_at?: string | null;
          status?: string | null;
          official_url?: string | null;
          news_url?: string | null;
          content_hash?: string;
          raw?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_filters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          cities: string[];
          states: string[];
          roles: string[];
          keywords: string[];
          blocked_keywords: string[];
          discard_requires_cnh: boolean;
          discard_requires_postgrad: boolean;
          only_it: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          cities?: string[];
          states?: string[];
          roles?: string[];
          keywords?: string[];
          blocked_keywords?: string[];
          discard_requires_cnh?: boolean;
          discard_requires_postgrad?: boolean;
          only_it?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          cities?: string[];
          states?: string[];
          roles?: string[];
          keywords?: string[];
          blocked_keywords?: string[];
          discard_requires_cnh?: boolean;
          discard_requires_postgrad?: boolean;
          only_it?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sent_notifications: {
        Row: {
          id: string;
          user_id: string;
          contest_id: string;
          channel: Database["public"]["Enums"]["notification_channel"];
          status: string;
          provider_id: string | null;
          error: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contest_id: string;
          channel: Database["public"]["Enums"]["notification_channel"];
          status?: string;
          provider_id?: string | null;
          error?: string | null;
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          contest_id?: string;
          channel?: Database["public"]["Enums"]["notification_channel"];
          status?: string;
          provider_id?: string | null;
          error?: string | null;
          sent_at?: string;
        };
        Relationships: [];
      };
      query_history: {
        Row: {
          id: string;
          source: string;
          executed_at: string;
          items_found: number;
          items_new: number;
          status: string;
          duration_ms: number | null;
          error: string | null;
        };
        Insert: {
          id?: string;
          source: string;
          executed_at?: string;
          items_found?: number;
          items_new?: number;
          status?: string;
          duration_ms?: number | null;
          error?: string | null;
        };
        Update: {
          id?: string;
          source?: string;
          executed_at?: string;
          items_found?: number;
          items_new?: number;
          status?: string;
          duration_ms?: number | null;
          error?: string | null;
        };
        Relationships: [];
      };
      execution_logs: {
        Row: {
          id: string;
          level: Database["public"]["Enums"]["log_level"];
          stage: string;
          message: string;
          context: Json | null;
          duration_ms: number | null;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          level?: Database["public"]["Enums"]["log_level"];
          stage: string;
          message: string;
          context?: Json | null;
          duration_ms?: number | null;
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          level?: Database["public"]["Enums"]["log_level"];
          stage?: string;
          message?: string;
          context?: Json | null;
          duration_ms?: number | null;
          error?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      has_role: {
        Args: {
          _user_id: string;
          _role: Database["public"]["Enums"]["app_role"];
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
      notification_channel: "email" | "whatsapp";
      log_level: "debug" | "info" | "warn" | "error";
    };
    CompositeTypes: Record<string, never>;
  };
};
