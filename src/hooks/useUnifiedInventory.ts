
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isCurrentlyFetching, setIsCurrentlyFetching] = useState(false);
  const mountedRef = useRef(true);
  const { toast } = useToast();

  // Cached data for offline mode
  const [cachedListings, setCachedListings] = useState<Listing[]>([]);

  const fetchWithTimeout = async (query: any, timeoutMs: number = 3000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await query.abortSignal(controller.signal);
      clearTimeout(timeoutId);
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Query timeout');
      }
      throw error;
    }
  };

  const fetchInventory = useCallback(async () => {
    if (!mountedRef.current || isCurrentlyFetching) return;

    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      console.log('⏸️ Skipping fetch - too frequent');
      return;
    }

    console.log('🚀 Starting unified inventory fetch...');
    setIsCurrentlyFetching(true);
    setLastFetchTime(now);

    // Only show loading if we don't have cached data
    if (listings.length === 0 && cachedListings.length === 0) {
      setLoading(true);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please log in to view your inventory');
        setLoading(false);
        setIsCurrentlyFetching(false);
        return;
      }

      // Ultra-minimal query to avoid timeouts
      let query = supabase
        .from('listings')
        .select('id, title, price, status, category, photos, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(Math.min(options.limit || 20, 15)); // Very conservative limit

      // Apply filters only if needed
      if (options.statusFilter && options.statusFilter !== 'all') {
        query = query.eq('status', options.statusFilter);
      }

      if (options.searchTerm?.trim()) {
        query = query.ilike('title', `%${options.searchTerm.trim()}%`);
      }

      if (options.categoryFilter && options.categoryFilter !== 'all') {
        query = query.eq('category', options.categoryFilter);
      }

      const { data, error: fetchError } = await fetchWithTimeout(query, 3000);

      if (!mountedRef.current) return;

      if (fetchError || !data) {
        console.error('❌ Database query failed:', fetchError);
        
        // Use cached data if available
        if (cachedListings.length > 0) {
          console.log('📚 Using cached data due to database issues');
          setListings(cachedListings);
          setUsingFallback(true);
          setError('Connection issues - showing cached data');
        } else {
          setError('Database connection issues. Please try again.');
          setUsingFallback(false);
        }
        setLoading(false);
        setIsCurrentlyFetching(false);
        return;
      }

      console.log(`✅ Successfully fetched ${data.length} listings`);
      
      // Transform data to match Listing interface
      const transformedListings: Listing[] = data.map(item => ({
        id: item.id,
        title: item.title || 'Untitled',
        description: null,
        price: Number(item.price) || 0,
        category: item.category,
        condition: null,
        measurements: {},
        keywords: null,
        photos: Array.isArray(item.photos) ? item.photos.filter(p => p && typeof p === 'string') : null,
        price_research: null,
        shipping_cost: null,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.created_at,
        user_id: user.id,
        is_consignment: false,
        source_type: null,
        net_profit: null,
        profit_margin: null,
        purchase_date: undefined,
        source_location: undefined,
        cost_basis: undefined,
        fees_paid: undefined,
        sold_date: undefined,
        sold_price: undefined,
        days_to_sell: undefined,
        performance_notes: undefined,
        consignment_percentage: undefined,
        consignor_name: undefined,
        consignor_contact: undefined,
        listed_date: undefined,
        purchase_price: undefined
      }));

      setListings(transformedListings);
      setCachedListings(transformedListings); // Update cache
      setUsingFallback(false);
      setError(null);

    } catch (error: any) {
      if (!mountedRef.current) return;
      
      console.error('💥 Fetch exception:', error);
      
      // Use cached data if available
      if (cachedListings.length > 0) {
        console.log('📚 Using cached data due to exception');
        setListings(cachedListings);
        setUsingFallback(true);
        setError('Connection timeout - showing cached data');
      } else {
        setError('Unable to load inventory. Please try again.');
        setUsingFallback(false);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsCurrentlyFetching(false);
      }
    }
  }, [options.searchTerm, options.statusFilter, options.categoryFilter, options.limit, cachedListings.length]);

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch triggered');
    setUsingFallback(false);
    setError(null);
    setLastFetchTime(0);
    setIsCurrentlyFetching(false);
    fetchInventory();
  }, [fetchInventory]);

  const forceOfflineMode = useCallback(() => {
    console.log('🔌 Forcing offline mode');
    if (cachedListings.length > 0) {
      setListings(cachedListings);
      setUsingFallback(true);
      setError(null);
      setLoading(false);
      
      toast({
        title: "Offline Mode Active",
        description: "Using cached data to prevent database timeouts.",
        variant: "default"
      });
    } else {
      toast({
        title: "No Cached Data",
        description: "No offline data available.",
        variant: "destructive"
      });
    }
  }, [cachedListings, toast]);

  // Calculate stats
  const stats: InventoryStats = {
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  };

  useEffect(() => {
    mountedRef.current = true;
    
    const timer = setTimeout(() => {
      if (mountedRef.current && !isCurrentlyFetching) {
        fetchInventory();
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
    };
  }, [fetchInventory]);

  return {
    listings,
    loading,
    error,
    usingFallback,
    stats,
    refetch,
    forceOfflineMode
  };
};
