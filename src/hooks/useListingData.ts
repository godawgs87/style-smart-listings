
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

  const { statusFilter, limit = 25 } = options;

  const transformListing = (supabaseListing: SupabaseListing): Listing => {
    return {
      ...supabaseListing,
      measurements: (supabaseListing.measurements as any) || {},
      photos: supabaseListing.photos || [],
      keywords: supabaseListing.keywords || [],
      shipping_cost: supabaseListing.shipping_cost || 9.95
    };
  };

  const fetchListings = async () => {
    try {
      console.log('Fetching inventory data with optimized query...');
      setLoading(true);
      setError(null);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        setError('Authentication required');
        setListings([]);
        setLoading(false);
        return;
      }

      console.log('Authenticated user:', user.id);

      // Increased timeout back to 12 seconds for better reliability
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 12000);
      });

      // Build optimized query - fetch only necessary fields first
      let query = supabase
        .from('listings')
        .select('id, title, price, status, category, condition, photos, created_at, updated_at, user_id');

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      query = query
        .order('created_at', { ascending: false })
        .limit(limit);

      console.log('Executing optimized query...');
      const queryStart = Date.now();
      
      const { data, error: fetchError } = await Promise.race([
        query,
        timeoutPromise
      ]) as any;

      const queryTime = Date.now() - queryStart;
      console.log('Query completed in', queryTime, 'ms');

      if (fetchError) {
        console.error('Query error:', fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      if (!data) {
        console.log('No data returned');
        setListings([]);
        return;
      }

      // Transform listings with minimal data and defaults
      const transformedListings = data.map((item: any) => ({
        ...item,
        description: null, // Don't fetch heavy description field initially
        measurements: {},
        keywords: [],
        price_research: null,
        shipping_cost: 9.95
      }));
      
      console.log(`Successfully loaded ${transformedListings.length} listings with optimized data`);
      setListings(transformedListings);
      
    } catch (error: any) {
      console.error('Fetch error:', error);
      const errorMessage = error.message || 'Unknown error';
      
      if (errorMessage.includes('timeout')) {
        setError('Request timeout - please try refreshing');
        toast({
          title: "Connection Timeout",
          description: "Data is taking too long to load. Try refreshing or using fewer filters.",
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
