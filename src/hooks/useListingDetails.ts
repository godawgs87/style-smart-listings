
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

export const useListingDetails = () => {
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const [detailsCache, setDetailsCache] = useState<Map<string, Partial<Listing>>>(new Map());

  // Memoize the cache keys to avoid unnecessary re-renders
  const cacheKeys = useMemo(() => Array.from(detailsCache.keys()), [detailsCache]);
  const loadingKeys = useMemo(() => Array.from(loadingDetails), [loadingDetails]);

  const fetchListingDetails = useCallback(async (listingId: string): Promise<{
    details: Partial<Listing> | null;
    error?: string;
  }> => {
    try {
      console.log('🔍 Fetching minimal data for listing:', listingId);
      
      // Fetch just ID and photos with timeout protection
      const { data, error } = await supabase
        .from('listings')
        .select('id, photos')
        .eq('id', listingId)
        .abortSignal(AbortSignal.timeout(5000)) // 5 second timeout
        .single();

      if (error) {
        console.error('❌ Details query error:', error);
        // Return empty photos array if timeout, so UI doesn't break
        if (error.code === '57014') {
          return { 
            details: { id: listingId, photos: [] },
            error: 'timeout'
          };
        }
        return { details: null, error: error.message };
      }

      const transformedDetails = {
        id: data.id,
        photos: Array.isArray(data.photos) ? data.photos : []
      };

      console.log('✅ Successfully fetched listing data');
      return { details: transformedDetails };

    } catch (error: any) {
      console.error('💥 Exception in fetchListingDetails:', error);
      // Fallback for any errors
      return { 
        details: { id: listingId, photos: [] },
        error: error.message 
      };
    }
  }, []);

  const loadDetails = useCallback(async (listingId: string): Promise<Partial<Listing> | null> => {
    console.log('🔍 useListingDetails.loadDetails called for:', listingId);

    // Return cached details if available
    if (detailsCache.has(listingId)) {
      console.log('📋 Returning cached details for:', listingId);
      const cached = detailsCache.get(listingId);
      return cached || null;
    }

    // Skip if already loading
    if (loadingDetails.has(listingId)) {
      console.log('⏳ Details already loading for:', listingId);
      return null;
    }

    console.log('🚀 Starting selective load for:', listingId);
    setLoadingDetails(prev => new Set(prev).add(listingId));

    try {
      const { details, error } = await fetchListingDetails(listingId);
      
      if (error) {
        console.error('❌ Failed to load details for:', listingId, error);
        return null;
      }

      if (details) {
        console.log('✅ Successfully loaded selective details for:', listingId);
        console.log('💰 Shipping cost in details:', details.shipping_cost);
        
        // Cache the details
        setDetailsCache(prev => new Map(prev).set(listingId, details));
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
