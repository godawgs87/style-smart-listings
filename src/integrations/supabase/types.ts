export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_photos: {
        Row: {
          ai_analysis_status: string | null
          compressed_path: string | null
          confidence_scores: Json | null
          created_at: string | null
          detected_brand: string | null
          detected_colors: Json | null
          detected_flaws: Json | null
          detected_material: string | null
          detected_measurements: Json | null
          file_size_bytes: number | null
          id: string
          is_primary: boolean | null
          listing_id: string | null
          mime_type: string | null
          original_filename: string | null
          photo_order: number
          photo_type: string | null
          storage_path: string
          thumbnail_path: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_analysis_status?: string | null
          compressed_path?: string | null
          confidence_scores?: Json | null
          created_at?: string | null
          detected_brand?: string | null
          detected_colors?: Json | null
          detected_flaws?: Json | null
          detected_material?: string | null
          detected_measurements?: Json | null
          file_size_bytes?: number | null
          id?: string
          is_primary?: boolean | null
          listing_id?: string | null
          mime_type?: string | null
          original_filename?: string | null
          photo_order?: number
          photo_type?: string | null
          storage_path: string
          thumbnail_path?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_analysis_status?: string | null
          compressed_path?: string | null
          confidence_scores?: Json | null
          created_at?: string | null
          detected_brand?: string | null
          detected_colors?: Json | null
          detected_flaws?: Json | null
          detected_material?: string | null
          detected_measurements?: Json | null
          file_size_bytes?: number | null
          id?: string
          is_primary?: boolean | null
          listing_id?: string | null
          mime_type?: string | null
          original_filename?: string | null
          photo_order?: number
          photo_type?: string | null
          storage_path?: string
          thumbnail_path?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          age_group: string | null
          ai_analysis_status: string | null
          ai_confidence_score: number | null
          ai_suggestions: Json | null
          brand: string | null
          bulk_session_id: string | null
          category: string | null
          category_id: string | null
          clothing_size: string | null
          color_primary: string | null
          color_secondary: string | null
          condition: string | null
          consignment_percentage: number | null
          consignor_contact: string | null
          consignor_name: string | null
          cost_basis: number | null
          created_at: string
          days_to_sell: number | null
          description: string | null
          fees_paid: number | null
          gender: string | null
          id: string
          is_consignment: boolean | null
          keywords: string[] | null
          listed_date: string | null
          markup_percentage: number | null
          material: string | null
          measurements: Json | null
          minimum_price: number | null
          net_profit: number | null
          package_height_in: number | null
          package_length_in: number | null
          package_width_in: number | null
          pattern: string | null
          performance_notes: string | null
          photos: string[] | null
          price: number
          price_research: string | null
          processing_order: number | null
          profit_margin: number | null
          purchase_date: string | null
          purchase_price: number | null
          shipping_cost: number | null
          ships_from_zip: string | null
          shoe_size: string | null
          size_type: string | null
          size_value: string | null
          sold_date: string | null
          sold_price: number | null
          source_location: string | null
          source_type: string | null
          status: string | null
          target_price: number | null
          title: string
          updated_at: string
          user_id: string
          user_notes: string | null
          user_review_status: string | null
          weight_oz: number | null
        }
        Insert: {
          age_group?: string | null
          ai_analysis_status?: string | null
          ai_confidence_score?: number | null
          ai_suggestions?: Json | null
          brand?: string | null
          bulk_session_id?: string | null
          category?: string | null
          category_id?: string | null
          clothing_size?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          condition?: string | null
          consignment_percentage?: number | null
          consignor_contact?: string | null
          consignor_name?: string | null
          cost_basis?: number | null
          created_at?: string
          days_to_sell?: number | null
          description?: string | null
          fees_paid?: number | null
          gender?: string | null
          id?: string
          is_consignment?: boolean | null
          keywords?: string[] | null
          listed_date?: string | null
          markup_percentage?: number | null
          material?: string | null
          measurements?: Json | null
          minimum_price?: number | null
          net_profit?: number | null
          package_height_in?: number | null
          package_length_in?: number | null
          package_width_in?: number | null
          pattern?: string | null
          performance_notes?: string | null
          photos?: string[] | null
          price: number
          price_research?: string | null
          processing_order?: number | null
          profit_margin?: number | null
          purchase_date?: string | null
          purchase_price?: number | null
          shipping_cost?: number | null
          ships_from_zip?: string | null
          shoe_size?: string | null
          size_type?: string | null
          size_value?: string | null
          sold_date?: string | null
          sold_price?: number | null
          source_location?: string | null
          source_type?: string | null
          status?: string | null
          target_price?: number | null
          title: string
          updated_at?: string
          user_id: string
          user_notes?: string | null
          user_review_status?: string | null
          weight_oz?: number | null
        }
        Update: {
          age_group?: string | null
          ai_analysis_status?: string | null
          ai_confidence_score?: number | null
          ai_suggestions?: Json | null
          brand?: string | null
          bulk_session_id?: string | null
          category?: string | null
          category_id?: string | null
          clothing_size?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          condition?: string | null
          consignment_percentage?: number | null
          consignor_contact?: string | null
          consignor_name?: string | null
          cost_basis?: number | null
          created_at?: string
          days_to_sell?: number | null
          description?: string | null
          fees_paid?: number | null
          gender?: string | null
          id?: string
          is_consignment?: boolean | null
          keywords?: string[] | null
          listed_date?: string | null
          markup_percentage?: number | null
          material?: string | null
          measurements?: Json | null
          minimum_price?: number | null
          net_profit?: number | null
          package_height_in?: number | null
          package_length_in?: number | null
          package_width_in?: number | null
          pattern?: string | null
          performance_notes?: string | null
          photos?: string[] | null
          price?: number
          price_research?: string | null
          processing_order?: number | null
          profit_margin?: number | null
          purchase_date?: string | null
          purchase_price?: number | null
          shipping_cost?: number | null
          ships_from_zip?: string | null
          shoe_size?: string | null
          size_type?: string | null
          size_value?: string | null
          sold_date?: string | null
          sold_price?: number | null
          source_location?: string | null
          source_type?: string | null
          status?: string | null
          target_price?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          user_notes?: string | null
          user_review_status?: string | null
          weight_oz?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_name: string
          plan_price_monthly: number | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_cycle?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name: string
          plan_price_monthly?: number | null
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_cycle?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string
          plan_price_monthly?: number | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          ai_training_completed: boolean | null
          created_at: string | null
          default_markup_percentage: number | null
          email: string
          full_name: string | null
          id: string
          last_photo_reset_date: string | null
          monthly_photo_limit: number | null
          onboarding_completed: boolean | null
          photos_used_this_month: number | null
          preferred_shipping_service: string | null
          subscription_ends_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          ai_training_completed?: boolean | null
          created_at?: string | null
          default_markup_percentage?: number | null
          email: string
          full_name?: string | null
          id: string
          last_photo_reset_date?: string | null
          monthly_photo_limit?: number | null
          onboarding_completed?: boolean | null
          photos_used_this_month?: number | null
          preferred_shipping_service?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_training_completed?: boolean | null
          created_at?: string | null
          default_markup_percentage?: number | null
          email?: string
          full_name?: string | null
          id?: string
          last_photo_reset_date?: string | null
          monthly_photo_limit?: number | null
          onboarding_completed?: boolean | null
          photos_used_this_month?: number | null
          preferred_shipping_service?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
