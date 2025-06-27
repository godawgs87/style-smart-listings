
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

    console.log('📡 Fetching inventory data...');

    let query = supabase
      .from('listings')
      .select('*')
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

    const limit = options.limit || 50;
    query = query.limit(limit);

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
      measurements: item.measurements || {},
      keywords: item.keywords || [],
      photos: Array.isArray(item.photos) ? item.photos.filter(p => p && typeof p === 'string') : []
    })) || [];
  }, []);

  return { fetchInventory };
};
