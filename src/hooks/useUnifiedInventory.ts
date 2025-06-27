
import { useEffect } from 'react';
import type { UnifiedInventoryOptions, InventoryStats } from './inventory/types';
import { useInventoryState } from './inventory/useInventoryState';
import { useInventoryStats } from './inventory/useInventoryStats';
import { useInventoryFetch } from './inventory/useInventoryFetch';

export const useUnifiedInventory = (options: UnifiedInventoryOptions = {}) => {
  const {
    listings,
    setListings,
    loading,
    setLoading,
    error,
    setError,
    usingFallback,
    setUsingFallback,
    lastFetchTime,
    setLastFetchTime,
    isCurrentlyFetching,
    setIsCurrentlyFetching,
    retryCount,
    setRetryCount,
    mountedRef,
    cachedListings,
    setCachedListings
  } = useInventoryState();

  console.log('🔄 useUnifiedInventory render:', {
    loading,
    error,
    usingFallback,
    listingsCount: listings.length,
    cachedCount: cachedListings.length,
    retryCount,
    options
  });

  const { fetchInventory, refetch, forceOfflineMode } = useInventoryFetch({
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
  });

  // Calculate stats from real data
  const stats: InventoryStats = useInventoryStats(listings);

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
  }, [fetchInventory, isCurrentlyFetching, mountedRef]);

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

// Re-export types for convenience
export type { UnifiedInventoryOptions, InventoryStats };
