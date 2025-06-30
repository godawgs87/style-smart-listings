
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const mountedRef = useRef(true);
  const { toast } = useToast();

  const stats: InventoryStats = useMemo(() => ({
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  }), [listings]);

  const fetchInventory = useCallback(async (): Promise<Listing[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }

      console.log('🔍 Fetching unified inventory for user:', user.id);

      // Build comprehensive query with all needed fields
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          price,
          category,
          condition,
          status,
          shipping_cost,
          measurements,
          keywords,
          photos,
          created_at,
          updated_at,
          purchase_price,
          purchase_date,
          is_consignment,
          consignment_percentage,
          source_type,
          source_location,
          cost_basis,
          net_profit,
          profit_margin,
          listed_date,
          sold_date,
          days_to_sell,
          performance_notes,
          clothing_size,
          shoe_size,
          gender,
          age_group
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
        const searchTerm = options.searchTerm.trim();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Conservative but reasonable limit
      const limit = Math.min(options.limit || 50, 100);
      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Fetched listings:', data?.length || 0);
      
      // Process and validate data safely
      const processedData = (data || []).map(listing => {
        try {
          // Safely handle measurements
          let measurements = {};
          if (listing.measurements) {
            if (typeof listing.measurements === 'object' && listing.measurements !== null) {
              measurements = listing.measurements;
            } else if (typeof listing.measurements === 'string') {
              try {
                measurements = JSON.parse(listing.measurements);
              } catch {
                measurements = {};
              }
            }
          }

          // Ensure required fields have valid values
          return {
            ...listing,
            measurements: measurements as { length?: string; width?: string; height?: string; weight?: string; },
            status: listing.status || 'draft',
            price: Number(listing.price) || 0,
            shipping_cost: Number(listing.shipping_cost) || 9.95,
            keywords: Array.isArray(listing.keywords) ? listing.keywords : [],
            photos: Array.isArray(listing.photos) ? listing.photos : []
          };
        } catch (processingError) {
          console.error('Error processing listing:', listing.id, processingError);
          return {
            ...listing,
            measurements: {},
            status: 'draft',
            price: 0,
            shipping_cost: 9.95,
            keywords: [],
            photos: []
          };
        }
      }) as Listing[];
      
      return processedData;
      
    } catch (err: any) {
      console.error('❌ Failed to fetch inventory:', err);
      throw err;
    }
  }, [options.searchTerm, options.statusFilter, options.categoryFilter, options.limit]);

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;

    // Prevent rapid refetches
    const now = Date.now();
    if (now - lastFetchTime < 1000) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchInventory();
      
      if (!mountedRef.current) return;

      setListings(data);
      setLastFetchTime(now);
      
      console.log(`✅ Loaded ${data.length} inventory items`);
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('❌ Failed to fetch inventory:', err);
      setError(err.message || 'Failed to load inventory');
      
      toast({
        title: "Unable to Load Listings", 
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchInventory, lastFetchTime, toast]);

  const refetch = useCallback(() => {
    console.log('🔄 Refetching unified inventory data...');
    setLastFetchTime(0); // Reset throttle
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
    refetch
  };
};

export type { UnifiedInventoryOptions, InventoryStats };
