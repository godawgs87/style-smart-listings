
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';
import type { UnifiedInventoryOptions } from './types';

export const useInventoryQuery = () => {
  const executeOptimizedQuery = async (options: UnifiedInventoryOptions): Promise<Listing[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    console.log('👤 User authenticated, fetching listings with simple query...');

    // Much simpler query - just get the essential fields first
    let query = supabase
      .from('listings')
      .select('*')  // Simple select all - let Supabase handle it
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

    // Limit results for better performance
    const limit = Math.min(options.limit || 25, 50);
    query = query.limit(limit);

    console.log('📡 Executing simple database query...');
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

    console.log(`✅ Successfully fetched ${data.length} real listings from database`);
    
    // Simple transformation - trust the data types from Supabase
    const transformedListings: Listing[] = data.map(item => ({
      ...item,
      title: item.title || 'Untitled',
      price: Number(item.price) || 0,
      measurements: (typeof item.measurements === 'object' && item.measurements !== null) 
        ? item.measurements as { length?: string; width?: string; height?: string; weight?: string; }
        : {},
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
      photos: Array.isArray(item.photos) ? item.photos.filter(p => p && typeof p === 'string') : []
    }));

    return transformedListings;
  };

  return { executeOptimizedQuery };
};
