
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

    // Start with a lightweight query with proper limits
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
        shipping_cost,
        purchase_price,
        purchase_date,
        cost_basis,
        fees_paid,
        net_profit,
        profit_margin,
        sold_price,
        consignment_percentage,
        is_consignment,
        consignor_name,
        consignor_contact,
        source_type,
        source_location,
        listed_date,
        sold_date,
        days_to_sell,
        performance_notes,
        measurements,
        keywords,
        photos,
        price_research,
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

    // Apply strict limits to prevent timeouts
    const limit = Math.min(options.limit || 25, 50); // Cap at 50 items max
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    console.log('✅ Fetched listings:', data?.length || 0);

    // Transform data with safe type handling
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title || '',
      description: item.description || '',
      price: Number(item.price) || 0,
      category: item.category || '',
      condition: item.condition || '',
      status: item.status || 'draft',
      shipping_cost: item.shipping_cost !== null ? Number(item.shipping_cost) : null,
      purchase_price: item.purchase_price !== null ? Number(item.purchase_price) : null,
      purchase_date: item.purchase_date,
      cost_basis: item.cost_basis !== null ? Number(item.cost_basis) : null,
      fees_paid: item.fees_paid !== null ? Number(item.fees_paid) : null,
      net_profit: item.net_profit !== null ? Number(item.net_profit) : null,
      profit_margin: item.profit_margin !== null ? Number(item.profit_margin) : null,
      sold_price: item.sold_price !== null ? Number(item.sold_price) : null,
      consignment_percentage: item.consignment_percentage !== null ? Number(item.consignment_percentage) : null,
      is_consignment: item.is_consignment || false,
      consignor_name: item.consignor_name || '',
      consignor_contact: item.consignor_contact || '',
      source_type: item.source_type || '',
      source_location: item.source_location || '',
      listed_date: item.listed_date,
      sold_date: item.sold_date,
      days_to_sell: item.days_to_sell,
      performance_notes: item.performance_notes || '',
      measurements: (item.measurements && typeof item.measurements === 'object' && !Array.isArray(item.measurements)) 
        ? item.measurements as { length?: string; width?: string; height?: string; weight?: string; }
        : {},
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
      photos: Array.isArray(item.photos) ? item.photos : [],
      price_research: item.price_research || '',
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
        limit: options.limit || 25 // Default to 25 items to prevent timeouts
      });
      
      if (!mountedRef.current) return;

      setListings(data);
      setCachedListings(data);
      setUsingFallback(false);
      
      console.log(`✅ Loaded ${data.length} inventory items`);
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('❌ Failed to fetch inventory:', err);
      
      // Handle timeout errors specifically
      if (err.message?.includes('timeout') || err.code === '57014') {
        setError('Query timed out. Try using filters to reduce the data load.');
        
        if (cachedListings.length > 0) {
          setListings(cachedListings);
          setUsingFallback(true);
          toast({
            title: "Using Cached Data",
            description: "Query timed out, showing cached data. Try using filters.",
            variant: "default"
          });
        }
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
