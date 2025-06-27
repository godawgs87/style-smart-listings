
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';
import type { UnifiedInventoryOptions } from './types';

export const useInventoryQuery = () => {
  const executeOptimizedQuery = async (options: UnifiedInventoryOptions): Promise<Listing[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    console.log('👤 User authenticated, executing ultra-light query...');

    // Ultra-minimal query - only essential fields first
    let query = supabase
      .from('listings')
      .select(`
        id,
        title,
        price,
        status,
        category,
        created_at,
        photos,
        description
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (options.statusFilter && options.statusFilter !== 'all') {
      query = query.eq('status', options.statusFilter);
    }

    if (options.searchTerm?.trim()) {
      query = query.ilike('title', `%${options.searchTerm.trim()}%`);
    }

    if (options.categoryFilter && options.categoryFilter !== 'all') {
      query = query.eq('category', options.categoryFilter);
    }

    // Very small limit for fast loading
    const limit = Math.min(options.limit || 10, 15);
    query = query.limit(limit);

    console.log('📡 Executing ultra-light database query...');
    const startTime = Date.now();
    
    const { data, error } = await query;
    
    const duration = Date.now() - startTime;
    console.log(`⏱️ Query completed in ${duration}ms`);

    if (error) {
      console.error('❌ Database query failed:', error);
      throw error;
    }

    if (!data) {
      console.log('📭 No data returned from query');
      return [];
    }

    console.log(`✅ Successfully fetched ${data.length} listings from database`);
    
    // Minimal transformation - only what's absolutely necessary
    const transformedListings: Listing[] = data.map(item => ({
      ...item,
      title: item.title || 'Untitled',
      price: Number(item.price) || 0,
      measurements: {},
      keywords: [],
      photos: Array.isArray(item.photos) ? item.photos.filter(p => p && typeof p === 'string') : [],
      // Set default values for required fields not in the query
      user_id: user.id,
      updated_at: item.created_at,
      condition: null,
      shipping_cost: null,
      price_research: null,
      purchase_price: null,
      purchase_date: null,
      is_consignment: null,
      consignment_percentage: null,
      consignor_name: null,
      consignor_contact: null,
      source_location: null,
      source_type: null,
      cost_basis: null,
      fees_paid: null,
      net_profit: null,
      profit_margin: null,
      listed_date: null,
      sold_date: null,
      sold_price: null,
      days_to_sell: null,
      performance_notes: null
    }));

    return transformedListings;
  };

  return { executeOptimizedQuery };
};
