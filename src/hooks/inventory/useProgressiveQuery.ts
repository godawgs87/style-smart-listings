
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
    console.log('🔄 Starting simple query...');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { listings: [], error: 'No authenticated user' };
    }

    try {
      let query = supabase
        .from('listings')
        .select('id, title, price, status, created_at')
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
      
      const transformedListings: Listing[] = (data || []).map(item => ({
        id: item.id || '',
        title: item.title || 'Untitled',
        price: Number(item.price) || 0,
        status: item.status || 'draft',
        category: null,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.created_at || new Date().toISOString(),
        measurements: {},
        keywords: [],
        photos: [],
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
        condition: null,
        shipping_cost: null,
        purchase_price: null,
        net_profit: null,
        profit_margin: null
      }));

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
