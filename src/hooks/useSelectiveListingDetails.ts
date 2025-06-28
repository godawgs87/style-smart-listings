
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

interface VisibleColumns {
  image: boolean;
  measurements: boolean;
  keywords: boolean;
  description: boolean;
  purchasePrice: boolean;
  netProfit: boolean;
  profitMargin: boolean;
  purchaseDate: boolean;
  consignmentStatus: boolean;
  sourceType: boolean;
  sourceLocation: boolean;
  costBasis: boolean;
  daysToSell: boolean;
  performanceNotes: boolean;
}

export const useSelectiveListingDetails = () => {
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const [detailsCache, setDetailsCache] = useState<Map<string, Partial<Listing>>>(new Map());

  const getSelectiveColumns = useCallback((visibleColumns: VisibleColumns): string => {
    const baseColumns = ['id', 'title', 'price', 'status', 'category', 'condition', 'shipping_cost', 'created_at', 'updated_at', 'user_id'];
    const conditionalColumns: string[] = [];

    // Only add columns that are actually visible
    if (visibleColumns.image) {
      conditionalColumns.push('photos');
    }
    if (visibleColumns.measurements) {
      conditionalColumns.push('measurements');
    }
    if (visibleColumns.keywords) {
      conditionalColumns.push('keywords');
    }
    if (visibleColumns.description) {
      conditionalColumns.push('description');
    }
    if (visibleColumns.purchasePrice) {
      conditionalColumns.push('purchase_price');
    }
    if (visibleColumns.netProfit) {
      conditionalColumns.push('net_profit');
    }
    if (visibleColumns.profitMargin) {
      conditionalColumns.push('profit_margin');
    }
    if (visibleColumns.purchaseDate) {
      conditionalColumns.push('purchase_date');
    }
    if (visibleColumns.consignmentStatus) {
      conditionalColumns.push('is_consignment', 'consignment_percentage', 'consignor_name', 'consignor_contact');
    }
    if (visibleColumns.sourceType) {
      conditionalColumns.push('source_type');
    }
    if (visibleColumns.sourceLocation) {
      conditionalColumns.push('source_location');
    }
    if (visibleColumns.costBasis) {
      conditionalColumns.push('cost_basis');
    }
    if (visibleColumns.daysToSell) {
      conditionalColumns.push('days_to_sell', 'listed_date', 'sold_date');
    }
    if (visibleColumns.performanceNotes) {
      conditionalColumns.push('performance_notes');
    }

    return [...baseColumns, ...conditionalColumns].join(', ');
  }, []);

  const fetchSelectiveDetails = useCallback(async (
    listingId: string,
    visibleColumns: VisibleColumns
  ): Promise<{ details: Partial<Listing> | null; error?: string }> => {
    try {
      const selectColumns = getSelectiveColumns(visibleColumns);
      console.log('🔍 Fetching selective columns:', selectColumns.split(', '));
      
      const { data, error } = await supabase
        .from('listings')
        .select(selectColumns)
        .eq('id', listingId)
        .single();

      if (error) {
        console.error('❌ Selective details query error:', error);
        return { details: null, error: error.message };
      }

      if (!data) {
        console.error('❌ No data returned for listing:', listingId);
        return { details: null, error: 'No data found' };
      }

      // Transform to match Listing interface with proper type safety
      const transformedDetails: Partial<Listing> = {
        ...data,
        price: typeof data.price === 'number' ? data.price : Number(data.price) || 0,
        measurements: data.measurements && typeof data.measurements === 'object' 
          ? data.measurements as { length?: string; width?: string; height?: string; weight?: string; }
          : {},
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        photos: Array.isArray(data.photos) ? data.photos : [],
        shipping_cost: data.shipping_cost !== null && data.shipping_cost !== undefined 
          ? Number(data.shipping_cost) 
          : null,
      };

      console.log('✅ Successfully fetched selective listing details');
      return { details: transformedDetails };

    } catch (error: any) {
      console.error('💥 Exception in fetchSelectiveDetails:', error);
      return { details: null, error: error.message };
    }
  }, [getSelectiveColumns]);

  const loadSelectiveDetails = useCallback(async (
    listingId: string,
    visibleColumns: VisibleColumns
  ): Promise<Partial<Listing> | null> => {
    // Create a cache key based on listing ID and visible columns
    const cacheKey = `${listingId}-${JSON.stringify(visibleColumns)}`;
    
    // Return cached details if available
    if (detailsCache.has(cacheKey)) {
      console.log('📋 Returning cached selective details for:', listingId);
      return detailsCache.get(cacheKey) || null;
    }

    // Skip if already loading
    if (loadingDetails.has(listingId)) {
      console.log('⏳ Details already loading for:', listingId);
      return null;
    }

    console.log('🚀 Starting selective load for:', listingId);
    setLoadingDetails(prev => new Set(prev).add(listingId));

    try {
      const { details, error } = await fetchSelectiveDetails(listingId, visibleColumns);
      
      if (error) {
        console.error('❌ Failed to load selective details for:', listingId, error);
        return null;
      }

      if (details) {
        console.log('✅ Successfully loaded selective details for:', listingId);
        
        // Cache the details with the specific cache key
        setDetailsCache(prev => new Map(prev).set(cacheKey, details));
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
  }, [detailsCache, loadingDetails, fetchSelectiveDetails]);

  const isLoadingDetails = useCallback((listingId: string) => {
    return loadingDetails.has(listingId);
  }, [loadingDetails]);

  const clearCache = useCallback(() => {
    console.log('🧹 Clearing selective details cache');
    setDetailsCache(new Map());
    setLoadingDetails(new Set());
  }, []);

  return {
    loadSelectiveDetails,
    isLoadingDetails,
    clearCache
  };
};
