
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

  const fetchInventory = useCallback(async () => {
    if (!mountedRef.current || isCurrentlyFetching) return;

    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      console.log('⏸️ Skipping fetch - too frequent');
      return;
    }

    console.log('🚀 Starting inventory data fetch...');
    setIsCurrentlyFetching(true);
    setLastFetchTime(now);
    setError(null);

    try {
      // Reduced timeout to 5 seconds for faster feedback
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      );

      const realListings = await Promise.race([
        executeOptimizedQuery(),
        timeoutPromise
      ]) as Listing[];
      
      if (!mountedRef.current) return;

      setListings(realListings);
      setCachedListings(realListings); // Cache the real data
      setUsingFallback(false);
      setError(null);
      setRetryCount(0);

      console.log('✅ Real inventory data loaded and cached successfully');

      if (realListings.length > 0) {
        toast({
          title: "Inventory Loaded",
          description: `Successfully loaded ${realListings.length} listings from database.`,
          variant: "default"
        });
      }

    } catch (error: any) {
      if (!mountedRef.current) return;
      
      console.error('💥 Failed to fetch real inventory data:', error);
      
      const isTimeoutError = error.message?.includes('timeout') || 
                            error.message?.includes('AbortError');
      
      // Try to use cached real data if available
      if (cachedListings.length > 0) {
        console.log('📚 Using cached real data due to connection issue');
        setListings(cachedListings);
        setUsingFallback(true);
        setError(null);
        
        toast({
          title: "Using Cached Data",
          description: `Showing ${cachedListings.length} cached listings due to connection issues.`,
          variant: "default"
        });
      } else if (error.message === 'No authenticated user') {
        setError('Please log in to view your inventory');
        setListings([]);
        setUsingFallback(false);
      } else if (isTimeoutError && retryCount < 2) {
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
        console.log('💥 No cached data available - showing empty state');
        setListings([]);
        setUsingFallback(false);
        setError('Database connection issues. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsCurrentlyFetching(false);
      }
    }
  }, [options.searchTerm, options.statusFilter, options.categoryFilter, options.limit, cachedListings.length, retryCount, toast]);

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

  console.log('📊 Final stats:', stats);

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
