
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

    // Use optimized query with only essential columns
    let query = supabase
      .from('listings')
      .select('id, title, price, status, created_at, category, condition, shipping_cost')
      .eq('user_id', user.id);

    if (options.statusFilter) {
      query = query.eq('status', options.statusFilter);
    }

    if (options.searchTerm?.trim()) {
      query = query.ilike('title', `%${options.searchTerm.trim()}%`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(options.limit || 25);

    if (error) {
      throw error;
    }

    return (data || []).map(item => ({
      id: item.id || '',
      title: item.title || 'Untitled',
      price: Number(item.price) || 0,
      status: item.status || 'draft',
      category: item.category || null,
      condition: item.condition || null,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.created_at || new Date().toISOString(),
      measurements: {},
      keywords: [],
      photos: [],
      user_id: user.id,
      description: null,
      purchase_date: null,
      cost_basis: null,
      sold_price: null,
      sold_date: null,
      price_research: null,
      consignment_percentage: null,
      consignor_name: null,
      consignor_contact: null,
      source_location: null,
      source_type: null,
      fees_paid: null,
      listed_date: null,
      days_to_sell: null,
      performance_notes: null,
      is_consignment: false,
      shipping_cost: item.shipping_cost ? Number(item.shipping_cost) : null,
      purchase_price: null,
      net_profit: null,
      profit_margin: null
    }));
  }, []);

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const data = await fetchInventory(options);
      clearTimeout(timeoutId);
      
      if (!mountedRef.current) return;

      setListings(data);
      setCachedListings(data);
      setUsingFallback(false);
      
      console.log(`✅ Loaded ${data.length} inventory items`);
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('Failed to fetch inventory:', err);
      
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
