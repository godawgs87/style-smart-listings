
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fallbackDataService } from '@/services/fallbackDataService';

interface SimpleInventoryOptions {
  searchTerm: string;
  statusFilter: string;
}

interface SimpleListing {
  id: string;
  title: string;
  price: number;
  status: string | null;
  category: string | null;
  photos: string[] | null;
  created_at: string;
}

export const useSimpleInventory = ({ searchTerm, statusFilter }: SimpleInventoryOptions) => {
  const [listings, setListings] = useState<SimpleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [searchTerm, statusFilter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      
      console.log('🔍 Fetching listings with filters:', { searchTerm, statusFilter });

      // Set a shorter timeout for the query
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      let query = supabase
        .from('listings')
        .select('id, title, price, status, category, photos, created_at')
        .order('created_at', { ascending: false })
        .limit(50); // Limit results to improve performance

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
        console.log('📋 Applied status filter:', statusFilter);
      }

      if (searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm.trim()}%`);
        console.log('🔍 Applied search filter:', searchTerm);
      }

      const { data, error: fetchError } = await query.abortSignal(controller.signal);
      clearTimeout(timeoutId);

      if (fetchError) {
        console.error('❌ Database error:', fetchError);
        
        // Try fallback data if available
        if (fallbackDataService.hasFallbackData()) {
          console.log('🔄 Loading fallback data due to database error');
          const fallbackData = fallbackDataService.loadFallbackData();
          const filteredFallback = applyFiltersToFallback(fallbackData, searchTerm, statusFilter);
          setListings(filteredFallback);
          setUsingFallback(true);
          setError('Using cached data - database temporarily unavailable');
          return;
        }
        
        setError('Failed to load inventory data. Please check your connection and try again.');
        return;
      }

      console.log('✅ Successfully loaded listings:', data?.length || 0);
      const processedListings = data || [];
      setListings(processedListings);
      
      // Save successful data as fallback
      if (processedListings.length > 0) {
        fallbackDataService.saveFallbackData(processedListings);
      }
      
    } catch (err: any) {
      console.error('💥 Exception in fetchListings:', err);
      
      // Handle timeout or network errors
      if (err.name === 'AbortError' || err.message?.includes('timeout')) {
        console.log('⏰ Query timed out, trying fallback data');
        
        if (fallbackDataService.hasFallbackData()) {
          const fallbackData = fallbackDataService.loadFallbackData();
          const filteredFallback = applyFiltersToFallback(fallbackData, searchTerm, statusFilter);
          setListings(filteredFallback);
          setUsingFallback(true);
          setError('Using cached data - database query timed out');
          return;
        }
      }
      
      setError('An error occurred while loading inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersToFallback = (data: any[], search: string, status: string) => {
    let filtered = [...data];
    
    if (status !== 'all') {
      filtered = filtered.filter(item => item.status === status);
    }
    
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  const stats = {
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  };

  return {
    listings,
    loading,
    error: usingFallback ? `${error} (${listings.length} items from cache)` : error,
    stats,
    refetch: fetchListings,
    usingFallback
  };
};
