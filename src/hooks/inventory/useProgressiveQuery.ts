
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

interface QueryOptions {
  statusFilter?: string;
  searchTerm?: string;
  limit?: number;
}

export const useProgressiveQuery = () => {
  const fetchWithProgressiveDegradation = useCallback(async (options: QueryOptions): Promise<{
    listings: Listing[];
    error: string | null;
  }> => {
    console.log('🔄 Starting optimized query...');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { listings: [], error: 'No authenticated user' };
    }

    try {
      // First try with only essential columns to avoid timeout
      let query = supabase
        .from('listings')
        .select('id, title, price, status, created_at, photos, category, condition, shipping_cost')
        .eq('user_id', user.id);

      if (options.statusFilter && options.statusFilter !== 'all') {
        query = query.eq('status', options.statusFilter);
      }

      if (options.searchTerm?.trim()) {
        query = query.ilike('title', `%${options.searchTerm.trim()}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(options.limit || 10);

      if (error) {
        console.error('❌ Query failed:', error);
        return {
          listings: [],
          error: `Database error: ${error.message}`
        };
      }

      console.log(`✅ Query succeeded: ${data?.length || 0} items loaded`);
      console.log('📦 Raw data from database:', data);
      
      const transformedListings: Listing[] = (data || []).map(item => {
        console.log(`🚢 Processing shipping_cost for ${item.title}:`, item.shipping_cost, typeof item.shipping_cost);
        
        const processedShippingCost = item.shipping_cost ? Number(item.shipping_cost) : null;
        console.log(`🚢 Processed shipping_cost:`, processedShippingCost);
        
        return {
          id: item.id || '',
          title: item.title || 'Untitled',
          price: Number(item.price) || 0,
          status: item.status || 'draft',
          category: item.category || null,
          condition: item.condition || null,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.created_at || new Date().toISOString(),
          photos: Array.isArray(item.photos) ? item.photos : [],
          measurements: {},
          keywords: [],
          user_id: user.id,
          description: null,
          purchase_date: null,
          cost_basis: null,
          sold_price: null,
          sold_date: null,
          price_research: null,
          consignment_percentage: null,
          consignor_name: null,
          consignor_contact: null,
          source_location: null,
          source_type: null,
          fees_paid: null,
          listed_date: null,
          days_to_sell: null,
          performance_notes: null,
          is_consignment: false,
          shipping_cost: processedShippingCost,
          purchase_price: null,
          net_profit: null,
          profit_margin: null
        };
      });

      console.log('🎯 Final transformed listings shipping costs:', transformedListings.map(l => ({ title: l.title, shipping_cost: l.shipping_cost })));

      return { listings: transformedListings, error: null };

    } catch (error: any) {
      console.error('💥 Unexpected error:', error);
      return {
        listings: [],
        error: `Failed to load inventory: ${error.message}`
      };
    }
  }, []);

  return { fetchWithProgressiveDegradation };
};
