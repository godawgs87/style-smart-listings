
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type SupabaseListing = Database['public']['Tables']['listings']['Row'];

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  purchase_price?: number;
  purchase_date?: string;
  source_location?: string;
  source_type?: string;
  cost_basis?: number;
  fees_paid?: number;
  net_profit?: number;
  sold_date?: string;
  sold_price?: number;
  days_to_sell?: number;
  performance_notes?: string;
  category: string | null;
  condition: string | null;
  measurements: {
    length?: string;
    width?: string;
    height?: string;
    weight?: string;
  };
  keywords: string[] | null;
  photos: string[] | null;
  price_research: string | null;
  shipping_cost: number | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface UseListingDataOptions {
  statusFilter?: string;
  limit?: number;
}

export const useListingData = (options: UseListingDataOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { statusFilter, limit = 50 } = options; // Reduced default limit

  const transformListing = (supabaseListing: SupabaseListing): Listing => {
    return {
      ...supabaseListing,
      measurements: (supabaseListing.measurements as any) || {}
    };
  };

  const fetchListings = async () => {
    try {
      console.log('Starting to fetch listings with options:', options);
      setError(null);
      
      // Check if user is authenticated first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        setError('Authentication error');
        toast({
          title: "Authentication Error",
          description: "Please log in to view your listings",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!user) {
        console.log('No user logged in');
        setError('Please log in to view your listings');
        setListings([]);
        setLoading(false);
        return;
      }

      console.log('Current user:', user.id);

      // Use a simpler, more efficient query with timeout handling
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 8000); // 8 second timeout
      });

      // Build a more efficient query - fetch only essential columns first
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          price,
          category,
          condition,
          status,
          created_at,
          updated_at,
          user_id,
          measurements,
          keywords,
          photos,
          price_research,
          shipping_cost
        `)
        .eq('user_id', user.id);

      // Apply status filter using the index
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Order and limit for better performance
      query = query
        .order('created_at', { ascending: false })
        .limit(limit);

      console.log('Executing optimized query with filters:', { statusFilter, limit, userId: user.id });

      // Race the query against timeout
      const queryPromise = query;
      const { data, error: fetchError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any;

      if (fetchError) {
        console.error('Error fetching listings:', fetchError);
        setError('Failed to load listings');
        toast({
          title: "Error",
          description: `Failed to load listings: ${fetchError.message}`,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!data) {
        console.log('No data returned from query');
        setListings([]);
        setLoading(false);
        return;
      }

      const transformedListings = data.map(transformListing);
      console.log('Successfully loaded listings:', transformedListings.length, 'items');
      setListings(transformedListings);
      
      // Show success message for status-filtered results
      if (transformedListings.length > 0 && statusFilter && statusFilter !== 'all') {
        toast({
          title: "Success",
          description: `Loaded ${transformedListings.length} ${statusFilter} listing${transformedListings.length === 1 ? '' : 's'}`,
        });
      }
      
    } catch (error: any) {
      console.error('Query error:', error);
      
      if (error.message === 'Query timeout') {
        setError('Database query timed out - please try again');
        toast({
          title: "Timeout Error",
          description: "The request is taking too long. Please try refreshing or contact support.",
          variant: "destructive"
        });
      } else {
        setError('Connection failed - please check your internet connection');
        toast({
          title: "Connection Error",
          description: "Unable to connect to the database. Please check your connection and try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    setLoading(true);
    fetchListings();
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter, limit]); // Re-fetch when options change

  return {
    listings,
    setListings,
    loading,
    error,
    fetchListings,
    refetch
  };
};
