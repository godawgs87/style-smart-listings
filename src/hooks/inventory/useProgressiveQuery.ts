
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Listing } from '@/types/Listing';

interface QueryOptions {
  statusFilter?: string;
  categoryFilter?: string;
  searchTerm?: string;
  limit?: number;
}

export const useProgressiveQuery = () => {
  const [queryAttempts, setQueryAttempts] = useState(0);
  const { toast } = useToast();

  const fetchWithProgressiveDegradation = useCallback(async (options: QueryOptions): Promise<{
    listings: Listing[];
    error: string | null;
    usedFallback: boolean;
  }> => {
    console.log('🔄 Starting simple query...');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { listings: [], error: 'No authenticated user', usedFallback: false };
    }

    try {
      // Single, simple query - just get the basics
      let query = supabase
        .from('listings')
        .select('id, title, price, status, created_at')
        .eq('user_id', user.id);

      // Apply filters only if provided
      if (options.statusFilter && options.statusFilter !== 'all') {
        query = query.eq('status', options.statusFilter);
      }

      if (options.searchTerm?.trim()) {
        query = query.ilike('title', `%${options.searchTerm.trim()}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(options.limit || 10); // Start with just 10 items

      if (error) {
        console.error('❌ Query failed:', error);
        return {
          listings: [],
          error: `Database error: ${error.message}`,
          usedFallback: false
        };
      }

      console.log(`✅ Query succeeded: ${data?.length || 0} items loaded`);
      
      // Transform to full Listing objects with minimal processing
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

      return { listings: transformedListings, error: null, usedFallback: false };

    } catch (error: any) {
      console.error('💥 Unexpected error:', error);
      return {
        listings: [],
        error: `Failed to load inventory: ${error.message}`,
        usedFallback: false
      };
    }
  }, [toast]);

  const resetQueryAttempts = useCallback(() => {
    setQueryAttempts(0);
  }, []);

  return {
    fetchWithProgressiveDegradation,
    resetQueryAttempts,
    currentQueryLevel: queryAttempts
  };
};
