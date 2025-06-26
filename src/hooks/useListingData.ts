
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

  const { statusFilter, limit = 25 } = options; // Reduced default limit

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
      console.log('Fetching listings with optimized query, options:', { statusFilter, limit });
      setLoading(true);
      setError(null);
      
      // Build query with minimal columns first for better performance
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          price,
          status,
          created_at,
          category,
          condition,
          photos,
          purchase_price,
          is_consignment,
          consignment_percentage,
          net_profit,
          profit_margin,
          description
        `);

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Add ordering and limit
      query = query
        .order('created_at', { ascending: false })
        .limit(limit);

      console.log('Executing optimized query...');
      
      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Query error:', fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      if (!data) {
        console.log('No data returned from query');
        setListings([]);
        return;
      }

      console.log(`Successfully loaded ${data.length} listings`);
      
      // Transform the data to match the full Listing interface
      const transformedListings = data.map(item => ({
        ...item,
        description: item.description || null,
        purchase_date: undefined,
        source_location: undefined,
        source_type: undefined,
        cost_basis: undefined,
        fees_paid: undefined,
        sold_date: undefined,
        sold_price: undefined,
        days_to_sell: undefined,
        performance_notes: undefined,
        measurements: {},
        keywords: item.photos || [],
        price_research: null,
        shipping_cost: null,
        updated_at: item.created_at,
        user_id: '',
        consignor_name: undefined,
        consignor_contact: undefined,
        listed_date: undefined
      })) as Listing[];
      
      setListings(transformedListings);
      
    } catch (error: any) {
      console.error('Fetch error:', error);
      
      let errorMessage = 'Failed to load inventory';
      
      // Handle specific timeout errors
      if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
        errorMessage = 'Request timed out. The database may be slow. Please try again.';
      } else if (error.message?.includes('connection')) {
        errorMessage = 'Connection error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setListings([]);
      
      toast({
        title: "Loading Error",
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
