
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

  const { statusFilter, limit = 25 } = options; // Further reduced default limit

  const transformListing = (supabaseListing: SupabaseListing): Listing => {
    return {
      ...supabaseListing,
      measurements: (supabaseListing.measurements as any) || {}
    };
  };

  const fetchListings = async () => {
    try {
      console.log('Fetching listings with optimized query...');
      setLoading(true);
      setError(null);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('No authenticated user');
        setError('Please log in to view your listings');
        setListings([]);
        setLoading(false);
        return;
      }

      // Create a more aggressive timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000); // 5 second timeout
      });

      // Build the most efficient query possible - only essential fields
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          price,
          status,
          category,
          condition,
          created_at,
          user_id
        `)
        .eq('user_id', user.id);

      // Apply status filter efficiently using the index
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Always order and limit for performance
      query = query
        .order('created_at', { ascending: false })
        .limit(limit);

      console.log('Executing minimal query:', { statusFilter, limit, userId: user.id });

      const { data, error: fetchError } = await Promise.race([
        query,
        timeoutPromise
      ]) as any;

      if (fetchError) {
        console.error('Query error:', fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      if (!data) {
        console.log('No data returned');
        setListings([]);
        return;
      }

      // Transform minimal data
      const minimalListings = data.map((item: any) => ({
        ...item,
        description: null, // We'll load this on demand if needed
        measurements: {},
        keywords: null,
        photos: null,
        price_research: null,
        shipping_cost: null
      }));

      console.log(`Successfully loaded ${minimalListings.length} listings`);
      setListings(minimalListings);
      
    } catch (error: any) {
      console.error('Fetch error:', error);
      
      if (error.message === 'Request timeout') {
        setError('Connection timeout - please check your internet connection');
        toast({
          title: "Connection Timeout",
          description: "The request is taking too long. Please check your connection and try again.",
          variant: "destructive"
        });
      } else {
        setError('Failed to load listings');
        toast({
          title: "Error",
          description: "Unable to load listings. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
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
