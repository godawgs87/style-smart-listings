
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Listing } from '@/types/Listing';
import type { UnifiedInventoryOptions, InventoryStats } from './inventory/types';
import { useInventoryData } from './inventory/useInventoryData';

export const useUnifiedInventory = (options: UnifiedInventoryOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedListings, setCachedListings] = useState<Listing[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const mountedRef = useRef(true);
  const { toast } = useToast();
  const { fetchInventory } = useInventoryData();

  const stats: InventoryStats = useMemo(() => ({
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  }), [listings]);

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // Set a reasonable timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced to 8 seconds

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
      
      // Better error handling
      if (err.code === '57014' || err.message?.includes('timeout')) {
        setError('Query timed out. Try using filters to reduce the data size.');
        
        // Use cached data if available
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
