
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ListingSummary {
  id: string;
  title: string;
  price: number;
  status: string | null;
  category: string | null;
  created_at: string;
  photos: string[] | null;
}

interface PaginationOptions {
  statusFilter?: string;
  categoryFilter?: string;
  searchTerm?: string;
  pageSize: number;
}

export const useInventoryPagination = () => {
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchListingsSummary = useCallback(async (
    options: PaginationOptions,
    cursor?: string | null,
    reset = false
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      console.log('📄 Fetching listings summary with cursor:', cursor);

      // Build optimized query with minimal fields
      let query = supabase
        .from('listings')
        .select('id, title, price, status, category, created_at, photos')
        .eq('user_id', user.id);

      // Apply filters
      if (options.statusFilter && options.statusFilter !== 'all') {
        query = query.eq('status', options.statusFilter);
      }

      if (options.categoryFilter && options.categoryFilter !== 'all') {
        query = query.eq('category', options.categoryFilter);
      }

      if (options.searchTerm?.trim()) {
        query = query.ilike('title', `%${options.searchTerm.trim()}%`);
      }

      // Cursor-based pagination
      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(options.pageSize + 1); // Fetch one extra to check if there's more

      if (error) {
        console.error('❌ Summary query failed:', error);
        return { success: false, error: error.message };
      }

      const hasMoreResults = data.length > options.pageSize;
      const resultData = hasMoreResults ? data.slice(0, -1) : data;
      
      const transformedData: ListingSummary[] = resultData.map(item => ({
        id: item.id,
        title: item.title || 'Untitled',
        price: Number(item.price) || 0,
        status: item.status,
        category: item.category,
        created_at: item.created_at,
        photos: Array.isArray(item.photos) ? item.photos.slice(0, 1) : null // Only first photo
      }));

      if (reset) {
        setListings(transformedData);
      } else {
        setListings(prev => [...prev, ...transformedData]);
      }

      setHasMore(hasMoreResults);
      setNextCursor(hasMoreResults ? resultData[resultData.length - 1].created_at : null);

      console.log(`✅ Loaded ${transformedData.length} listing summaries`);
      return { success: true };

    } catch (error: any) {
      console.error('💥 Summary fetch error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async (options: PaginationOptions) => {
    if (loading || !hasMore) return { success: false };
    return fetchListingsSummary(options, nextCursor, false);
  }, [loading, hasMore, nextCursor, fetchListingsSummary]);

  const reset = useCallback(async (options: PaginationOptions) => {
    setListings([]);
    setNextCursor(null);
    setHasMore(true);
    return fetchListingsSummary(options, null, true);
  }, [fetchListingsSummary]);

  return {
    listings,
    loading,
    hasMore,
    loadMore,
    reset
  };
};
