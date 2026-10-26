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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      dishes: {
        Row: {
          aliases: string[]
          category: string | null
          description_en: string | null
          id: number
          ingredients: Json
          jyutping: string | null
          name_en: string
          name_zh: string
          source_url: string | null
          status: string
          updated_at: string
          verified_by: string | null
        }
        Insert: {
          aliases?: string[]
          category?: string | null
          description_en?: string | null
          id?: never
          ingredients?: Json
          jyutping?: string | null
          name_en: string
          name_zh: string
          source_url?: string | null
          status?: string
          updated_at?: string
          verified_by?: string | null
        }
        Update: {
          aliases?: string[]
          category?: string | null
          description_en?: string | null
          id?: never
          ingredients?: Json
          jyutping?: string | null
          name_en?: string
          name_zh?: string
          source_url?: string | null
          status?: string
          updated_at?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dishes_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          approach: string | null
          comment: string | null
          created_at: string
          id: number
          item_text: string | null
          user_id: string | null
          verdict_shown: string | null
        }
        Insert: {
          approach?: string | null
          comment?: string | null
          created_at?: string
          id?: never
          item_text?: string | null
          user_id?: string | null
          verdict_shown?: string | null
        }
        Update: {
          approach?: string | null
          comment?: string | null
          created_at?: string
          id?: never
          item_text?: string | null
          user_id?: string | null
          verdict_shown?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gt_items: {
        Row: {
          id: number
          ingredient_keys: string[]
          name_en: string | null
          tags: string[]
          test_case_id: number
          text_zh: string
          violates: string[]
        }
        Insert: {
          id?: never
          ingredient_keys?: string[]
          name_en?: string | null
          tags?: string[]
          test_case_id: number
          text_zh: string
          violates?: string[]
        }
        Update: {
          id?: never
          ingredient_keys?: string[]
          name_en?: string | null
          tags?: string[]
          test_case_id?: number
          text_zh?: string
          violates?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "gt_items_test_case_id_fkey"
            columns: ["test_case_id"]
            isOneToOne: false
            referencedRelation: "test_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_terms: {
        Row: {
          id: number
          ingredient_key: string
          note: string | null
          term_zh: string
          variants: string[]
        }
        Insert: {
          id?: never
          ingredient_key: string
          note?: string | null
          term_zh: string
          variants?: string[]
        }
        Update: {
          id?: never
          ingredient_key?: string
          note?: string | null
          term_zh?: string
          variants?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_terms_ingredient_key_fkey"
            columns: ["ingredient_key"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["key"]
          },
        ]
      }
      ingredients: {
        Row: {
          categories: string[]
          key: string
          label_en: string
        }
        Insert: {
          categories?: string[]
          key: string
          label_en: string
        }
        Update: {
          categories?: string[]
          key?: string
          label_en?: string
        }
        Relationships: []
      }
      item_matches: {
        Row: {
          gt_item_id: number
          id: number
          name_correct: boolean | null
          predicted_index: number | null
          run_result_id: number
        }
        Insert: {
          gt_item_id: number
          id?: never
          name_correct?: boolean | null
          predicted_index?: number | null
          run_result_id: number
        }
        Update: {
          gt_item_id?: number
          id?: never
          name_correct?: boolean | null
          predicted_index?: number | null
          run_result_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "item_matches_gt_item_id_fkey"
            columns: ["gt_item_id"]
            isOneToOne: false
            referencedRelation: "gt_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_matches_run_result_id_fkey"
            columns: ["run_result_id"]
            isOneToOne: false
            referencedRelation: "run_results"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          currency: string | null
          health_consent_at: string | null
          id: string
          restrictions: string[]
          role: string
          username: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          health_consent_at?: string | null
          id: string
          restrictions?: string[]
          role?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          health_consent_at?: string | null
          id?: string
          restrictions?: string[]
          role?: string
          username?: string | null
        }
        Relationships: []
      }
      run_results: {
        Row: {
          cost_usd: number | null
          error: string | null
          id: number
          latency_ms: number | null
          output: Json | null
          run_id: number
          test_case_id: number
        }
        Insert: {
          cost_usd?: number | null
          error?: string | null
          id?: never
          latency_ms?: number | null
          output?: Json | null
          run_id: number
          test_case_id: number
        }
        Update: {
          cost_usd?: number | null
          error?: string | null
          id?: never
          latency_ms?: number | null
          output?: Json | null
          run_id?: number
          test_case_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "run_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_results_test_case_id_fkey"
            columns: ["test_case_id"]
            isOneToOne: false
            referencedRelation: "test_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      runs: {
        Row: {
          approach: string
          config: Json
          id: number
          notes: string | null
          started_at: string
          started_by: string | null
        }
        Insert: {
          approach: string
          config?: Json
          id?: never
          notes?: string | null
          started_at?: string
          started_by?: string | null
        }
        Update: {
          approach?: string
          config?: Json
          id?: never
          notes?: string | null
          started_at?: string
          started_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "runs_started_by_fkey"
            columns: ["started_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_quota: {
        Row: {
          count: number
          day: string
          user_id: string
        }
        Insert: {
          count?: number
          day: string
          user_id: string
        }
        Update: {
          count?: number
          day?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_quota_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_stats: {
        Row: {
          approach: string
          cost_usd: number | null
          created_at: string
          id: number
          item_count: number | null
          kind: string | null
          latency_ms: number | null
        }
        Insert: {
          approach: string
          cost_usd?: number | null
          created_at?: string
          id?: never
          item_count?: number | null
          kind?: string | null
          latency_ms?: number | null
        }
        Update: {
          approach?: string
          cost_usd?: number | null
          created_at?: string
          id?: never
          item_count?: number | null
          kind?: string | null
          latency_ms?: number | null
        }
        Relationships: []
      }
      staff_phrases: {
        Row: {
          id: number
          jyutping: string | null
          restriction_key: string
          reviewed: boolean
          text_en: string
          text_zh: string
        }
        Insert: {
          id?: never
          jyutping?: string | null
          restriction_key: string
          reviewed?: boolean
          text_en: string
          text_zh: string
        }
        Update: {
          id?: never
          jyutping?: string | null
          restriction_key?: string
          reviewed?: boolean
          text_en?: string
          text_zh?: string
        }
        Relationships: []
      }
      study_responses: {
        Row: {
          answers: Json
          consent: boolean
          created_at: string
          id: number
        }
        Insert: {
          answers?: Json
          consent: boolean
          created_at?: string
          id?: never
        }
        Update: {
          answers?: Json
          consent?: boolean
          created_at?: string
          id?: never
        }
        Relationships: []
      }
      test_cases: {
        Row: {
          created_at: string
          created_by: string | null
          id: number
          kind: string
          photo_path: string
          source: string | null
          tags: string[]
          venue: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: never
          kind: string
          photo_path: string
          source?: string | null
          tags?: string[]
          venue?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: never
          kind?: string
          photo_path?: string
          source?: string | null
          tags?: string[]
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_quota: {
        Row: {
          count: number
          day: string
          kind: string
          user_id: string
        }
        Insert: {
          count?: number
          day: string
          kind: string
          user_id: string
        }
        Update: {
          count?: number
          day?: string
          kind?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_quota_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_quota: {
        Args: { p_kind: string; p_limit: number; p_user: string }
        Returns: number
      }
      consume_scan: {
        Args: { p_limit: number; p_user: string }
        Returns: number
      }
      is_team: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
