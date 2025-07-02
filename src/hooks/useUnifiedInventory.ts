
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
        // Try minimal query first
        const response = await supabase
          .from('listings')
          .select('id, title, price, status, created_at, user_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(25)
          .abortSignal(AbortSignal.timeout(8000));

        if (response.error) {
          console.error('❌ Database error:', response.error);
          throw response.error;
        }

        data = response.data;
        console.log('✅ Successfully fetched listings:', data?.length || 0);

      } catch (err: any) {
        console.error('❌ Database query failed:', err);
        // Return empty array on any error to show proper empty state
        return [];
      }

      // Transform actual data to full Listing interface
      const transformedData: Listing[] = (data || []).map(item => ({
        ...item,
        category: item.category || 'Electronics',
        condition: item.condition || 'good',
        description: item.description || null,
        measurements: item.measurements || {},
        keywords: item.keywords || null,
        photos: item.photos || null,
        price_research: item.price_research || null,
        shipping_cost: item.shipping_cost || 9.95,
        purchase_price: item.purchase_price || null,
        purchase_date: item.purchase_date || null,
        cost_basis: item.cost_basis || null,
        fees_paid: item.fees_paid || 0,
        net_profit: item.net_profit || null,
        profit_margin: item.profit_margin || null,
        listed_date: item.listed_date || null,
        sold_date: item.sold_date || null,
        sold_price: item.sold_price || null,
        days_to_sell: item.days_to_sell || null,
        is_consignment: item.is_consignment || false,
        consignment_percentage: item.consignment_percentage || null,
        consignor_name: item.consignor_name || null,
        consignor_contact: item.consignor_contact || null,
        source_location: item.source_location || null,
        source_type: item.source_type || null,
        performance_notes: item.performance_notes || null,
        category_id: item.category_id || null,
        gender: item.gender || null,
        age_group: item.age_group || null,
        clothing_size: item.clothing_size || null,
        shoe_size: item.shoe_size || null,
        updated_at: item.updated_at || item.created_at
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
