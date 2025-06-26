
import { useState, useEffect, useRef } from 'react';
import type { Listing } from '@/types/Listing';
import { useDatabaseQuery } from './listing-data/useDatabaseQuery';
import { useFallbackData } from './listing-data/useFallbackData';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const { statusFilter, limit = 20, searchTerm, categoryFilter } = options;
  const { fetchFromDatabase } = useDatabaseQuery();
  const { loadFallbackData } = useFallbackData();

  const fetchListings = async (isRetry = false) => {
    try {
      console.log(`🔄 FETCH LISTINGS CALLED - retry: ${isRetry}, count: ${retryCountRef.current}`);
      setLoading(true);
      setError(null);
      
      // Force database attempt on manual retry
      if (isRetry) {
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
        console.log('🔌 Connection error - switching to fallback');
        setUsingFallback(true);
        const fallbackListings = loadFallbackData({
          statusFilter,
          limit,
          searchTerm,
          categoryFilter
        });
        setListings(fallbackListings);
        setError(null);
        
        if (!isRetry) {
          toast({
            title: "Database Unavailable",
            description: "Switched to offline mode. Use the 'Try Database Again' button to reconnect.",
            variant: "destructive"
          });
        }
      } else if (fetchError) {
        console.error('❌ Database error:', fetchError);
        setError(fetchError);
        setListings([]);
        setUsingFallback(false);
      } else {
        console.log('✅ Database fetch successful - exiting offline mode');
        setListings(fetchedListings);
        setError(null);
        setUsingFallback(false);
        retryCountRef.current = 0;
        
        if (isRetry) {
          toast({
            title: "Connection Restored!",
            description: "Successfully reconnected to database.",
            variant: "default"
          });
        }
      }
      
    } catch (error: any) {
      console.error('💥 Unexpected error in fetchListings:', error);
      setError(error.message || 'An unexpected error occurred');
      setUsingFallback(false);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log('🔄 MANUAL REFETCH - forcing database retry');
    retryCountRef.current = 0;
    setUsingFallback(false);
    fetchListings(true);
  };

  const forceOfflineMode = () => {
    console.log('🔌 FORCING OFFLINE MODE');
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
    
    toast({
      title: "Offline Mode",
      description: "Working with cached data. Use 'Try Database Again' when ready to reconnect.",
      variant: "default"
    });
  };

  useEffect(() => {
    console.log('🎯 useEffect triggered - filters changed');
    const timeoutId = setTimeout(() => {
      fetchListings();
    }, 100);

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
