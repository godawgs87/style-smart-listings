
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

export const useListingDetails = () => {
  const [detailsCache, setDetailsCache] = useState<Map<string, Listing>>(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  const fetchListingDetails = useCallback(async (id: string): Promise<{
    details: Listing | null;
    error?: string;
  }> => {
    // Return cached details if available
    if (detailsCache.has(id)) {
      console.log('📋 Using cached details for:', id);
      return { details: detailsCache.get(id)! };
    }

    // Prevent duplicate requests
    if (loadingDetails.has(id)) {
      console.log('⏳ Already loading details for:', id);
      return { details: null };
    }

    setLoadingDetails(prev => new Set(prev).add(id));

    try {
      console.log('🔍 Fetching full details for listing:', id);
      
      const { data, error } = await supabase
        .from('listings')
        .select('*') // Now we can safely select all for single record
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Details query error:', error);
        return { details: null, error: error.message };
      }

      // Transform to match Listing interface
      const transformedDetails: Listing = {
        ...data,
        price: Number(data.price) || 0,
        measurements: data.measurements && typeof data.measurements === 'object' 
          ? data.measurements as { length?: string; width?: string; height?: string; weight?: string; }
          : {},
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        photos: Array.isArray(data.photos) ? data.photos : [],
        shipping_cost: data.shipping_cost || null,
      };

      // Cache the details
      setDetailsCache(prev => new Map(prev).set(id, transformedDetails));
      
      console.log('✅ Successfully fetched and cached listing details');
      return { details: transformedDetails };

    } catch (error: any) {
      console.error('💥 Exception in fetchListingDetails:', error);
      return { details: null, error: error.message };
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [detailsCache, loadingDetails]);

  const clearCache = useCallback(() => {
    setDetailsCache(new Map());
    setLoadingDetails(new Set());
  }, []);

  return {
    fetchListingDetails,
    clearCache,
    isLoadingDetails: (id: string) => loadingDetails.has(id),
    hasDetailsCache: (id: string) => detailsCache.has(id)
  };
};
