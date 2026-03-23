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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string
          cover_note: string | null
          id: string
          job_id: string
          seeker_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          applied_at?: string
          cover_note?: string | null
          id?: string
          job_id: string
          seeker_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          applied_at?: string
          cover_note?: string | null
          id?: string
          job_id?: string
          seeker_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "seeker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_profiles: {
        Row: {
          about: string | null
          company_name: string | null
          created_at: string
          id: string
          industry: string | null
          logo_url: string | null
          phone: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          about?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          phone?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          about?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          phone?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          category: string | null
          created_at: string
          deadline: string | null
          description: string
          employer_id: string
          experience_level: Database["public"]["Enums"]["job_experience_level"]
          id: string
          location: string | null
          requirements: string
          role_type: Database["public"]["Enums"]["job_role_type"]
          salary_range: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          employer_id: string
          experience_level: Database["public"]["Enums"]["job_experience_level"]
          id?: string
          location?: string | null
          requirements: string
          role_type: Database["public"]["Enums"]["job_role_type"]
          salary_range?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          employer_id?: string
          experience_level?: Database["public"]["Enums"]["job_experience_level"]
          id?: string
          location?: string | null
          requirements?: string
          role_type?: Database["public"]["Enums"]["job_role_type"]
          salary_range?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_data: {
        Row: {
          education: Json[] | null
          experience: Json[] | null
          id: string
          personal: Json
          seeker_id: string
          skills: string[] | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          education?: Json[] | null
          experience?: Json[] | null
          id?: string
          personal?: Json
          seeker_id: string
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          education?: Json[] | null
          experience?: Json[] | null
          id?: string
          personal?: Json
          seeker_id?: string
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_data_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: true
            referencedRelation: "seeker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seeker_profiles: {
        Row: {
          about: string | null
          created_at: string
          headline: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          phone: string | null
          resume_url: string | null
          skills: string[] | null
          user_id: string
        }
        Insert: {
          about?: string | null
          created_at?: string
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          resume_url?: string | null
          skills?: string[] | null
          user_id: string
        }
        Update: {
          about?: string | null
          created_at?: string
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          resume_url?: string | null
          skills?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seeker_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          location: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          location?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status: "pending" | "shortlisted" | "rejected" | "hired"
      job_experience_level: "Entry-Level" | "Mid-Level" | "Senior" | "Executive"
      job_role_type:
        | "Full-Time"
        | "Part-Time"
        | "Contract"
        | "Internship"
        | "Freelance"
      job_status: "active" | "closed" | "draft"
      user_role: "employer" | "job_seeker" | "admin"
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
      application_status: ["pending", "shortlisted", "rejected", "hired"],
      job_experience_level: ["Entry-Level", "Mid-Level", "Senior", "Executive"],
      job_role_type: [
        "Full-Time",
        "Part-Time",
        "Contract",
        "Internship",
        "Freelance",
      ],
      job_status: ["active", "closed", "draft"],
      user_role: ["employer", "job_seeker", "admin"],
    },
  },
} as const
