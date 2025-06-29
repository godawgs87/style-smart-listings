
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

interface UnifiedInventoryOptions {
  searchTerm?: string;
  statusFilter?: string;
  categoryFilter?: string;
  limit?: number;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  activeItems: number;
  draftItems: number;
}

// Simple memory cache - no global conflicts
const memoryCache = new Map<string, { data: Listing[]; timestamp: number }>();
const CACHE_DURATION = 10000; // 10 seconds only

export const useUnifiedInventoryHook = (options: UnifiedInventoryOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(true);
  const { toast } = useToast();

  const stats: InventoryStats = useMemo(() => ({
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  }), [listings]);

  const cacheKey = useMemo(() => {
    return `inventory-${JSON.stringify(options)}`;
  }, [options]);

  const fetchInventory = useCallback(async (): Promise<Listing[]> => {
    console.log('🔍 Fetching inventory with options:', options);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }

      // Build query step by step
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          price,
          category,
          condition,
          status,
          shipping_cost,
          photos,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id);

      // Apply filters
      if (options.statusFilter && options.statusFilter !== 'all') {
        query = query.eq('status', options.statusFilter);
      }

      if (options.categoryFilter && options.categoryFilter !== 'all') {
        query = query.eq('category', options.categoryFilter);
      }

      if (options.searchTerm?.trim()) {
        query = query.ilike('title', `%${options.searchTerm.trim()}%`);
      }

      // Limit results
      const limit = Math.min(options.limit || 50, 100);
      query = query.limit(limit).order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('❌ Query error:', error);
        throw error;
      }

      console.log('✅ Fetched listings:', data?.length || 0);
      
      // Process data
      const processedData = (data || []).map(listing => ({
        ...listing,
        measurements: {},
        keywords: [],
        price: Number(listing.price) || 0,
        shipping_cost: Number(listing.shipping_cost) || 9.95,
        photos: Array.isArray(listing.photos) ? listing.photos : []
      })) as Listing[];
      
      // Cache the result
      memoryCache.set(cacheKey, { data: processedData, timestamp: Date.now() });
      
      return processedData;
      
    } catch (err: any) {
      console.error('❌ Failed to fetch inventory:', err);
      throw err;
    }
  }, [options, cacheKey]);

  const loadData = useCallback(async (force = false) => {
    if (!mountedRef.current) return;

    // Check cache first (unless forced)
    if (!force) {
      const cached = memoryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('🎯 Using cached data');
        setListings(cached.data);
        setLoading(false);
        setError(null);
        return;
      }
    }

    try {
      setError(null);
      if (!isRefreshing) {
        setLoading(true);
      }

      const data = await fetchInventory();
      
      if (!mountedRef.current) return;

      setListings(data);
      setLoading(false);
      setIsRefreshing(false);
      
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('❌ Load error:', err);
      setError(err.message || 'Failed to load inventory');
      setLoading(false);
      setIsRefreshing(false);
      
      toast({
        title: "Error Loading Inventory",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    }
  }, [fetchInventory, cacheKey, isRefreshing, toast]);

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch requested');
    setIsRefreshing(true);
    // Clear cache for fresh data
    memoryCache.delete(cacheKey);
    loadData(true);
  }, [loadData, cacheKey]);

  const clearCache = useCallback(() => {
    memoryCache.clear();
    console.log('🗑️ Cache cleared');
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  return {
    listings,
    loading,
    error,
    stats,
    isRefreshing,
    refetch,
    clearCache
  };
};
