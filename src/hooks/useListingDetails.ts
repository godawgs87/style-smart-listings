
import { useState, useCallback } from 'react';
import { useListingDetailsQuery } from './listing-data/details/useListingDetailsQuery';
import type { Listing } from '@/types/Listing';

export const useListingDetails = () => {
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const [detailsCache, setDetailsCache] = useState<Map<string, Partial<Listing>>>(new Map());
  const { fetchListingDetails } = useListingDetailsQuery();

  const loadDetails = useCallback(async (listingId: string): Promise<Partial<Listing> | null> => {
    console.log('🔍 useListingDetails.loadDetails called for:', listingId);
    console.log('🔍 Current cache keys:', Array.from(detailsCache.keys()));
    console.log('🔍 Currently loading:', Array.from(loadingDetails));

    // Return cached details if available
    if (detailsCache.has(listingId)) {
      console.log('📋 Returning cached details for:', listingId);
      const cached = detailsCache.get(listingId);
      console.log('📋 Cached data:', cached);
      return cached || null;
    }

    // Skip if already loading
    if (loadingDetails.has(listingId)) {
      console.log('⏳ Details already loading for:', listingId);
      return null;
    }

    console.log('🚀 Starting fresh load for:', listingId);
    setLoadingDetails(prev => new Set(prev).add(listingId));

    try {
      console.log('📡 Calling fetchListingDetails for:', listingId);
      const { details, error } = await fetchListingDetails(listingId);
      
      console.log('📡 fetchListingDetails response:', { details, error });
      
      if (error) {
        console.error('❌ Failed to load details for:', listingId, error);
        return null;
      }

      if (details) {
        console.log('✅ Successfully loaded details for:', listingId);
        console.log('✅ Details content:', details);
        console.log('✅ Measurements:', details.measurements);
        console.log('✅ Keywords:', details.keywords);
        console.log('✅ Description:', details.description);
        
        setDetailsCache(prev => new Map(prev).set(listingId, details));
        console.log('💾 Cached details for:', listingId);
        return details;
      }

      console.log('⚠️ No details returned for:', listingId);
      return null;
    } finally {
      setLoadingDetails(prev => {
        const next = new Set(prev);
        next.delete(listingId);
        console.log('🏁 Finished loading for:', listingId, 'Remaining loads:', Array.from(next));
        return next;
      });
    }
  }, [detailsCache, loadingDetails, fetchListingDetails]);

  const isLoadingDetails = useCallback((listingId: string) => {
    const isLoading = loadingDetails.has(listingId);
    console.log('🤔 isLoadingDetails check for:', listingId, 'Result:', isLoading);
    return isLoading;
  }, [loadingDetails]);

  const hasDetails = useCallback((listingId: string) => {
    const hasIt = detailsCache.has(listingId);
    console.log('🤔 hasDetails check for:', listingId, 'Result:', hasIt);
    return hasIt;
  }, [detailsCache]);

  const clearCache = useCallback(() => {
    console.log('🧹 Clearing details cache');
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
