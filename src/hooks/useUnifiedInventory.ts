
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';
import type { UnifiedInventoryOptions, InventoryStats } from './inventory/types';

export const useUnifiedInventory = (options: UnifiedInventoryOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedListings, setCachedListings] = useState<Listing[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const mountedRef = useRef(true);
  const { toast } = useToast();

  const stats: InventoryStats = useMemo(() => ({
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  }), [listings]);

  const fetchInventory = useCallback(async (options: UnifiedInventoryOptions = {}): Promise<Listing[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    console.log('🔍 Fetching inventory for user:', user.id);

    // Use full query to get all data for the listings manager
    let query = supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id);

    if (options.statusFilter && options.statusFilter !== 'all') {
      query = query.eq('status', options.statusFilter);
    }

    if (options.categoryFilter) {
      query = query.eq('category', options.categoryFilter);
    }

    if (options.searchTerm?.trim()) {
      query = query.or(`title.ilike.%${options.searchTerm.trim()}%,description.ilike.%${options.searchTerm.trim()}%`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(options.limit || 50);

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    console.log('✅ Fetched listings:', data?.length || 0);

    return (data || []).map(item => ({
      ...item,
      price: Number(item.price) || 0,
      shipping_cost: item.shipping_cost !== null ? Number(item.shipping_cost) : null,
      purchase_price: item.purchase_price !== null ? Number(item.purchase_price) : null,
      cost_basis: item.cost_basis !== null ? Number(item.cost_basis) : null,
      net_profit: item.net_profit !== null ? Number(item.net_profit) : null,
      profit_margin: item.profit_margin !== null ? Number(item.profit_margin) : null,
      sold_price: item.sold_price !== null ? Number(item.sold_price) : null,
      consignment_percentage: item.consignment_percentage !== null ? Number(item.consignment_percentage) : null,
      measurements: item.measurements || {},
      keywords: item.keywords || [],
      photos: item.photos || []
    }));
  }, []);

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const data = await fetchInventory(options);
      clearTimeout(timeoutId);
      
      if (!mountedRef.current) return;

      setListings(data);
      setCachedListings(data);
      setUsingFallback(false);
      
      console.log(`✅ Loaded ${data.length} inventory items`);
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('❌ Failed to fetch inventory:', err);
      
      if (err.code === '57014' || err.message?.includes('timeout')) {
        setError('Query timed out. Try using filters to reduce the data size.');
        
        if (cachedListings.length > 0) {
          setListings(cachedListings);
          setUsingFallback(true);
          toast({
            title: "Using Cached Data",
            description: "Query timed out, showing cached data. Try filtering to reduce load.",
            variant: "default"
          });
        }
      } else if (err.message?.includes('AbortError')) {
        setError('Request was canceled. Please try again.');
      } else if (cachedListings.length > 0) {
        setListings(cachedListings);
        setUsingFallback(true);
        toast({
          title: "Using Cached Data",
          description: "Connection issues, showing cached data.",
          variant: "default"
        });
      } else {
        setError(err.message || 'Failed to load inventory');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [options.searchTerm, options.statusFilter, options.categoryFilter, options.limit, fetchInventory, cachedListings.length, toast]);

  const refetch = useCallback(() => {
    console.log('🔄 Refetching inventory data...');
    loadData();
  }, [loadData]);

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  return {
    listings,
    loading,
    error,
    usingFallback,
    stats,
    refetch
  };
};

export type { UnifiedInventoryOptions, InventoryStats };
