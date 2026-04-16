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
      application_checklists: {
        Row: {
          completed: boolean | null
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          school_id: string | null
          school_name: string
          task_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          school_id?: string | null
          school_name: string
          task_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          school_id?: string | null
          school_name?: string
          task_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_checklists_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          essay_draft: string | null
          id: string
          messages: Json
          school_name: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          essay_draft?: string | null
          id?: string
          messages?: Json
          school_name?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          essay_draft?: string | null
          id?: string
          messages?: Json
          school_name?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          file_path: string
          file_size: number | null
          id: string
          name: string
          school_id: string | null
          type: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          file_path: string
          file_size?: number | null
          id?: string
          name: string
          school_id?: string | null
          type: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          file_path?: string
          file_size?: number | null
          id?: string
          name?: string
          school_id?: string | null
          type?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_school_grades: {
        Row: {
          areas_for_improvement: Json
          confidence_avg: number | null
          created_at: string
          grade_enhancements: Json
          id: string
          key_strengths: Json
          notable_programs: Json
          overall_description: string | null
          reputation: string | null
          school_id: string
          sources_used: Json | null
          sports_programs: Json | null
          updated_at: string
        }
        Insert: {
          areas_for_improvement?: Json
          confidence_avg?: number | null
          created_at?: string
          grade_enhancements?: Json
          id?: string
          key_strengths?: Json
          notable_programs?: Json
          overall_description?: string | null
          reputation?: string | null
          school_id: string
          sources_used?: Json | null
          sports_programs?: Json | null
          updated_at?: string
        }
        Update: {
          areas_for_improvement?: Json
          confidence_avg?: number | null
          created_at?: string
          grade_enhancements?: Json
          id?: string
          key_strengths?: Json
          notable_programs?: Json
          overall_description?: string | null
          reputation?: string | null
          school_id?: string
          sources_used?: Json | null
          sports_programs?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_school_grades_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      essays: {
        Row: {
          ai_feedback: Json | null
          content: string | null
          created_at: string
          id: string
          prompt: string | null
          school_id: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          content?: string | null
          created_at?: string
          id?: string
          prompt?: string | null
          school_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          content?: string | null
          created_at?: string
          id?: string
          prompt?: string | null
          school_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "essays_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          created_at: string
          feedback: Json | null
          id: string
          questions: Json
          responses: Json | null
          school_id: string | null
          score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback?: Json | null
          id?: string
          questions: Json
          responses?: Json | null
          school_id?: string | null
          score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: Json | null
          id?: string
          questions?: Json
          responses?: Json | null
          school_id?: string | null
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      matcher_results: {
        Row: {
          assessment_data: Json
          created_at: string
          id: string
          reach_schools: Json | null
          safety_schools: Json | null
          target_schools: Json | null
          user_id: string
        }
        Insert: {
          assessment_data: Json
          created_at?: string
          id?: string
          reach_schools?: Json | null
          safety_schools?: Json | null
          target_schools?: Json | null
          user_id: string
        }
        Update: {
          assessment_data?: Json
          created_at?: string
          id?: string
          reach_schools?: Json | null
          safety_schools?: Json | null
          target_schools?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_schools: {
        Row: {
          category: string | null
          created_at: string
          id: string
          school_id: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          school_id: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          school_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_schools_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          academics_grade: string | null
          acceptance_rate: number | null
          admission_type: string | null
          arts_grade: string | null
          boarding: boolean | null
          campus_grade: string | null
          city: string | null
          clubs_grade: string | null
          college_prep_grade: string | null
          competitiveness: string | null
          created_at: string
          diversity_grade: string | null
          dorms_grade: string | null
          enrollment: number | null
          facilities_grade: string | null
          faculty_grade: string | null
          founded_year: number | null
          id: string
          image_url: string | null
          name: string
          notes: string | null
          size: string | null
          sports_grade: string | null
          state: string | null
          tuition: number | null
          type: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          academics_grade?: string | null
          acceptance_rate?: number | null
          admission_type?: string | null
          arts_grade?: string | null
          boarding?: boolean | null
          campus_grade?: string | null
          city?: string | null
          clubs_grade?: string | null
          college_prep_grade?: string | null
          competitiveness?: string | null
          created_at?: string
          diversity_grade?: string | null
          dorms_grade?: string | null
          enrollment?: number | null
          facilities_grade?: string | null
          faculty_grade?: string | null
          founded_year?: number | null
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          size?: string | null
          sports_grade?: string | null
          state?: string | null
          tuition?: number | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          academics_grade?: string | null
          acceptance_rate?: number | null
          admission_type?: string | null
          arts_grade?: string | null
          boarding?: boolean | null
          campus_grade?: string | null
          city?: string | null
          clubs_grade?: string | null
          college_prep_grade?: string | null
          competitiveness?: string | null
          created_at?: string
          diversity_grade?: string | null
          dorms_grade?: string | null
          enrollment?: number | null
          facilities_grade?: string | null
          faculty_grade?: string | null
          founded_year?: number | null
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          size?: string | null
          sports_grade?: string | null
          state?: string | null
          tuition?: number | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      ssat_practice: {
        Row: {
          answers: Json | null
          created_at: string
          id: string
          questions: Json
          score: number | null
          section: string
          time_spent: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          id?: string
          questions: Json
          score?: number | null
          section: string
          time_spent?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          created_at?: string
          id?: string
          questions?: Json
          score?: number | null
          section?: string
          time_spent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          academic_strengths: string[] | null
          application_year: string | null
          boarding_preference: string | null
          budget_range: string | null
          created_at: string
          extracurriculars: string[] | null
          grade_level: string | null
          id: string
          interests: string[] | null
          onboarding_completed: boolean | null
          priorities: string[] | null
          target_states: string[] | null
          test_prep_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_strengths?: string[] | null
          application_year?: string | null
          boarding_preference?: string | null
          budget_range?: string | null
          created_at?: string
          extracurriculars?: string[] | null
          grade_level?: string | null
          id?: string
          interests?: string[] | null
          onboarding_completed?: boolean | null
          priorities?: string[] | null
          target_states?: string[] | null
          test_prep_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_strengths?: string[] | null
          application_year?: string | null
          boarding_preference?: string | null
          budget_range?: string | null
          created_at?: string
          extracurriculars?: string[] | null
          grade_level?: string | null
          id?: string
          interests?: string[] | null
          onboarding_completed?: boolean | null
          priorities?: string[] | null
          target_states?: string[] | null
          test_prep_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          linked_student_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_student_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_student_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "parent" | "admin"
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
      app_role: ["student", "parent", "admin"],
    },
  },
} as const
