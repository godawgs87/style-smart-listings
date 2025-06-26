
import type { Listing } from '@/types/Listing';

// Lightweight listing interface for initial load
interface LightweightListing {
  id: string;
  title: string;
  price: number;
  status: string | null;
  category: string | null;
  condition: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  purchase_price?: number;
  net_profit?: number;
  profit_margin?: number;
  days_to_sell?: number;
  shipping_cost?: number;
  photos?: string[] | null;
}

export const useLightweightTransformer = () => {
  const transformLightweightListings = (data: LightweightListing[]): Listing[] => {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      status: item.status,
      category: item.category,
      condition: item.condition,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user_id: item.user_id,
      purchase_price: item.purchase_price,
      net_profit: item.net_profit,
      profit_margin: item.profit_margin,
      days_to_sell: item.days_to_sell,
      description: null, // Will be loaded on-demand
      measurements: {},
      keywords: [],
      photos: item.photos ? (Array.isArray(item.photos) ? item.photos : []) : [], // Use photos array or empty
      price_research: null,
      shipping_cost: item.shipping_cost || null, // Use actual shipping cost
      purchase_date: null,
      is_consignment: false,
      consignment_percentage: null,
      cost_basis: null,
      fees_paid: null,
      listed_date: null,
      sold_date: null,
      sold_price: null,
      consignor_contact: null,
      source_location: null,
      source_type: null,
      performance_notes: null,
      consignor_name: null
    }));
  };

  return { transformLightweightListings };
};
