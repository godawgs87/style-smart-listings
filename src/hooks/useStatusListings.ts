
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StatusListingsOptions {
  status: string;
  limit?: number;
}

export const useStatusListings = ({ status, limit = 20 }: StatusListingsOptions) => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStatusListings = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log(`Fetching complete ${status} listings data`);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError('Authentication required');
        toast({
          title: "Authentication Required",
          description: "Please log in to view your listings",
          variant: "destructive"
        });
        return;
      }
      
      const queryStart = Date.now();
      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('*') // Select all fields to get complete data including shipping_cost, measurements, etc.
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(limit);

      const queryTime = Date.now() - queryStart;
      console.log(`${status} complete listings query completed in ${queryTime}ms`);

      if (fetchError) {
        console.error(`Error fetching ${status} listings:`, fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      // Transform data to ensure proper structure
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        measurements: item.measurements || {},
        keywords: item.keywords || [],
        photos: item.photos || [],
        shipping_cost: item.shipping_cost // Use actual shipping cost from database
      }));

      setListings(transformedData);
      console.log(`Successfully loaded ${transformedData.length} complete ${status} listings`);
      
    } catch (error: any) {
      console.error('Status listings error:', error);
      const errorMsg = error.message || 'Unknown error';
      
      setError('Failed to load listings');
      toast({
        title: "Error Loading Listings",
        description: `Unable to load ${status} listings. Please try refreshing.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusListings();
  }, [status, limit]);

  return {
    listings,
    loading,
    error,
    refetch: fetchStatusListings
  };
};
