
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

      // Use a more efficient query with limits and specific columns
      const { data, error: fetchError } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          price,
          category,
          condition,
          measurements,
          keywords,
          photos,
          price_research,
          shipping_cost,
          status,
          created_at,
          updated_at,
          user_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      console.log('Supabase query result:', { data, error: fetchError });

      if (fetchError) {
        console.error('Error fetching listings:', fetchError);
        
        // Handle specific timeout error
        if (fetchError.message.includes('timeout') || fetchError.message.includes('canceling statement')) {
          setError('Database timeout - please try again');
          toast({
            title: "Connection Timeout",
            description: "The request timed out. Please try refreshing the page.",
            variant: "destructive"
          });
        } else {
          setError('Failed to load listings');
          toast({
            title: "Error",
            description: `Failed to load listings: ${fetchError.message}`,
            variant: "destructive"
          });
        }
        return;
      }

      const transformedListings = (data || []).map(transformListing);
      console.log('Transformed listings:', transformedListings.length, 'items');
      setListings(transformedListings);
      
      // Show success message if listings were found
      if (transformedListings.length > 0) {
        toast({
          title: "Success",
          description: `Loaded ${transformedListings.length} listing${transformedListings.length === 1 ? '' : 's'}`,
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('Connection failed - please check your internet connection');
      toast({
        title: "Connection Error",
        description: "Unable to connect to the database. Please check your connection and try again.",
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
