
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';
import type { UnifiedInventoryOptions } from './types';

export const useInventoryData = () => {
  const { toast } = useToast();

  const fetchInventory = useCallback(async (options: UnifiedInventoryOptions): Promise<Listing[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    console.log('📡 Fetching inventory data with optimized query...');

    // Use the optimized composite indexes created in migrations
    let query = supabase
      .from('listings')
      .select(`
        id,
        title,
        description,
        price,
        category,
        condition,
        status,
        created_at,
        updated_at,
        measurements,
        keywords,
        photos,
        shipping_cost,
        purchase_price,
        purchase_date,
        cost_basis,
        sold_price,
        sold_date
      `)
      .eq('user_id', user.id);

    // Apply filters in order of selectivity (most selective first)
    if (options.statusFilter && options.statusFilter !== 'all') {
      query = query.eq('status', options.statusFilter);
    }

    if (options.categoryFilter && options.categoryFilter !== 'all') {
      query = query.eq('category', options.categoryFilter);
    }

    if (options.searchTerm?.trim()) {
      // Use simpler ILIKE for better performance
      query = query.ilike('title', `%${options.searchTerm.trim()}%`);
    }

    // Always order and limit to use indexes efficiently
    const limit = Math.min(options.limit || 50, 100); // Cap at 100 for performance
    query = query
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('❌ Database query failed:', error);
      throw error;
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} listings`);
    
    return data?.map(item => ({
      ...item,
      title: item.title || 'Untitled',
      price: Number(item.price) || 0,
      measurements: typeof item.measurements === 'object' && item.measurements !== null 
        ? item.measurements as { length?: string; width?: string; height?: string; weight?: string; }
        : {},
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
      photos: Array.isArray(item.photos) ? item.photos.filter(p => p && typeof p === 'string') : [],
      user_id: user.id
    })) || [];
  }, []);

  return { fetchInventory };
};
