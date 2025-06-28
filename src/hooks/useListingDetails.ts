
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
    details: Listing | null;
    error?: string;
  }> => {
    try {
      console.log('🔍 Fetching selective details for listing:', listingId);
      
      // Use selective columns instead of * to avoid timeout
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, description, price, status, category, condition, shipping_cost, measurements, keywords, photos, price_research, created_at, updated_at, purchase_price, purchase_date, is_consignment, consignment_percentage, consignor_name, consignor_contact, source_location, source_type, cost_basis, fees_paid, listed_date, days_to_sell, performance_notes, sold_price, sold_date, net_profit, profit_margin, user_id')
        .eq('id', listingId)
        .single();

      if (error) {
        console.error('❌ Details query error:', error);
        return { details: null, error: error.message };
      }

      console.log('🔍 Raw details from DB - shipping_cost:', data.shipping_cost, typeof data.shipping_cost);

      // Transform to match Listing interface
      const transformedDetails: Listing = {
        ...data,
        price: Number(data.price) || 0,
        measurements: data.measurements && typeof data.measurements === 'object' 
          ? data.measurements as { length?: string; width?: string; height?: string; weight?: string; }
          : {},
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        photos: Array.isArray(data.photos) ? data.photos : [],
        shipping_cost: data.shipping_cost !== null ? Number(data.shipping_cost) : null,
      };

      console.log('✅ Successfully fetched selective listing details');
      console.log('🔍 Transformed shipping_cost:', transformedDetails.shipping_cost, typeof transformedDetails.shipping_cost);
      return { details: transformedDetails };

    } catch (error: any) {
      console.error('💥 Exception in fetchListingDetails:', error);
      return { details: null, error: error.message };
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
