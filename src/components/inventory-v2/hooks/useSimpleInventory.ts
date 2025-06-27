
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
      
      console.log('🔍 Fetching listings with filters:', { searchTerm, statusFilter });

      let query = supabase
        .from('listings')
        .select('id, title, price, status, category, photos, created_at')
        .order('created_at', { ascending: false });

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
        console.log('📋 Applied status filter:', statusFilter);
      }

      if (searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm.trim()}%`);
        console.log('🔍 Applied search filter:', searchTerm);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('❌ Error fetching listings:', fetchError);
        setError('Failed to load inventory data');
        return;
      }

      console.log('✅ Successfully loaded listings:', data?.length || 0);
      setListings(data || []);
    } catch (err) {
      console.error('💥 Exception in fetchListings:', err);
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
