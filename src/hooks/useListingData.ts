
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

  const { statusFilter, limit = 25 } = options;

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
      console.log('Fetching complete listing data');
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('listings')
        .select('*');

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      query = query
        .order('created_at', { ascending: false })
        .limit(limit);

      console.log('Executing complete data query...');
      const queryStart = Date.now();
      
      const { data, error: fetchError } = await query;

      const queryTime = Date.now() - queryStart;
      console.log('Complete data query completed in', queryTime, 'ms');

      if (fetchError) {
        console.error('Query error:', fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      if (!data) {
        console.log('No data returned');
        setListings([]);
        return;
      }

      const transformedListings = data.map(transformListing);
      
      console.log(`Successfully loaded ${transformedListings.length} complete listings`);
      setListings(transformedListings);
      
    } catch (error: any) {
      console.error('Fetch error:', error);
      const errorMessage = error.message || 'Unknown error';
      
      setError('Failed to load listings');
      toast({
        title: "Error Loading Data",
        description: "Unable to load listings. Please try refreshing.",
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
    fetchListings();
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
