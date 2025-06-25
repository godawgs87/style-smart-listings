
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

export const useListingData = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const transformListing = (supabaseListing: SupabaseListing): Listing => {
    return {
      ...supabaseListing,
      measurements: (supabaseListing.measurements as any) || {}
    };
  };

  const fetchListings = async () => {
    try {
      console.log('Starting to fetch listings...');
      setError(null);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      
      if (authError) {
        console.error('Auth error:', authError);
        setError('Authentication error');
        toast({
          title: "Authentication Error",
          description: "Please log in to view your listings",
          variant: "destructive"
        });
        return;
      }

      if (!user) {
        console.log('No user logged in');
        setError('Please log in to view your listings');
        setListings([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase query result:', { data, error: fetchError });

      if (fetchError) {
        console.error('Error fetching listings:', fetchError);
        setError('Failed to load listings');
        toast({
          title: "Error",
          description: `Failed to load listings: ${fetchError.message}`,
          variant: "destructive"
        });
        return;
      }

      const transformedListings = (data || []).map(transformListing);
      console.log('Transformed listings:', transformedListings.length, 'items');
      setListings(transformedListings);
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('Failed to load listings');
      toast({
        title: "Error",
        description: "Failed to load listings - unexpected error",
        variant: "destructive"
      });
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
  }, []);

  return {
    listings,
    setListings,
    loading,
    error,
    fetchListings,
    refetch
  };
};
