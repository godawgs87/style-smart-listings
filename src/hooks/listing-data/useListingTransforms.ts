
import type { Database } from '@/integrations/supabase/types';
import type { Listing } from '@/types/Listing';

type SupabaseListing = Database['public']['Tables']['listings']['Row'];

export const useListingTransforms = () => {
  const transformListing = (supabaseListing: any): Listing => {
    return {
      ...supabaseListing,
      measurements: supabaseListing.measurements || {},
      photos: supabaseListing.photos || [],
      keywords: supabaseListing.keywords || [],
      shipping_cost: supabaseListing.shipping_cost,
      description: supabaseListing.description || null,
      purchase_date: supabaseListing.purchase_date,
      source_location: supabaseListing.source_location,
      source_type: supabaseListing.source_type,
      cost_basis: supabaseListing.cost_basis,
      fees_paid: supabaseListing.fees_paid,
      sold_date: supabaseListing.sold_date,
      sold_price: supabaseListing.sold_price,
      days_to_sell: supabaseListing.days_to_sell,
      performance_notes: supabaseListing.performance_notes,
      price_research: supabaseListing.price_research,
      updated_at: supabaseListing.updated_at || supabaseListing.created_at,
      user_id: supabaseListing.user_id || '',
      consignor_name: supabaseListing.consignor_name,
      consignor_contact: supabaseListing.consignor_contact,
      listed_date: supabaseListing.listed_date,
      purchase_price: supabaseListing.purchase_price,
      net_profit: supabaseListing.net_profit,
      profit_margin: supabaseListing.profit_margin,
      is_consignment: supabaseListing.is_consignment,
      consignment_percentage: supabaseListing.consignment_percentage
    };
  };

  const transformFallbackListing = (fallbackItem: any): Listing => {
    return {
      id: fallbackItem.id,
      title: fallbackItem.title,
      price: fallbackItem.price,
      status: fallbackItem.status,
      created_at: fallbackItem.created_at,
      category: fallbackItem.category || null,
      condition: fallbackItem.condition || null,
      description: fallbackItem.description || null,
      measurements: {},
      photos: [],
      keywords: [],
      shipping_cost: null,
      purchase_date: undefined,
      source_location: undefined,
      source_type: undefined,
      cost_basis: undefined,
      fees_paid: undefined,
      sold_date: undefined,
      sold_price: undefined,
      days_to_sell: undefined,
      performance_notes: undefined,
      price_research: null,
      updated_at: fallbackItem.created_at,
      user_id: '',
      consignor_name: undefined,
      consignor_contact: undefined,
      listed_date: undefined,
      purchase_price: undefined,
      net_profit: undefined,
      profit_margin: undefined,
      is_consignment: undefined,
      consignment_percentage: undefined
    };
  };

  return {
    transformListing,
    transformFallbackListing
  };
};
