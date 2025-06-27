
import { useState, useEffect, useCallback } from 'react';
import { useLightweightQuery } from './listing-data/useLightweightQuery';
import { useFallbackData } from './listing-data/useFallbackData';
import { useToast } from '@/hooks/use-toast';
import type { Listing } from '@/types/Listing';

interface UseListingDataOptions {
  statusFilter?: string;
  limit?: number;
  searchTerm?: string;
  categoryFilter?: string;
}

export const useListingData = (options: UseListingDataOptions) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  
  const { fetchLightweightListings } = useLightweightQuery();
  const { getFallbackData, hasFallbackData } = useFallbackData();
  const { toast } = useToast();

  const fetchListings = useCallback(async () => {
    console.log('🚀 Starting fetchListings with options:', options);
    setLoading(true);
    setError(null);
    
    try {
      const queryOptions = {
        statusFilter: options.statusFilter,
        categoryFilter: options.categoryFilter, 
        searchTerm: options.searchTerm,
        limit: options.limit || 10
      };

      console.log('📋 Query options:', queryOptions);
      
      const { listings: fetchedListings, error: fetchError } = await fetchLightweightListings(queryOptions);
      
      if (fetchError === 'AUTH_ERROR') {
        console.log('🔒 Authentication error detected');
        setError('Authentication error. Please sign in again.');
        setLoading(false);
        return;
      }
      
      if (fetchError === 'CONNECTION_ERROR') {
        console.log('🔌 Connection error, checking for fallback data...');
        
        if (hasFallbackData()) {
          console.log('📚 Using fallback data');
          const fallbackListings = getFallbackData({
            statusFilter: options.statusFilter,
            categoryFilter: options.categoryFilter,
            searchTerm: options.searchTerm,
            limit: options.limit || 10
          });
          setListings(fallbackListings);
          setUsingFallback(true);
          setError(null);
          
          toast({
            title: "Using Offline Data",
            description: "Showing cached inventory data. Some features may be limited.",
            variant: "default"
          });
        } else {
          console.log('❌ No fallback data available');
          setError('Unable to connect to database and no cached data available');
          setListings([]);
        }
        setLoading(false);
        return;
      }
      
      console.log(`✅ Successfully fetched ${fetchedListings.length} listings`);
      setListings(fetchedListings);
      setUsingFallback(false);
      setError(null);
      
    } catch (error: any) {
      console.error('💥 Fetch exception:', error);
      setError(error.message || 'An unexpected error occurred');
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [options.statusFilter, options.limit, options.searchTerm, options.categoryFilter, fetchLightweightListings, getFallbackData, hasFallbackData, toast]);

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch triggered');
    setUsingFallback(false); // Reset fallback mode on manual retry
    fetchListings();
  }, [fetchListings]);

  const forceOfflineMode = useCallback(() => {
    console.log('🔌 Forcing offline mode...');
    if (hasFallbackData()) {
      const fallbackListings = getFallbackData();
      setListings(fallbackListings);
      setUsingFallback(true);
      setError(null);
      setLoading(false);
      
      toast({
        title: "Offline Mode",
        description: "Using cached data. Some features will be limited.",
        variant: "default"
      });
    } else {
      toast({
        title: "No Cached Data",
        description: "No offline data available. Please try connecting again.",
        variant: "destructive"
      });
    }
  }, [getFallbackData, hasFallbackData, toast]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    setListings,
    loading,
    error,
    usingFallback,
    fetchListings,
    refetch,
    forceOfflineMode
  };
};
