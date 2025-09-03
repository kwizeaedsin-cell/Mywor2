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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agent_payouts: {
        Row: {
          agent_id: string
          amount: number
          created_at: string | null
          id: string
          request_id: string
          status: string | null
        }
        Insert: {
          agent_id: string
          amount: number
          created_at?: string | null
          id?: string
          request_id: string
          status?: string | null
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string | null
          id?: string
          request_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_payouts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_payouts_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "government_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_profiles: {
        Row: {
          id: string
          is_active: boolean | null
          mobile_money_number: string
          total_earnings: number | null
        }
        Insert: {
          id: string
          is_active?: boolean | null
          mobile_money_number: string
          total_earnings?: number | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          mobile_money_number?: string
          total_earnings?: number | null
        }
        Relationships: []
      }
      document_uploads: {
        Row: {
          file_path: string
          file_size: number | null
          filename: string
          government_request_id: string | null
          id: string
          mime_type: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          file_path: string
          file_size?: number | null
          filename: string
          government_request_id?: string | null
          id?: string
          mime_type?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          file_path?: string
          file_size?: number | null
          filename?: string
          government_request_id?: string | null
          id?: string
          mime_type?: string | null
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_uploads_government_request_id_fkey"
            columns: ["government_request_id"]
            isOneToOne: false
            referencedRelation: "government_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      government_requests: {
        Row: {
          admin_notes: string | null
          assigned_agent_id: string | null
          client_id: string
          completed_at: string | null
          created_at: string | null
          description: string
          estimated_completion_days: number | null
          final_fee: number | null
          id: string
          payment_method: string | null
          payment_status: string | null
          priority: string | null
          requirements_verified: boolean | null
          service_id: number | null
          status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_agent_id?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          description: string
          estimated_completion_days?: number | null
          final_fee?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          priority?: string | null
          requirements_verified?: boolean | null
          service_id?: number | null
          status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_agent_id?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string
          estimated_completion_days?: number | null
          final_fee?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          priority?: string | null
          requirements_verified?: boolean | null
          service_id?: number | null
          status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "government_services"
            referencedColumns: ["id"]
          },
        ]
      }
      government_services: {
        Row: {
          base_cost: number
          description: string | null
          id: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          base_cost?: number
          description?: string | null
          id?: number
          is_active?: boolean | null
          name: string
        }
        Update: {
          base_cost?: number
          description?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_request_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_request_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_request_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_request_id_fkey"
            columns: ["related_request_id"]
            isOneToOne: false
            referencedRelation: "government_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          national_id: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          national_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          national_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      request_assignments: {
        Row: {
          admin_id: string
          agent_id: string | null
          assigned_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          priority: string | null
          request_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          agent_id?: string | null
          assigned_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          request_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          agent_id?: string | null
          assigned_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          request_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_assignments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "government_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_status_history: {
        Row: {
          change_reason: string | null
          changed_at: string | null
          changed_by: string
          id: string
          new_status: string
          old_status: string | null
          request_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by: string
          id?: string
          new_status: string
          old_status?: string | null
          request_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string
          id?: string
          new_status?: string
          old_status?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_status_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "government_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      task_completion_proofs: {
        Row: {
          agent_id: string
          assignment_id: string
          description: string | null
          file_path: string | null
          id: string
          proof_type: string
          uploaded_at: string | null
        }
        Insert: {
          agent_id: string
          assignment_id: string
          description?: string | null
          file_path?: string | null
          id?: string
          proof_type: string
          uploaded_at?: string | null
        }
        Update: {
          agent_id?: string
          assignment_id?: string
          description?: string | null
          file_path?: string | null
          id?: string
          proof_type?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_completion_proofs_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "request_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_request_to_agent: {
        Args: {
          admin_uuid: string
          agent_uuid: string
          assignment_notes?: string
          assignment_priority?: string
          request_uuid: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          notification_message: string
          notification_title: string
          notification_type?: string
          request_id?: string
          target_user_id: string
        }
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      user_has_role: {
        Args: { required_role: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "client" | "admin" | "agent"
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
      user_role: ["client", "admin", "agent"],
    },
  },
} as const
