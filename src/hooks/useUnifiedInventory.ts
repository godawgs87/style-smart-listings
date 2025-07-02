
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

interface UnifiedInventoryOptions {
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

export const useUnifiedInventory = (options: UnifiedInventoryOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [cachedListings, setCachedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

      console.log('🔍 Fetching unified inventory for user:', user.id);

      let data = null;
      try {
        // Minimal query to avoid database timeouts
        const response = await supabase
          .from('listings')
          .select(`
            id, title, price, status, created_at, user_id
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
          .abortSignal(AbortSignal.timeout(10000)); // 10 second timeout

        if (response.error) {
          console.error('❌ Database error:', response.error);
          // If timeout, return fallback data
          if (response.error.code === '57014' || response.error.message.includes('timeout')) {
            console.log('📋 Database timeout - using fallback empty data');
            return [];
          }
          throw response.error;
        }

        data = response.data;

      } catch (timeoutError: any) {
        console.error('❌ Database query timeout:', timeoutError);
        // Return empty array on timeout to avoid complete failure
        return [];
      }

      console.log('✅ Fetched listings:', data?.length || 0);
      
      // Transform minimal data to full Listing interface with safe defaults
      const transformedData: Listing[] = (data || []).map(item => ({
        ...item,
        category: 'Electronics', // Default category
        condition: 'good', // Default condition
        description: null,
        measurements: {},
        keywords: null,
        photos: null,
        price_research: null,
        shipping_cost: 9.95,
        purchase_price: null,
        purchase_date: null,
        cost_basis: null,
        fees_paid: 0,
        net_profit: null,
        profit_margin: null,
        listed_date: null,
        sold_date: null,
        sold_price: null,
        days_to_sell: null,
        is_consignment: false,
        consignment_percentage: null,
        consignor_name: null,
        consignor_contact: null,
        source_location: null,
        source_type: null,
        performance_notes: null,
        category_id: null,
        gender: null,
        age_group: null,
        clothing_size: null,
        shoe_size: null,
        updated_at: item.created_at
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
    setUsingFallback(false);

    try {
      const data = await fetchInventory(options);
      
      if (!mountedRef.current) return;

      setListings(data);
      setCachedListings(data); // Cache successful data
      console.log(`✅ Loaded ${data.length} inventory items`);
      
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('❌ Failed to fetch inventory:', err);
      
      // Use cached data as fallback if available
      if (cachedListings.length > 0) {
        console.log('📦 Using cached data as fallback');
        setListings(cachedListings);
        setUsingFallback(true);
        setError(`Connection timeout - showing cached data (${cachedListings.length} items)`);
      } else {
        setError(err.message || 'Failed to load inventory');
      }
      
      toast({
        title: "Connection Issue", 
        description: cachedListings.length > 0 
          ? "Using cached data due to timeout" 
          : "Unable to load listings. Please try refreshing.",
        variant: "destructive"
      });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchInventory, toast, options]);

  const refetch = useCallback(() => {
    console.log('🔄 Refetching unified inventory data...');
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
    stats,
    refetch,
    usingFallback
  };
};

export type { UnifiedInventoryOptions, InventoryStats };
