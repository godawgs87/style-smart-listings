
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

interface OptimizedInventoryOptions {
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

// Global cache to prevent duplicate queries
const queryCache = new Map<string, { data: Listing[]; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds
const activeQueries = new Set<string>();

export const useOptimizedInventory = (options: OptimizedInventoryOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Listing[]>([]);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const stats: InventoryStats = useMemo(() => ({
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  }), [listings]);

  // Create cache key from options
  const cacheKey = useMemo(() => {
    return JSON.stringify({
      searchTerm: options.searchTerm,
      statusFilter: options.statusFilter,
      categoryFilter: options.categoryFilter,
      limit: options.limit
    });
  }, [options]);

  const fetchInventory = useCallback(async (options: OptimizedInventoryOptions = {}): Promise<Listing[]> => {
    const queryKey = JSON.stringify(options);
    
    // Prevent duplicate queries
    if (activeQueries.has(queryKey)) {
      throw new Error('Query already in progress');
    }
    
    // Check cache first
    const cached = queryCache.get(queryKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🎯 Using cached inventory data');
      return cached.data;
    }

    activeQueries.add(queryKey);
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 8000); // 8s timeout

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }

      console.log('🔍 Fetching optimized inventory for user:', user.id);

      // Simplified query with only essential fields
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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

      // Reasonable limit
      const limit = Math.min(options.limit || 50, 75);
      query = query.limit(limit);

      const { data, error } = await query.abortSignal(abortControllerRef.current.signal);

      clearTimeout(timeoutId);
      activeQueries.delete(queryKey);

      if (error) {
        throw error;
      }

      console.log('✅ Fetched listings:', data?.length || 0);
      
      // Process data safely
      const processedData = (data || []).map(listing => ({
        ...listing,
        measurements: {},
        keywords: [],
        price: Number(listing.price) || 0,
        shipping_cost: Number(listing.shipping_cost) || 9.95,
        photos: Array.isArray(listing.photos) ? listing.photos : []
      })) as Listing[];
      
      // Cache the result
      queryCache.set(queryKey, { data: processedData, timestamp: Date.now() });
      
      return processedData;
      
    } catch (err: any) {
      clearTimeout(timeoutId);
      activeQueries.delete(queryKey);
      
      if (err.name === 'AbortError') {
        throw new Error('Request timed out - try using filters to narrow your search');
      }
      
      console.error('❌ Failed to fetch inventory:', err);
      throw err;
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchInventory(options);
      
      if (!mountedRef.current) return;

      setListings(data);
      setLastSuccessfulFetch(data);
      setIsUsingCache(false);
      
      console.log(`✅ Loaded ${data.length} inventory items`);
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('❌ Failed to fetch inventory:', err);
      
      // Fall back to last successful fetch if available
      if (lastSuccessfulFetch.length > 0) {
        setListings(lastSuccessfulFetch);
        setIsUsingCache(true);
        setError(null);
        
        toast({
          title: "Using Cached Data",
          description: "Couldn't load fresh data. Showing cached listings.",
          variant: "default"
        });
      } else {
        setError(err.message || 'Failed to load inventory');
        toast({
          title: "Unable to Load Listings", 
          description: err.message.includes('timeout') ? 
            "Query timed out - try using filters to reduce data size" :
            "Please check your connection and try again.",
          variant: "destructive"
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchInventory, lastSuccessfulFetch, toast, options]);

  const refetch = useCallback(() => {
    console.log('🔄 Refetching inventory data...');
    // Clear cache for this specific query
    queryCache.delete(cacheKey);
    loadData();
  }, [loadData, cacheKey]);

  const clearCache = useCallback(() => {
    queryCache.clear();
    setLastSuccessfulFetch([]);
    setIsUsingCache(false);
    console.log('🗑️ Cache cleared');
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  return {
    listings,
    loading,
    error,
    stats,
    isUsingCache,
    refetch,
    clearCache
  };
};

export type { OptimizedInventoryOptions, InventoryStats };
