
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOptimizedQuery } from '../listing-data/useOptimizedQuery';
import { useFallbackData } from '../listing-data/useFallbackData';
import { useToast } from '@/hooks/use-toast';
import type { Listing } from '@/types/Listing';

interface UseListingsCoreOptions {
  statusFilter?: string;
  limit?: number;
  searchTerm?: string;
  categoryFilter?: string;
}

export const useListingsCore = (options: UseListingsCoreOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isCurrentlyFetching, setIsCurrentlyFetching] = useState(false);
  const lastOptionsRef = useRef<string>('');
  
  const { fetchOptimizedListings } = useOptimizedQuery();
  const { getFallbackData, hasFallbackData } = useFallbackData();
  const { toast } = useToast();

  const fetchListings = useCallback(async () => {
    const now = Date.now();
    const currentOptionsKey = JSON.stringify(options);
    
    // Prevent duplicate fetches
    if (isCurrentlyFetching) {
      console.log('⏸️ Skipping fetch - another fetch already in progress');
      return;
    }
    
    // Debounce rapid successive calls
    if (currentOptionsKey === lastOptionsRef.current && now - lastFetchTime < 2000) {
      console.log('⏸️ Skipping redundant fetch - same options within 2s');
      return;
    }
    
    console.log('🚀 Starting lightweight fetchListings with options:', options);
    
    setIsCurrentlyFetching(true);
    setLoading(true);
    setError(null);
    setLastFetchTime(now);
    lastOptionsRef.current = currentOptionsKey;
    
    try {
      const queryOptions = {
        statusFilter: options.statusFilter,
        categoryFilter: options.categoryFilter, 
        searchTerm: options.searchTerm,
        limit: Math.min(options.limit || 12, 25) // Keep limit low to prevent timeouts
      };

      console.log('📋 Final query options:', queryOptions);
      
      const result = await fetchOptimizedListings(queryOptions);
      const { listings: fetchedListings, error: fetchError } = result;
      
      if (fetchError === 'AUTH_ERROR') {
        console.log('🔒 Authentication error detected');
        setError('AUTHENTICATION_ERROR: Please sign in again.');
        setUsingFallback(false);
        setListings([]);
      } else if (fetchError === 'CONNECTION_ERROR') {
        console.log('🔌 Connection error, switching to fallback data...');
        
        if (hasFallbackData()) {
          console.log('📚 Using fallback data due to database timeout');
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
            title: "Database Timeout",
            description: "Using cached data. Database queries are taking too long.",
            variant: "default"
          });
        } else {
          setError('DATABASE_TIMEOUT_ERROR: Query timed out. Please try with filters.');
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
      setError('DATABASE_ERROR: Failed to load listings.');
      setUsingFallback(false);
      setListings([]);
    } finally {
      setLoading(false);
      setIsCurrentlyFetching(false);
    }
  }, [options.statusFilter, options.limit, options.searchTerm, options.categoryFilter, fetchOptimizedListings, getFallbackData, hasFallbackData, toast, isCurrentlyFetching]);

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch triggered');
    setUsingFallback(false);
    setLastFetchTime(0);
    lastOptionsRef.current = '';
    setIsCurrentlyFetching(false);
    fetchListings();
  }, [fetchListings]);

  const forceOfflineMode = useCallback(() => {
    console.log('🔌 Forcing offline mode to reduce database load...');
    if (hasFallbackData()) {
      const fallbackListings = getFallbackData();
      setListings(fallbackListings);
      setUsingFallback(true);
      setError(null);
      setLoading(false);
      
      toast({
        title: "Offline Mode Active",
        description: "Using cached data to prevent database timeouts.",
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

  useEffect(() => {
    // Debounce the initial fetch to prevent rapid successive calls
    const timer = setTimeout(() => {
      if (!isCurrentlyFetching) {
        fetchListings();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchListings]);

  return {
    listings,
    loading,
    error,
    usingFallback,
    refetch,
    forceOfflineMode
  };
};
