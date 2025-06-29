
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

interface InventoryOptions {
  searchTerm?: string;
  statusFilter?: string;
  categoryFilter?: string;
  limit?: number;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  activeItems: number;
  draftItems: number;
}

export const useInventoryData = (options: InventoryOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const { toast } = useToast();

  const stats: InventoryStats = useMemo(() => ({
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  }), [listings]);

  const fetchInventory = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }

      // Simple, focused query
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          price,
          category,
          condition,
          status,
          shipping_cost,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.statusFilter && options.statusFilter !== 'all') {
        query = query.eq('status', options.statusFilter);
      }

      if (options.categoryFilter && options.categoryFilter !== 'all') {
        query = query.eq('category', options.categoryFilter);
      }

      if (options.searchTerm?.trim()) {
        query = query.ilike('title', `%${options.searchTerm.trim()}%`);
      }

      // Conservative limit
      const limit = Math.min(options.limit || 25, 50);
      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!mountedRef.current) return;

      // Process data safely
      const processedData = (data || []).map(listing => ({
        ...listing,
        measurements: {},
        keywords: [],
        photos: [],
        price: Number(listing.price) || 0,
        shipping_cost: Number(listing.shipping_cost) || 9.95
      })) as Listing[];

      setListings(processedData);
      
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('Failed to fetch inventory:', err);
      setError(err.message || 'Failed to load inventory');
      
      toast({
        title: "Error Loading Inventory",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [options.searchTerm, options.statusFilter, options.categoryFilter, options.limit, toast]);

  const refetch = useCallback(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    mountedRef.current = true;
    fetchInventory();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchInventory]);

  return {
    listings,
    loading,
    error,
    stats,
    refetch
  };
};
