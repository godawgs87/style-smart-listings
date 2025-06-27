
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
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { fetchLightweightListings } = useLightweightQuery();
  const { getFallbackData, hasFallbackData } = useFallbackData();
  const { toast } = useToast();

  const fetchListings = useCallback(async () => {
    console.log('🚀 Starting fetchListings with options:', options);
    
    // Prevent rapid state changes that cause flashing
    if (isRetrying) {
      console.log('⏸️ Already retrying, skipping fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    setIsRetrying(true);
    
    try {
      const queryOptions = {
        statusFilter: options.statusFilter,
        categoryFilter: options.categoryFilter, 
        searchTerm: options.searchTerm,
        limit: options.limit || 10
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
            limit: options.limit || 10
          });
          setListings(fallbackListings);
          setUsingFallback(true);
          setError(null);
          
          toast({
            title: "Using Offline Data",
            description: "Database connection failed. Showing cached data.",
            variant: "default"
          });
        } else {
          console.log('❌ No fallback data available');
          setError('Database connection failed and no cached data available');
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
      
      // Handle timeout or other errors
      if (hasFallbackData()) {
        console.log('🔄 Using fallback due to exception');
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
          title: "Database Timeout",
          description: "Using cached data due to connection issues.",
          variant: "default"
        });
      } else {
        setError(error.message || 'Connection failed');
        setUsingFallback(false);
        setListings([]);
      }
    } finally {
      setLoading(false);
      // Add delay before allowing retry to prevent rapid state changes
      setTimeout(() => {
        setIsRetrying(false);
      }, 2000);
    }
  }, [options.statusFilter, options.limit, options.searchTerm, options.categoryFilter, fetchLightweightListings, getFallbackData, hasFallbackData, toast, isRetrying]);

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch triggered');
    setUsingFallback(false);
    setIsRetrying(false);
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
    // Only fetch if not already retrying
    if (!isRetrying) {
      fetchListings();
    }
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
