
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
      console.log(`Fetching ${status} listings - simplified approach`);
      
      // Simple, fast query - no complex auth checks
      const queryStart = Date.now();
      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('id, title, price, status, photos, created_at')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(limit);

      const queryTime = Date.now() - queryStart;
      console.log(`${status} listings query completed in ${queryTime}ms`);

      if (fetchError) {
        console.error(`Error fetching ${status} listings:`, fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      // Simple transformation with minimal processing
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        category: null,
        condition: null,
        description: null,
        measurements: {},
        keywords: [],
        shipping_cost: 9.95
      }));

      setListings(transformedData);
      console.log(`Successfully loaded ${transformedData.length} ${status} listings`);
      
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
