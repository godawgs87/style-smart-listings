
import { useState, useEffect } from 'react';
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

  const { statusFilter, limit = 20, searchTerm, categoryFilter } = options;
  const { fetchFromDatabase } = useDatabaseQuery();
  const { loadFallbackData } = useFallbackData();

  const fetchListings = async () => {
    try {
      console.log(`Starting database fetch for ${limit} items...`);
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      
      const { listings: fetchedListings, error: fetchError } = await fetchFromDatabase({
        statusFilter,
        limit,
        searchTerm,
        categoryFilter
      });

      if (fetchError === 'CONNECTION_ERROR') {
        console.log('Connection error detected, switching to fallback data...');
        setUsingFallback(true);
        const fallbackListings = loadFallbackData({
          statusFilter,
          limit,
          searchTerm,
          categoryFilter
        });
        setListings(fallbackListings);
        setError(null);
      } else if (fetchError) {
        setError(fetchError);
        setListings([]);
      } else {
        setListings(fetchedListings);
        setError(null);
      }
      
    } catch (error: any) {
      console.error('Unexpected error in fetchListings:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log('Manual refetch triggered - clearing fallback and retrying database');
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
