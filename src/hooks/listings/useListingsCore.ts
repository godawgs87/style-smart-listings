
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
  const mountedRef = useRef(true);
  
  const { fetchOptimizedListings } = useOptimizedQuery();
  const { getFallbackData, hasFallbackData } = useFallbackData();
  const { toast } = useToast();

  const fetchListings = useCallback(async () => {
    if (!mountedRef.current) return;
    
    const now = Date.now();
    const currentOptionsKey = JSON.stringify(options);
    
    // Prevent duplicate fetches with stricter conditions
    if (isCurrentlyFetching) {
      console.log('⏸️ Skipping fetch - another fetch already in progress');
      return;
    }
    
    // Increased debounce time and stricter comparison
    if (currentOptionsKey === lastOptionsRef.current && now - lastFetchTime < 3000) {
      console.log('⏸️ Skipping redundant fetch - same options within 3s');
      return;
    }
    
    console.log('🚀 Starting fetchListings with options:', options);
    
    setIsCurrentlyFetching(true);
    
    // Only set loading to true if we don't already have data
    if (listings.length === 0) {
      setLoading(true);
    }
    
    setError(null);
    setLastFetchTime(now);
    lastOptionsRef.current = currentOptionsKey;
    
    try {
      const queryOptions = {
        statusFilter: options.statusFilter,
        categoryFilter: options.categoryFilter, 
        searchTerm: options.searchTerm,
        limit: Math.min(options.limit || 12, 25)
      };

      console.log('📋 Final query options:', queryOptions);
      
      const result = await fetchOptimizedListings(queryOptions);
      
      if (!mountedRef.current) return;
      
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
      if (!mountedRef.current) return;
      
      console.error('💥 Fetch exception:', error);
      setError('DATABASE_ERROR: Failed to load listings.');
      setUsingFallback(false);
      setListings([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsCurrentlyFetching(false);
      }
    }
  }, [options.statusFilter, options.limit, options.searchTerm, options.categoryFilter, fetchOptimizedListings, getFallbackData, hasFallbackData, toast, isCurrentlyFetching, listings.length]);

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
    mountedRef.current = true;
    
    // Single debounced fetch on mount or option changes
    const timer = setTimeout(() => {
      if (mountedRef.current && !isCurrentlyFetching) {
        fetchListings();
      }
    }, 500); // Increased debounce time

    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
    };
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
