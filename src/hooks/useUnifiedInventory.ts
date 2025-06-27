
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

export const useUnifiedInventory = (options: UnifiedInventoryOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isCurrentlyFetching, setIsCurrentlyFetching] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);
  const { toast } = useToast();

  // Cached data for offline mode
  const [cachedListings, setCachedListings] = useState<Listing[]>([]);

  console.log('🔄 useUnifiedInventory render:', {
    loading,
    error,
    usingFallback,
    listingsCount: listings.length,
    cachedCount: cachedListings.length,
    retryCount,
    options
  });

  const executeOptimizedQuery = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    console.log('👤 User authenticated, building optimized query...');

    // Build optimized query - fetch only essential fields first
    let query = supabase
      .from('listings')
      .select(`
        id,
        title,
        price,
        status,
        category,
        photos,
        created_at,
        user_id
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

    // Limit results for better performance
    const limit = Math.min(options.limit || 25, 50);
    query = query.limit(limit);

    console.log('📡 Executing optimized database query...');
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
    
    // Transform data to match Listing interface
    const transformedListings: Listing[] = data.map(item => ({
      id: item.id,
      title: item.title || 'Untitled',
      description: null,
      price: Number(item.price) || 0,
      category: item.category,
      condition: null,
      measurements: {},
      keywords: null,
      photos: Array.isArray(item.photos) ? item.photos.filter(p => p && typeof p === 'string') : null,
      price_research: null,
      shipping_cost: null,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.created_at,
      user_id: user.id,
      is_consignment: false,
      source_type: null,
      net_profit: null,
      profit_margin: null,
      purchase_date: undefined,
      source_location: undefined,
      cost_basis: undefined,
      fees_paid: undefined,
      sold_date: undefined,
      sold_price: undefined,
      days_to_sell: undefined,
      performance_notes: undefined,
      consignment_percentage: undefined,
      consignor_name: undefined,
      consignor_contact: undefined,
      listed_date: undefined,
      purchase_price: undefined
    }));

    return transformedListings;
  };

  const fetchInventory = useCallback(async () => {
    if (!mountedRef.current || isCurrentlyFetching) return;

    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      console.log('⏸️ Skipping fetch - too frequent');
      return;
    }

    console.log('🚀 Starting real inventory data fetch...');
    setIsCurrentlyFetching(true);
    setLastFetchTime(now);
    setError(null);

    try {
      const realListings = await executeOptimizedQuery();
      
      if (!mountedRef.current) return;

      setListings(realListings);
      setCachedListings(realListings); // Cache the real data
      setUsingFallback(false);
      setError(null);
      setRetryCount(0);

      console.log('✅ Real inventory data loaded and cached successfully');

    } catch (error: any) {
      if (!mountedRef.current) return;
      
      console.error('💥 Failed to fetch real inventory data:', error);
      
      const isConnectionError = error.message?.includes('timeout') || 
                              error.message?.includes('AbortError') ||
                              error.message?.includes('fetch');
      
      // Try to use cached real data if available
      if (cachedListings.length > 0) {
        console.log('📚 Using cached real data due to connection issue');
        setListings(cachedListings);
        setUsingFallback(true);
        setError(null);
      } else if (error.message === 'No authenticated user') {
        setError('Please log in to view your inventory');
        setListings([]);
        setUsingFallback(false);
      } else if (isConnectionError && retryCount < 2) {
        console.log(`🔄 Connection failed, will retry (attempt ${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        setError('Loading your inventory data...');
        setListings([]);
        setUsingFallback(false);
        
        // Retry after a short delay
        setTimeout(() => {
          if (mountedRef.current) {
            fetchInventory();
          }
        }, 1000 * (retryCount + 1)); // Progressive delay
        return;
      } else {
        setListings([]);
        setUsingFallback(false);
        setError('Unable to load inventory data. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsCurrentlyFetching(false);
      }
    }
  }, [options.searchTerm, options.statusFilter, options.categoryFilter, options.limit, cachedListings.length, retryCount]);

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch of real data triggered');
    setUsingFallback(false);
    setError(null);
    setLastFetchTime(0);
    setRetryCount(0);
    setIsCurrentlyFetching(false);
    fetchInventory();
  }, [fetchInventory]);

  const forceOfflineMode = useCallback(() => {
    console.log('🔌 Forcing offline mode with cached real data...');
    if (cachedListings.length > 0) {
      setListings(cachedListings);
      setUsingFallback(true);
      setError(null);
      setLoading(false);
      
      toast({
        title: "Using Cached Data",
        description: `Showing ${cachedListings.length} cached listings to avoid timeouts.`,
        variant: "default"
      });
    } else {
      toast({
        title: "No Cached Data Available",
        description: "Unable to load any inventory data offline.",
        variant: "destructive"
      });
    }
  }, [cachedListings, toast]);

  // Calculate stats from real data
  const stats: InventoryStats = {
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch of real data
    const timer = setTimeout(() => {
      if (mountedRef.current && !isCurrentlyFetching) {
        fetchInventory();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
    };
  }, [fetchInventory]);

  console.log('📊 Real inventory stats:', stats);

  return {
    listings,
    loading,
    error,
    usingFallback,
    stats,
    refetch,
    forceOfflineMode
  };
};
