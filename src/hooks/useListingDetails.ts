
import { useState, useCallback } from 'react';
import { useLightweightQuery } from './listing-data/useLightweightQuery';
import type { Listing } from '@/types/Listing';

export const useListingDetails = () => {
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const [detailsCache, setDetailsCache] = useState<Map<string, Partial<Listing>>>(new Map());
  const { fetchListingDetails } = useLightweightQuery();

  const loadDetails = useCallback(async (listingId: string): Promise<Partial<Listing> | null> => {
    // Return cached details if available
    if (detailsCache.has(listingId)) {
      console.log('📋 Returning cached details for:', listingId);
      return detailsCache.get(listingId) || null;
    }

    // Skip if already loading
    if (loadingDetails.has(listingId)) {
      console.log('⏳ Details already loading for:', listingId);
      return null;
    }

    setLoadingDetails(prev => new Set(prev).add(listingId));

    try {
      const { details, error } = await fetchListingDetails(listingId);
      
      if (error) {
        console.error('❌ Failed to load details for:', listingId, error);
        return null;
      }

      if (details) {
        setDetailsCache(prev => new Map(prev).set(listingId, details));
        console.log('✅ Loaded and cached details for:', listingId);
        return details;
      }

      return null;
    } finally {
      setLoadingDetails(prev => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
    }
  }, [detailsCache, loadingDetails, fetchListingDetails]);

  const isLoadingDetails = useCallback((listingId: string) => {
    return loadingDetails.has(listingId);
  }, [loadingDetails]);

  const hasDetails = useCallback((listingId: string) => {
    return detailsCache.has(listingId);
  }, [detailsCache]);

  const clearCache = useCallback(() => {
    setDetailsCache(new Map());
    setLoadingDetails(new Set());
  }, []);

  return {
    loadDetails,
    isLoadingDetails,
    hasDetails,
    clearCache
  };
};
