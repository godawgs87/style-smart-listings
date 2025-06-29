
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }

      console.log('🔍 Fetching inventory for user:', user.id);

      // Use minimal query with increased limits
      let query = supabase
        .from('listings')
        .select('id, title, price, status, category, condition, created_at, user_id')
        .eq('user_id', user.id);

      // Apply filters only if specified
      if (options.statusFilter && options.statusFilter !== 'all') {
        query = query.eq('status', options.statusFilter);
      }

      if (options.categoryFilter) {
        query = query.eq('category', options.categoryFilter);
      }

      // Simple search on title only to avoid complex operations
      if (options.searchTerm?.trim()) {
        const searchTerm = options.searchTerm.trim();
        query = query.ilike('title', `%${searchTerm}%`);
      }

      // Increased limit to allow more listings - default to 50, max 100
      const limit = Math.min(options.limit || 50, 100);
      
      // Set timeout to 10 seconds for better reliability
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout - using cached data')), 10000)
      );

      const queryPromise = query
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Fetched listings:', data?.length || 0);
      
      // Transform minimal data to match Listing interface
      const transformedData: Listing[] = (data || []).map(item => ({
        ...item,
        description: null,
        measurements: {},
        keywords: null,
        photos: null,
        price_research: null,
        shipping_cost: null,
        purchase_price: null,
        purchase_date: null,
        is_consignment: null,
        consignment_percentage: null,
        consignor_name: null,
        consignor_contact: null,
        source_location: null,
        source_type: null,
        cost_basis: null,
        fees_paid: null,
        net_profit: null,
        profit_margin: null,
        listed_date: null,
        sold_date: null,
        sold_price: null,
        days_to_sell: null,
        performance_notes: null,
        updated_at: item.created_at // Use created_at as fallback
      }));
      
      return transformedData;
      
    } catch (err: any) {
      console.error('❌ Failed to fetch inventory:', err);
      throw err;
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchInventory(options);
      
      if (!mountedRef.current) return;

      setListings(data);
      setCachedListings(data);
      setUsingFallback(false);
      
      console.log(`✅ Loaded ${data.length} inventory items`);
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('❌ Failed to fetch inventory:', err);
      
      // Use cached data if available
      if (cachedListings.length > 0) {
        setListings(cachedListings);
        setUsingFallback(true);
        toast({
          title: "Using Cached Data",
          description: "Loading fresh data failed, showing cached listings.",
          variant: "default"
        });
      } else {
        setError(err.message || 'Failed to load inventory');
        toast({
          title: "Unable to Load Listings", 
          description: "Database query timed out. Try refreshing.",
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
