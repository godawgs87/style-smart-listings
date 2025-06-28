
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

    // Use a much more lightweight query to avoid timeouts
    let query = supabase
      .from('listings')
      .select(`
        id,
        user_id,
        title,
        description,
        price,
        category,
        condition,
        status,
        photos,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id);

    // Apply filters
    if (options.statusFilter && options.statusFilter !== 'all') {
      query = query.eq('status', options.statusFilter);
    }

    if (options.categoryFilter) {
      query = query.eq('category', options.categoryFilter);
    }

    if (options.searchTerm?.trim()) {
      const searchTerm = options.searchTerm.trim();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Use very conservative limits
    const limit = Math.min(options.limit || 15, 20);
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    console.log('✅ Fetched listings:', data?.length || 0);

    // Transform data with minimal processing
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title || '',
      description: item.description || '',
      price: Number(item.price) || 0,
      category: item.category || '',
      condition: item.condition || '',
      status: item.status || 'draft',
      shipping_cost: null,
      purchase_price: null,
      purchase_date: null,
      cost_basis: null,
      fees_paid: null,
      net_profit: null,
      profit_margin: null,
      sold_price: null,
      consignment_percentage: null,
      is_consignment: false,
      consignor_name: '',
      consignor_contact: '',
      source_type: '',
      source_location: '',
      listed_date: null,
      sold_date: null,
      days_to_sell: null,
      performance_notes: '',
      measurements: {},
      keywords: Array.isArray(item.photos) ? [] : [],
      photos: Array.isArray(item.photos) ? item.photos : [],
      price_research: '',
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  }, []);

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchInventory({
        ...options,
        limit: Math.min(options.limit || 15, 20) // Conservative limit
      });
      
      if (!mountedRef.current) return;

      setListings(data);
      setCachedListings(data);
      setUsingFallback(false);
      
      console.log(`✅ Loaded ${data.length} inventory items`);
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('❌ Failed to fetch inventory:', err);
      
      // Always try cached data first on any error
      if (cachedListings.length > 0) {
        setListings(cachedListings);
        setUsingFallback(true);
        toast({
          title: "Using Cached Data",
          description: "Having trouble loading fresh data, showing cached listings.",
          variant: "default"
        });
      } else {
        setError(err.message || 'Failed to load inventory');
        // Show a helpful error message
        toast({
          title: "Unable to Load Listings", 
          description: "Please check your connection and try again.",
          variant: "destructive"
        });
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
