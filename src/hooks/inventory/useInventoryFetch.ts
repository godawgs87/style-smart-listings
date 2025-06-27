
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Listing } from '@/types/Listing';
import type { UnifiedInventoryOptions } from './types';
import { useInventoryQuery } from './useInventoryQuery';

interface UseInventoryFetchProps {
  options: UnifiedInventoryOptions;
  mountedRef: React.MutableRefObject<boolean>;
  isCurrentlyFetching: boolean;
  setIsCurrentlyFetching: (value: boolean) => void;
  lastFetchTime: number;
  setLastFetchTime: (value: number) => void;
  setError: (value: string | null) => void;
  setListings: (value: Listing[]) => void;
  setCachedListings: (value: Listing[]) => void;
  setUsingFallback: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  retryCount: number;
  setRetryCount: (value: number | ((prev: number) => number)) => void;
  cachedListings: Listing[];
}

export const useInventoryFetch = ({
  options,
  mountedRef,
  isCurrentlyFetching,
  setIsCurrentlyFetching,
  lastFetchTime,
  setLastFetchTime,
  setError,
  setListings,
  setCachedListings,
  setUsingFallback,
  setLoading,
  retryCount,
  setRetryCount,
  cachedListings
}: UseInventoryFetchProps) => {
  const { toast } = useToast();
  const { executeOptimizedQuery } = useInventoryQuery();

  const fetchInventory = useCallback(async () => {
    if (!mountedRef.current || isCurrentlyFetching) {
      console.log('⏸️ Skipping fetch - already fetching or unmounted');
      return;
    }

    const now = Date.now();
    // Increase debounce time to prevent duplicate requests
    if (now - lastFetchTime < 3000) {
      console.log('⏸️ Skipping fetch - too frequent (debounced)');
      return;
    }

    console.log('🚀 Starting inventory data fetch...');
    setIsCurrentlyFetching(true);
    setLastFetchTime(now);
    setError(null);

    try {
      // Reduced timeout to 3 seconds for ultra-fast queries
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 3000)
      );

      const realListings = await Promise.race([
        executeOptimizedQuery(options),
        timeoutPromise
      ]) as Listing[];
      
      if (!mountedRef.current) return;

      setListings(realListings);
      setCachedListings(realListings);
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
      } else if (isTimeoutError && retryCount < 1) { // Reduced retry attempts
        console.log(`🔄 Connection failed, will retry (attempt ${retryCount + 1}/2)`);
        setRetryCount(prev => prev + 1);
        setError('Loading your inventory data...');
        setListings([]);
        setUsingFallback(false);
        
        // Longer delay between retries
        setTimeout(() => {
          if (mountedRef.current) {
            fetchInventory();
          }
        }, 2000 * (retryCount + 1));
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
  }, [options.searchTerm, options.statusFilter, options.categoryFilter, options.limit, cachedListings.length, retryCount, toast, executeOptimizedQuery, mountedRef, isCurrentlyFetching, lastFetchTime, setIsCurrentlyFetching, setLastFetchTime, setError, setListings, setCachedListings, setUsingFallback, setLoading, setRetryCount]);

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch of real data triggered');
    setUsingFallback(false);
    setError(null);
    setLastFetchTime(0);
    setRetryCount(0);
    setIsCurrentlyFetching(false);
    fetchInventory();
  }, [fetchInventory, setUsingFallback, setError, setLastFetchTime, setRetryCount, setIsCurrentlyFetching]);

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
  }, [cachedListings, setListings, setUsingFallback, setError, setLoading, toast]);

  return {
    fetchInventory,
    refetch,
    forceOfflineMode
  };
};
