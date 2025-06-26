
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StatusListingsOptions {
  status: string;
  limit?: number;
}

export const useStatusListings = ({ status, limit = 50 }: StatusListingsOptions) => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStatusListings = async () => {
    try {
      setError(null);
      console.log(`Fetching ${status} listings with limit ${limit}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please log in to view your listings');
        setListings([]);
        setLoading(false);
        return;
      }

      // Use the optimized index: idx_listings_user_status
      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('id, title, price, status, created_at, category, condition')
        .eq('user_id', user.id)
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        console.error(`Error fetching ${status} listings:`, fetchError);
        setError(`Failed to load ${status} listings`);
        toast({
          title: "Error",
          description: `Failed to load ${status} listings`,
          variant: "destructive"
        });
        return;
      }

      setListings(data || []);
      console.log(`Successfully loaded ${data?.length || 0} ${status} listings`);
      
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('Connection failed');
      toast({
        title: "Connection Error",
        description: "Unable to connect to the database",
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
