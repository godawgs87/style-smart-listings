
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

  const { statusFilter, limit = 15 } = options; // Further reduced to 15

  const transformListing = (supabaseListing: SupabaseListing): Listing => {
    return {
      ...supabaseListing,
      measurements: (supabaseListing.measurements as any) || {}
    };
  };

  const fetchListings = async () => {
    try {
      console.log('Starting optimized fetch with RLS policies...');
      setLoading(true);
      setError(null);
      
      // Check auth first - this is crucial for RLS to work properly
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        setError('Authentication failed');
        setListings([]);
        setLoading(false);
        return;
      }

      if (!user) {
        console.log('No authenticated user - cannot fetch with RLS');
        setError('Please log in to view your listings');
        setListings([]);
        setLoading(false);
        return;
      }

      console.log('User authenticated, fetching listings for user:', user.id);

      // Create timeout promise - reduced to 3 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - 3s limit exceeded')), 3000);
      });

      // Build ultra-minimal query - only absolute essentials
      let query = supabase
        .from('listings')
        .select('id, title, price, status, created_at'); // Minimal fields only

      // Apply status filter if provided
      if (statusFilter && statusFilter !== 'all') {
        console.log('Applying status filter:', statusFilter);
        query = query.eq('status', statusFilter);
      }

      // Always limit and order for performance
      query = query
        .order('created_at', { ascending: false })
        .limit(limit);

      console.log('Executing minimal RLS query with limit:', limit);
      console.log('Status filter:', statusFilter || 'none');

      const queryStart = Date.now();
      const { data, error: fetchError } = await Promise.race([
        query,
        timeoutPromise
      ]) as any;

      const queryTime = Date.now() - queryStart;
      console.log('Query completed in', queryTime, 'ms');

      if (fetchError) {
        console.error('Supabase query error:', fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      if (!data) {
        console.log('No data returned from query');
        setListings([]);
        return;
      }

      // Transform with minimal data structure
      const minimalListings = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        status: item.status,
        created_at: item.created_at,
        // Set defaults for fields we didn't fetch
        description: null,
        category: null,
        condition: null,
        measurements: {},
        keywords: null,
        photos: null,
        price_research: null,
        shipping_cost: null,
        updated_at: item.created_at,
        user_id: user.id
      }));

      console.log(`Successfully loaded ${minimalListings.length} listings in ${queryTime}ms`);
      setListings(minimalListings);
      
    } catch (error: any) {
      console.error('Fetch error details:', error);
      
      const errorMessage = error.message || 'Unknown error';
      console.log('Error type:', typeof error, 'Message:', errorMessage);
      
      if (errorMessage.includes('timeout') || errorMessage.includes('Request timeout')) {
        setError('Request timeout - please try again');
        toast({
          title: "Connection Timeout",
          description: "Query is taking too long. Database may be under load.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('authentication') || errorMessage.includes('JWT')) {
        setError('Authentication required - please log in');
        toast({
          title: "Authentication Error",
          description: "Please log in to view your listings.",
          variant: "destructive"
        });
      } else {
        setError('Failed to load listings');
        toast({
          title: "Database Error",
          description: `Unable to load listings: ${errorMessage}`,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log('Manual refetch triggered');
    fetchListings();
  };

  useEffect(() => {
    console.log('useEffect triggered - fetching listings');
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
