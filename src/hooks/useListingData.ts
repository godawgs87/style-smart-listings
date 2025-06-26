
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
  const [autoRetryDisabled, setAutoRetryDisabled] = useState(false);
  const failureCount = useRef(0);
  const { toast } = useToast();

  const { statusFilter, limit = 20, searchTerm, categoryFilter } = options;
  const { fetchFromDatabase } = useDatabaseQuery();
  const { loadFallbackData } = useFallbackData();

  const fetchListings = async (isManualRetry = false) => {
    console.log(`🎯 fetchListings called - manual retry: ${isManualRetry}`);
    console.log(`📊 Current failure count: ${failureCount.current}`);
    
    setLoading(true);
    setError(null);
    
    // Reset failure count on manual retry
    if (isManualRetry) {
      console.log('🔄 Manual retry - resetting failure count and enabling auto retry');
      failureCount.current = 0;
      setUsingFallback(false);
      setAutoRetryDisabled(false);
    }

    const { listings: fetchedListings, error: fetchError } = await fetchFromDatabase({
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
      setAutoRetryDisabled(true); // Disable auto retry for auth errors
      
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
        console.log('💔 Max failures reached - switching to fallback, disabling auto retry');
        setUsingFallback(true);
        setAutoRetryDisabled(true); // Disable auto retry after max failures
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
      } else if (!autoRetryDisabled) {
        console.log('🔁 First failure - showing error state');
        setError('Database connection failed. Retrying automatically...');
        setListings([]);
        setUsingFallback(false);
        
        // Auto retry after 2 seconds for first failure only if not disabled
        setTimeout(() => {
          console.log('⏰ Auto retry triggered');
          fetchListings();
        }, 2000);
      } else {
        console.log('🚫 Auto retry disabled - showing error state');
        setError('Database connection failed.');
        setListings([]);
        setUsingFallback(false);
      }
      
    } else {
      console.log('✅ Fetch successful');
      failureCount.current = 0;
      setListings(fetchedListings);
      setError(null);
      setUsingFallback(false);
      setAutoRetryDisabled(false);
      
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
    setAutoRetryDisabled(true);
    
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
    setAutoRetryDisabled(false);
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
