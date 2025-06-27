
import { useState, useRef } from 'react';
import type { Listing } from '@/types/Listing';

export const useInventoryState = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isCurrentlyFetching, setIsCurrentlyFetching] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);

  // Cached data for offline mode
  const [cachedListings, setCachedListings] = useState<Listing[]>([]);

  return {
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
  };
};
