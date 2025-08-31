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
          user_id: string
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
          user_id: string
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
          user_id?: string
          vehicle_id?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          license_expiry: string | null
          license_number: string | null
          monthly_km: number
          phone: string | null
          status: string
          total_km: number
          total_trips: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          license_expiry?: string | null
          license_number?: string | null
          monthly_km?: number
          phone?: string | null
          status?: string
          total_km?: number
          total_trips?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          license_expiry?: string | null
          license_number?: string | null
          monthly_km?: number
          phone?: string | null
          status?: string
          total_km?: number
          total_trips?: number
          updated_at?: string
          user_id?: string
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
          user_id: string
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
          user_id: string
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
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      route_points: {
        Row: {
          accuracy: number | null
          created_at: string
          id: string
          latitude: number
          longitude: number
          recorded_at: string
          speed: number | null
          trip_id: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string
          speed?: number | null
          trip_id: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string
          speed?: number | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_points_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
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
          user_id: string
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
          user_id: string
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
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
          user_id: string
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
          user_id: string
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
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "driver" | "user"
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
      app_role: ["admin", "manager", "driver", "user"],
    },
  },
} as const
