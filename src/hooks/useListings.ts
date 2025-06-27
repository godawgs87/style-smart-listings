
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOptimizedQuery } from './listing-data/useOptimizedQuery';
import { useFallbackData } from './listing-data/useFallbackData';
import { useListingOperations } from './useListingOperations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

interface UseListingsOptions {
  statusFilter?: string;
  limit?: number;
  searchTerm?: string;
  categoryFilter?: string;
}

export const useListings = (options: UseListingsOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const lastOptionsRef = useRef<string>('');
  
  const { fetchOptimizedListings } = useOptimizedQuery();
  const { getFallbackData, hasFallbackData } = useFallbackData();
  const { deleteListing, updateListing, updateListingStatus } = useListingOperations();
  const { toast } = useToast();

  const fetchListings = useCallback(async () => {
    const now = Date.now();
    const currentOptionsKey = JSON.stringify(options);
    
    // OPTIMIZED: Prevent redundant calls with same options
    if (currentOptionsKey === lastOptionsRef.current && now - lastFetchTime < 3000) {
      console.log('⏸️ Skipping redundant fetch - same options within 3s');
      return;
    }
    
    // OPTIMIZED: Much longer debounce to reduce egress significantly
    if (now - lastFetchTime < 3000 && lastOptionsRef.current !== '') {
      console.log('⏸️ Debouncing rapid fetch calls to minimize database egress');
      return;
    }
    
    console.log('🚀 Starting optimized fetchListings with options:', options);
    
    setLoading(true);
    setError(null);
    setLastFetchTime(now);
    lastOptionsRef.current = currentOptionsKey;
    
    try {
      const queryOptions = {
        statusFilter: options.statusFilter,
        categoryFilter: options.categoryFilter, 
        searchTerm: options.searchTerm,
        limit: Math.min(options.limit || 3, 15) // Cap at 15 to reduce egress
      };

      console.log('📋 Final query options:', queryOptions);
      
      const result = await fetchOptimizedListings(queryOptions);
      const { listings: fetchedListings, error: fetchError } = result;
      
      if (fetchError === 'AUTH_ERROR') {
        console.log('🔒 Authentication error detected');
        setError('Authentication error. Please sign in again.');
        setUsingFallback(false);
        setListings([]);
      } else if (fetchError === 'CONNECTION_ERROR') {
        console.log('🔌 Connection error, checking for fallback data...');
        
        if (hasFallbackData()) {
          console.log('📚 Using fallback data to reduce database load');
          const fallbackListings = getFallbackData({
            statusFilter: options.statusFilter,
            categoryFilter: options.categoryFilter,
            searchTerm: options.searchTerm,
            limit: queryOptions.limit
          });
          setListings(fallbackListings);
          setUsingFallback(true);
          setError(null);
          
          toast({
            title: "Using Cached Data",
            description: "Database overloaded. Using cached data to reduce usage.",
            variant: "default"
          });
        } else {
          setError('Database connection failed. Please try again later.');
          setUsingFallback(false);
          setListings([]);
        }
      } else {
        console.log(`✅ Successfully fetched ${fetchedListings.length} listings with optimized query`);
        setListings(fetchedListings);
        setUsingFallback(false);
        setError(null);
      }
      
    } catch (error: any) {
      console.error('💥 Fetch exception:', error);
      setError('Failed to load listings. Database usage may be high.');
      setUsingFallback(false);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [options.statusFilter, options.limit, options.searchTerm, options.categoryFilter, fetchOptimizedListings, getFallbackData, hasFallbackData, toast, lastFetchTime]);

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch triggered');
    setUsingFallback(false);
    setLastFetchTime(0); // Reset debounce
    lastOptionsRef.current = ''; // Reset options cache
    fetchListings();
  }, [fetchListings]);

  const forceOfflineMode = useCallback(() => {
    console.log('🔌 Forcing offline mode to reduce database usage...');
    if (hasFallbackData()) {
      const fallbackListings = getFallbackData();
      setListings(fallbackListings);
      setUsingFallback(true);
      setError(null);
      setLoading(false);
      
      toast({
        title: "Offline Mode Active",
        description: "Using cached data to reduce database usage.",
        variant: "default"
      });
    } else {
      toast({
        title: "No Cached Data",
        description: "No offline data available.",
        variant: "destructive"
      });
    }
  }, [getFallbackData, hasFallbackData, toast]);

  // OPTIMIZED: Longer delay to batch requests and reduce frequency
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 1000); // Longer delay to batch requests

    return () => clearTimeout(timer);
  }, [fetchListings]);

  const duplicateListing = useCallback(async (item: Listing): Promise<Listing | null> => {
    try {
      console.log('📋 Duplicating listing:', item.id);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error during duplicate:', authError);
        toast({
          title: "Authentication Required",
          description: "Please log in to duplicate listings",
          variant: "destructive"
        });
        return null;
      }

      const { data, error } = await supabase
        .from('listings')
        .insert({
          title: `${item.title} (Copy)`,
          description: item.description,
          price: item.price,
          category: item.category,
          condition: item.condition,
          measurements: item.measurements,
          keywords: item.keywords,
          photos: item.photos,
          shipping_cost: item.shipping_cost,
          status: 'draft',
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error duplicating listing:', error);
        toast({
          title: "Error",
          description: "Failed to duplicate listing",
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Listing duplicated successfully",
        variant: "default"
      });

      // Refresh listings after duplication
      refetch();
      
      return data as Listing;
    } catch (error) {
      console.error('💥 Exception duplicating listing:', error);
      return null;
    }
  }, [toast, refetch]);

  return {
    listings,
    loading,
    error,
    usingFallback,
    deleteListing,
    duplicateListing,
    updateListing,
    updateListingStatus,
    refetch,
    forceOfflineMode
  };
};
