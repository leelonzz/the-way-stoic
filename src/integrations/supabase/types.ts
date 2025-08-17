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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      chat_conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          messages: Json
          philosopher: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          messages?: Json
          philosopher?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          messages?: Json
          philosopher?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_quotes: {
        Row: {
          author: string
          category: string | null
          created_at: string | null
          created_by: string | null
          date_for: string
          difficulty_level: number | null
          id: string
          is_active: boolean | null
          philosopher: string | null
          quote_text: string
          source: string | null
          tags: string[] | null
          theme: string | null
        }
        Insert: {
          author: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          date_for: string
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          philosopher?: string | null
          quote_text: string
          source?: string | null
          tags?: string[] | null
          theme?: string | null
        }
        Update: {
          author?: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          date_for?: string
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          philosopher?: string | null
          quote_text?: string
          source?: string | null
          tags?: string[] | null
          theme?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          biggest_wins: string[] | null
          created_at: string | null
          entry_date: string
          entry_type: string | null
          excited_about: string | null
          grateful_for: string | null
          id: string
          make_today_great: string | null
          mood_rating: number | null
          must_not_do: string | null
          tags: string[] | null
          tensions: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          biggest_wins?: string[] | null
          created_at?: string | null
          entry_date: string
          entry_type?: string | null
          excited_about?: string | null
          grateful_for?: string | null
          id?: string
          make_today_great?: string | null
          mood_rating?: number | null
          must_not_do?: string | null
          tags?: string[] | null
          tensions?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          biggest_wins?: string[] | null
          created_at?: string | null
          entry_date?: string
          entry_type?: string | null
          excited_about?: string | null
          grateful_for?: string | null
          id?: string
          make_today_great?: string | null
          mood_rating?: number | null
          must_not_do?: string | null
          tags?: string[] | null
          tensions?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          keywords: string[] | null
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          keywords?: string[] | null
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          keywords?: string[] | null
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          subscription_expires_at: string | null
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          author: string
          category: string | null
          created_at: string
          id: string
          mood_tags: string[] | null
          source: string | null
          text: string
        }
        Insert: {
          author: string
          category?: string | null
          created_at?: string
          id?: string
          mood_tags?: string[] | null
          source?: string | null
          text: string
        }
        Update: {
          author?: string
          category?: string | null
          created_at?: string
          id?: string
          mood_tags?: string[] | null
          source?: string | null
          text?: string
        }
        Relationships: []
      }
      saved_quotes: {
        Row: {
          author: string
          collection_name: string | null
          created_at: string | null
          date_saved: string | null
          id: string
          is_favorite: boolean | null
          personal_note: string | null
          quote_text: string
          saved_at: string | null
          source: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          author: string
          collection_name?: string | null
          created_at?: string | null
          date_saved?: string | null
          id?: string
          is_favorite?: boolean | null
          personal_note?: string | null
          quote_text: string
          saved_at?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          author?: string
          collection_name?: string | null
          created_at?: string | null
          date_saved?: string | null
          id?: string
          is_favorite?: boolean | null
          personal_note?: string | null
          quote_text?: string
          saved_at?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_quotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          current_value: number | null
          description: string | null
          id: string
          is_completed: boolean | null
          target_date: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          target_date?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          target_date?: string | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          birth_date: string | null
          created_at: string
          daily_quote_time: string | null
          id: string
          life_expectancy: number | null
          notifications_enabled: boolean | null
          theme_preference: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          daily_quote_time?: string | null
          id?: string
          life_expectancy?: number | null
          notifications_enabled?: boolean | null
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          daily_quote_time?: string | null
          id?: string
          life_expectancy?: number | null
          notifications_enabled?: boolean | null
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_quotes: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          id: string
          is_private: boolean | null
          mood_tags: string[] | null
          source: string | null
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_private?: boolean | null
          mood_tags?: string[] | null
          source?: string | null
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_private?: boolean | null
          mood_tags?: string[] | null
          source?: string | null
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          activity_dates: string[] | null
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          streak_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_dates?: string[] | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_dates?: string[] | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          age: number | null
          birth_date: string | null
          created_at: string | null
          daily_practice_time: string | null
          email: string
          goals: string[] | null
          id: string
          life_expectancy: number | null
          notification_preferences: Json | null
          preferred_philosopher: string | null
          primary_challenges: string[] | null
          theme_preferences: Json | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          birth_date?: string | null
          created_at?: string | null
          daily_practice_time?: string | null
          email: string
          goals?: string[] | null
          id?: string
          life_expectancy?: number | null
          notification_preferences?: Json | null
          preferred_philosopher?: string | null
          primary_challenges?: string[] | null
          theme_preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          birth_date?: string | null
          created_at?: string | null
          daily_practice_time?: string | null
          email?: string
          goals?: string[] | null
          id?: string
          life_expectancy?: number | null
          notification_preferences?: Json | null
          preferred_philosopher?: string | null
          primary_challenges?: string[] | null
          theme_preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_mood_tags_to_quote: {
        Args: { quote_text: string; quote_author?: string }
        Returns: string[]
      }
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
    Enums: {},
  },
} as const