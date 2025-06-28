
export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  category_id?: string | null;
  condition: string | null;
  measurements: {
    length?: string;
    width?: string;
    height?: string;
    weight?: string;
  };
  keywords: string[] | null;
  photos: string[] | null;
  price_research: string | null;
  shipping_cost: number | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  purchase_price?: number | null;
  purchase_date?: string | null;
  is_consignment?: boolean | null;
  consignment_percentage?: number | null;
  consignor_name?: string | null;
  consignor_contact?: string | null;
  source_location?: string | null;
  source_type?: string | null;
  cost_basis?: number | null;
  fees_paid?: number | null;
  net_profit?: number | null;
  profit_margin?: number | null;
  listed_date?: string | null;
  sold_date?: string | null;
  sold_price?: number | null;
  days_to_sell?: number | null;
  performance_notes?: string | null;
  clothing_size?: string | null;
  shoe_size?: string | null;
  gender?: 'Men' | 'Women' | 'Kids' | 'Unisex' | null;
  age_group?: 'Adult' | 'Youth' | 'Toddler' | 'Baby' | null;
}
