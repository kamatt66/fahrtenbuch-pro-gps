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
      costs: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          receipt_number: string | null
          recurring_interval: string | null
          updated_at: string
          user_id: string | null
          vehicle_id: string | null
          vendor: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          receipt_number?: string | null
          recurring_interval?: string | null
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          receipt_number?: string | null
          recurring_interval?: string | null
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      fuel_records: {
        Row: {
          created_at: string
          date: string
          fuel_amount: number
          fuel_type: string
          gas_station: string
          id: string
          location: string | null
          notes: string | null
          odometer_reading: number | null
          price_per_liter: number
          receipt_image_url: string | null
          receipt_number: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          fuel_amount: number
          fuel_type: string
          gas_station: string
          id?: string
          location?: string | null
          notes?: string | null
          odometer_reading?: number | null
          price_per_liter: number
          receipt_image_url?: string | null
          receipt_number?: string | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          fuel_amount?: number
          fuel_type?: string
          gas_station?: string
          id?: string
          location?: string | null
          notes?: string | null
          odometer_reading?: number | null
          price_per_liter?: number
          receipt_image_url?: string | null
          receipt_number?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: []
      }
      trips: {
        Row: {
          bluetooth_device: string | null
          created_at: string
          distance_km: number | null
          driver_name: string
          end_latitude: number | null
          end_location: string | null
          end_longitude: number | null
          end_time: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          purpose: string | null
          start_latitude: number | null
          start_location: string | null
          start_longitude: number | null
          start_time: string
          updated_at: string
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          bluetooth_device?: string | null
          created_at?: string
          distance_km?: number | null
          driver_name: string
          end_latitude?: number | null
          end_location?: string | null
          end_longitude?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          purpose?: string | null
          start_latitude?: number | null
          start_location?: string | null
          start_longitude?: number | null
          start_time?: string
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          bluetooth_device?: string | null
          created_at?: string
          distance_km?: number | null
          driver_name?: string
          end_latitude?: number | null
          end_location?: string | null
          end_longitude?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          purpose?: string | null
          start_latitude?: number | null
          start_location?: string | null
          start_longitude?: number | null
          start_time?: string
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string | null
          consumption: number | null
          created_at: string
          fuel: string | null
          id: string
          initial_km: number
          model: string | null
          monthly_km: number
          name: string
          plate: string
          status: string
          total_km: number
          updated_at: string
          user_id: string | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          consumption?: number | null
          created_at?: string
          fuel?: string | null
          id?: string
          initial_km?: number
          model?: string | null
          monthly_km?: number
          name: string
          plate: string
          status?: string
          total_km?: number
          updated_at?: string
          user_id?: string | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          consumption?: number | null
          created_at?: string
          fuel?: string | null
          id?: string
          initial_km?: number
          model?: string | null
          monthly_km?: number
          name?: string
          plate?: string
          status?: string
          total_km?: number
          updated_at?: string
          user_id?: string | null
          year?: number | null
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
