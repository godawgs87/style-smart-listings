
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StatusListingsOptions {
  status: string;
  limit?: number;
}

export const useStatusListings = ({ status, limit = 10 }: StatusListingsOptions) => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStatusListings = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log(`Fetching ${status} listings with optimized query`);
      
      // Auth check is critical for RLS
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError('Authentication required');
        setListings([]);
        setLoading(false);
        return;
      }

      console.log('Authenticated user:', user.id, 'fetching status:', status);

      // Reduced timeout to 5 seconds and smaller limit
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 5000);
      });

      // Ultra-minimal query - only essential fields for display
      const queryStart = Date.now();
      const { data, error: fetchError } = await Promise.race([
        supabase
          .from('listings')
          .select('id, title, price, status, photos, created_at')
          .eq('status', status)
          .order('created_at', { ascending: false })
          .limit(limit),
        timeoutPromise
      ]) as any;

      const queryTime = Date.now() - queryStart;
      console.log(`${status} listings query completed in ${queryTime}ms`);

      if (fetchError) {
        console.error(`Error fetching ${status} listings:`, fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      // Transform data with default values to prevent UI errors
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        category: null,
        condition: null,
        description: null,
        measurements: null,
        keywords: null,
        shipping_cost: 9.95
      }));

      setListings(transformedData);
      console.log(`Successfully loaded ${transformedData.length} ${status} listings`);
      
    } catch (error: any) {
      console.error('Status listings error:', error);
      const errorMsg = error.message || 'Unknown error';
      
      if (errorMsg.includes('timeout')) {
        setError('Query timeout - please try refreshing');
        toast({
          title: "Timeout Error",
          description: `${status} listings are taking too long to load. Try refreshing or reducing filters.`,
          variant: "destructive"
        });
      } else {
        setError('Connection failed');
        toast({
          title: "Database Error",
          description: `Failed to load ${status} listings`,
          variant: "destructive"
        });
      }
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
