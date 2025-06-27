
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimpleInventoryOptions {
  searchTerm: string;
  statusFilter: string;
}

interface SimpleListing {
  id: string;
  title: string;
  price: number;
  status: string | null;
  category: string | null;
  photos: string[] | null;
  created_at: string;
}

export const useSimpleInventory = ({ searchTerm, statusFilter }: SimpleInventoryOptions) => {
  const [listings, setListings] = useState<SimpleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const { toast } = useToast();

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      
      console.log('🔍 Fetching inventory listings...');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please log in to view your inventory');
        setLoading(false);
        return;
      }

      let query = supabase
        .from('listings')
        .select('id, title, price, status, category, photos, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm.trim()}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        setError(`Failed to load inventory: ${fetchError.message}`);
        return;
      }

      console.log('✅ Successfully loaded', data?.length || 0, 'listings');
      setListings(data || []);
      
    } catch (err: any) {
      console.error('💥 Exception in fetchListings:', err);
      setError('An error occurred while loading inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [searchTerm, statusFilter]);

  const stats = {
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  };

  return {
    listings,
    loading,
    error,
    stats,
    refetch: fetchListings,
    usingFallback: false
  };
};
