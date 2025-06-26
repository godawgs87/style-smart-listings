
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import type { Listing } from '@/types/Listing';

type SupabaseListing = Database['public']['Tables']['listings']['Row'];

interface UseListingDataOptions {
  statusFilter?: string;
  limit?: number;
}

export const useListingData = (options: UseListingDataOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { statusFilter, limit = 50 } = options;

  const transformListing = (supabaseListing: SupabaseListing): Listing => {
    return {
      ...supabaseListing,
      measurements: (supabaseListing.measurements as any) || {},
      photos: supabaseListing.photos || [],
      keywords: supabaseListing.keywords || [],
      shipping_cost: supabaseListing.shipping_cost
    };
  };

  const fetchListings = async () => {
    try {
      console.log('Starting data fetch with options:', { statusFilter, limit });
      setLoading(true);
      setError(null);
      
      // Simple query with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      let query = supabase
        .from('listings')
        .select('*')
        .abortSignal(controller.signal);

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      query = query
        .order('created_at', { ascending: false })
        .limit(limit);

      console.log('Executing query...');
      const queryStart = Date.now();
      
      const { data, error: fetchError } = await query;
      
      clearTimeout(timeoutId);
      const queryTime = Date.now() - queryStart;
      console.log('Query completed in', queryTime, 'ms');

      if (fetchError) {
        console.error('Query error:', fetchError);
        throw new Error(fetchError.message);
      }

      if (!data) {
        console.log('No data returned from query');
        setListings([]);
        return;
      }

      console.log(`Successfully loaded ${data.length} listings`);
      const transformedListings = data.map(transformListing);
      setListings(transformedListings);
      
    } catch (error: any) {
      console.error('Fetch error:', error);
      
      let errorMessage = 'Failed to load listings';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out - please try again';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setListings([]); // Clear listings on error
      
      toast({
        title: "Error Loading Data",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log('Manual refetch triggered');
    fetchListings();
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchListings();
    }, 100); // Small delay to prevent rapid successive calls

    return () => clearTimeout(timeoutId);
  }, [statusFilter, limit]);

  return {
    listings,
    setListings,
    loading,
    error,
    fetchListings,
    refetch
  };
};
