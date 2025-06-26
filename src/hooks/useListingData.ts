import { useState, useEffect, useRef } from 'react';
import type { Listing } from '@/types/Listing';
import { useLightweightQuery } from './listing-data/useLightweightQuery';
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
  const failureCount = useRef(0);
  const { toast } = useToast();

  const { statusFilter, limit = 20, searchTerm, categoryFilter } = options;
  const { fetchLightweightListings } = useLightweightQuery();
  const { loadFallbackData } = useFallbackData();

  const fetchListings = async (isManualRetry = false) => {
    console.log(`🎯 fetchListings called - manual retry: ${isManualRetry}`);
    console.log(`📊 Current failure count: ${failureCount.current}`);
    
    setLoading(true);
    setError(null);
    
    // Reset failure count on manual retry
    if (isManualRetry) {
      console.log('🔄 Manual retry - resetting failure count');
      failureCount.current = 0;
      setUsingFallback(false);
    }

    const { listings: fetchedListings, error: fetchError } = await fetchLightweightListings({
      statusFilter,
      limit,
      searchTerm,
      categoryFilter
    });

    if (fetchError === 'AUTH_ERROR') {
      console.log('🔒 Authentication error detected');
      failureCount.current = 0; // Reset on auth error
      setError('Authentication failed. Please sign out and sign back in.');
      setListings([]);
      setUsingFallback(false);
      
      toast({
        title: "Authentication Error",
        description: "Please sign out and sign back in to continue.",
        variant: "destructive"
      });
      
    } else if (fetchError === 'CONNECTION_ERROR') {
      console.log('🔌 Connection error detected');
      failureCount.current += 1;
      
      console.log(`📈 Failure count now: ${failureCount.current}`);
      
      if (failureCount.current >= 2) {
        console.log('💔 Max failures reached - switching to fallback');
        setUsingFallback(true);
        const fallbackListings = loadFallbackData({
          statusFilter,
          limit,
          searchTerm,
          categoryFilter
        });
        setListings(fallbackListings);
        setError(null);
        
        if (!isManualRetry) {
          toast({
            title: "Database Unavailable",
            description: "Switched to offline mode. Use 'Try Database Again' to reconnect.",
            variant: "destructive"
          });
        }
      } else {
        console.log('🔁 First failure - showing error state WITHOUT auto retry');
        setError('Database connection failed.');
        setListings([]);
        setUsingFallback(false);
      }
      
    } else {
      console.log('✅ Lightweight fetch successful');
      failureCount.current = 0;
      setListings(fetchedListings);
      setError(null);
      setUsingFallback(false);
      
      if (isManualRetry) {
        toast({
          title: "Connection Restored!",
          description: "Successfully reconnected to database.",
          variant: "default"
        });
      }
    }
    
    setLoading(false);
  };

  const refetch = () => {
    console.log('🔄 Manual refetch triggered');
    fetchListings(true);
  };

  const forceOfflineMode = () => {
    console.log('🔌 Forcing offline mode');
    setLoading(true);
    setUsingFallback(true);
    failureCount.current = 0;
    
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
      description: "Working with cached data. Use 'Try Database Again' to reconnect.",
      variant: "default"
    });
  };

  useEffect(() => {
    console.log('🎯 useEffect triggered - filters changed');
    // Reset failure count when filters change
    failureCount.current = 0;
    fetchListings();
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
