
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
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  const { fetchLightweightListings } = useLightweightQuery();
  const { getFallbackData, hasFallbackData } = useFallbackData();
  const { toast } = useToast();

  const fetchListings = useCallback(async () => {
    const now = Date.now();
    
    // Prevent rapid successive calls (debounce)
    if (now - lastFetchTime < 1000) {
      console.log('⏸️ Debouncing rapid fetch calls');
      return;
    }
    
    console.log('🚀 Starting fetchListings with options:', options);
    
    setLoading(true);
    setError(null);
    setLastFetchTime(now);
    
    try {
      const queryOptions = {
        statusFilter: options.statusFilter,
        categoryFilter: options.categoryFilter, 
        searchTerm: options.searchTerm,
        limit: options.limit || 5 // Start very small
      };

      console.log('📋 Query options:', queryOptions);
      
      const result = await fetchLightweightListings(queryOptions);
      const { listings: fetchedListings, error: fetchError } = result;
      
      if (fetchError === 'AUTH_ERROR') {
        console.log('🔒 Authentication error detected');
        setError('Authentication error. Please sign in again.');
        setUsingFallback(false);
        setListings([]);
      } else if (fetchError === 'CONNECTION_ERROR') {
        console.log('🔌 Connection error, checking for fallback data...');
        
        if (hasFallbackData()) {
          console.log('📚 Using fallback data');
          const fallbackListings = getFallbackData({
            statusFilter: options.statusFilter,
            categoryFilter: options.categoryFilter,
            searchTerm: options.searchTerm,
            limit: options.limit || 5
          });
          setListings(fallbackListings);
          setUsingFallback(true);
          setError(null);
          
          toast({
            title: "Using Offline Data",
            description: "Database connection slow. Showing cached data.",
            variant: "default"
          });
        } else {
          console.log('❌ No fallback data available');
          setError('Database connection failed. Please try again.');
          setUsingFallback(false);
          setListings([]);
        }
      } else {
        console.log(`✅ Successfully fetched ${fetchedListings.length} listings`);
        setListings(fetchedListings);
        setUsingFallback(false);
        setError(null);
      }
      
    } catch (error: any) {
      console.error('💥 Fetch exception:', error);
      
      // Handle timeout or other errors with fallback
      if (hasFallbackData()) {
        console.log('🔄 Using fallback due to exception');
        const fallbackListings = getFallbackData({
          statusFilter: options.statusFilter,
          categoryFilter: options.categoryFilter,
          searchTerm: options.searchTerm,
          limit: options.limit || 5
        });
        setListings(fallbackListings);
        setUsingFallback(true);
        setError(null);
        
        toast({
          title: "Database Timeout",
          description: "Using cached data due to slow connection.",
          variant: "default"
        });
      } else {
        setError('Connection failed. Please check your internet connection.');
        setUsingFallback(false);
        setListings([]);
      }
    } finally {
      setLoading(false);
    }
  }, [options.statusFilter, options.limit, options.searchTerm, options.categoryFilter, fetchLightweightListings, getFallbackData, hasFallbackData, toast, lastFetchTime]);

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch triggered');
    setUsingFallback(false);
    setLastFetchTime(0); // Reset debounce
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
