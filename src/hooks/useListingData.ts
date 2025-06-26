
import { useState, useEffect, useRef } from 'react';
import type { Listing } from '@/types/Listing';
import { useDatabaseQuery } from './listing-data/useDatabaseQuery';
import { useFallbackData } from './listing-data/useFallbackData';

interface UseListingDataOptions {
  statusFilter?: string;
  limit?: number;
  searchTerm?: string;
  categoryFilter?: string;
}

export const useListingData = (options: UseListingDataOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  const { statusFilter, limit = 20, searchTerm, categoryFilter } = options;
  const { fetchFromDatabase } = useDatabaseQuery();
  const { loadFallbackData } = useFallbackData();

  const fetchListings = async (isRetry = false) => {
    try {
      console.log(`Fetching listings (retry: ${isRetry}, count: ${retryCountRef.current})`);
      setLoading(true);
      setError(null);
      
      // Don't reset fallback state on retry unless specifically requested
      if (!isRetry) {
        setUsingFallback(false);
        retryCountRef.current = 0;
      }
      
      const { listings: fetchedListings, error: fetchError } = await fetchFromDatabase({
        statusFilter,
        limit,
        searchTerm,
        categoryFilter
      });

      if (fetchError === 'CONNECTION_ERROR') {
        console.log('Connection error detected');
        
        // Only use fallback after retries or if explicitly requested
        if (retryCountRef.current >= maxRetries || isRetry) {
          console.log('Using fallback data after retries');
          setUsingFallback(true);
          const fallbackListings = loadFallbackData({
            statusFilter,
            limit,
            searchTerm,
            categoryFilter
          });
          setListings(fallbackListings);
          setError(null);
        } else {
          // Retry automatically
          retryCountRef.current++;
          console.log(`Retrying database connection (attempt ${retryCountRef.current})`);
          setTimeout(() => fetchListings(true), 2000);
          return;
        }
      } else if (fetchError) {
        // Real errors (not connection issues)
        console.error('Database error:', fetchError);
        setError(fetchError);
        setListings([]);
        setUsingFallback(false);
      } else {
        // Success
        console.log('Database fetch successful');
        setListings(fetchedListings);
        setError(null);
        setUsingFallback(false);
        retryCountRef.current = 0;
      }
      
    } catch (error: any) {
      console.error('Unexpected error in fetchListings:', error);
      setError(error.message || 'An unexpected error occurred');
      setUsingFallback(false);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log('Manual refetch triggered');
    retryCountRef.current = 0;
    setUsingFallback(false);
    fetchListings();
  };

  const forceOfflineMode = () => {
    console.log('Forcing offline mode');
    setLoading(true);
    setUsingFallback(true);
    const fallbackListings = loadFallbackData({
      statusFilter,
      limit,
      searchTerm,
      categoryFilter
    });
    setListings(fallbackListings);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchListings();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, limit, searchTerm, categoryFilter]);

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
