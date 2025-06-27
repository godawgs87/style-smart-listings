
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    fetchListings();
  }, [searchTerm, statusFilter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('listings')
        .select('id, title, price, status, category, photos, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm.trim()}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching listings:', fetchError);
        setError('Failed to load inventory');
        return;
      }

      setListings(data || []);
    } catch (err) {
      console.error('Exception in fetchListings:', err);
      setError('An error occurred while loading inventory');
    } finally {
      setLoading(false);
    }
  };

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
    refetch: fetchListings
  };
};
