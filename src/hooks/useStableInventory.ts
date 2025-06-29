
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

interface StableInventoryOptions {
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

// Simple in-memory cache to prevent duplicate queries
const queryCache = new Map<string, { data: Listing[]; timestamp: number }>();
const CACHE_DURATION = 15000; // 15 seconds

export const useStableInventory = (options: StableInventoryOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const stats: InventoryStats = useMemo(() => ({
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  }), [listings]);

  const cacheKey = useMemo(() => {
    return JSON.stringify({
      searchTerm: options.searchTerm,
      statusFilter: options.statusFilter,
      categoryFilter: options.categoryFilter,
      limit: options.limit
    });
  }, [options]);

  const fetchInventory = useCallback(async (): Promise<Listing[]> => {
    console.log('🔍 Fetching stable inventory');
    
    // Check cache first
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ Using cached inventory data');
      return cached.data;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 5000); // Reduced to 5s timeout

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Please sign in to view your inventory');
      }

      console.log('🔍 Building query for user:', user.id);

      // Build more conservative query to avoid timeouts
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          price,
          category,
          condition,
          status,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters cautiously
      if (options.statusFilter && options.statusFilter !== 'all') {
        query = query.eq('status', options.statusFilter);
      }

      if (options.categoryFilter && options.categoryFilter !== 'all') {
        query = query.eq('category', options.categoryFilter);
      }

      if (options.searchTerm?.trim()) {
        query = query.ilike('title', `%${options.searchTerm.trim()}%`);
      }

      // Very conservative limit to avoid timeouts
      const limit = Math.min(options.limit || 20, 25);
      query = query.limit(limit);

      const { data, error } = await query.abortSignal(abortControllerRef.current.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error('❌ Query error:', error);
        if (error.code === '57014') {
          throw new Error('Query timed out - try using filters to narrow your search');
        }
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Successfully fetched listings:', data?.length || 0);
      
      // Process data safely with minimal fields
      const processedData = (data || []).map(listing => ({
        ...listing,
        measurements: {},
        keywords: [],
        photos: [],
        price: Number(listing.price) || 0,
        shipping_cost: 9.95,
        purchase_price: undefined,
        cost_basis: undefined
      })) as Listing[];
      
      // Cache the result
      queryCache.set(cacheKey, { data: processedData, timestamp: Date.now() });
      
      return processedData;
      
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        throw new Error('Request timed out - try using filters to narrow your search');
      }
      
      console.error('❌ Failed to fetch inventory:', err);
      throw err;
    }
  }, [options, cacheKey]);

  const loadData = useCallback(async (force = false) => {
    if (!mountedRef.current) return;

    console.log('📊 Loading inventory data, force:', force);
    
    try {
      setError(null);
      if (!isRefreshing) {
        setLoading(true);
      }

      const data = await fetchInventory();
      
      if (!mountedRef.current) return;

      setListings(data);
      console.log(`✅ Successfully loaded ${data.length} inventory items`);
      
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('❌ Load error:', err);
      const errorMessage = err.message || 'Failed to load inventory';
      setError(errorMessage);
      
      toast({
        title: "Error Loading Inventory",
        description: errorMessage.includes('timeout') ? 
          "Query timed out - try using filters to reduce data size" :
          "Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [fetchInventory, isRefreshing, toast]);

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch requested');
    // Clear cache for fresh data
    queryCache.delete(cacheKey);
    setIsRefreshing(true);
    loadData(true);
  }, [loadData, cacheKey]);

  const clearCache = useCallback(() => {
    queryCache.clear();
    console.log('🗑️ Inventory cache cleared');
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
    isRefreshing,
    refetch,
    clearCache
  };
};
