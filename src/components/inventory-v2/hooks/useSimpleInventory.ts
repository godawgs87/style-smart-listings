
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      
      console.log('🔍 Starting ultra-fast inventory query...');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please log in to view your inventory');
        setLoading(false);
        return;
      }

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        // Ultra-lightweight query - only essential fields
        let query = supabase
          .from('listings')
          .select('id, title, price, status, category, photos, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20) // Very small limit to avoid timeouts
          .abortSignal(controller.signal);

        // Apply filters only if absolutely necessary
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        if (searchTerm.trim()) {
          query = query.ilike('title', `%${searchTerm.trim()}%`);
        }

        const { data, error: fetchError } = await query;
        
        clearTimeout(timeoutId);

        if (fetchError) {
          console.error('❌ Query error:', fetchError);
          
          // Try a minimal fallback query
          console.log('🔄 Attempting minimal fallback query...');
          const fallbackQuery = supabase
            .from('listings')
            .select('id, title, price, status')
            .eq('user_id', user.id)
            .limit(10);
            
          const { data: fallbackData, error: fallbackError } = await fallbackQuery;
          
          if (fallbackError) {
            setError(`Database connection issues: ${fetchError.message}`);
            return;
          }
          
          // Transform fallback data
          const transformedFallback = (fallbackData || []).map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            status: item.status,
            category: null,
            photos: null,
            created_at: new Date().toISOString()
          }));
          
          setListings(transformedFallback);
          setUsingFallback(true);
          setError('Limited data loaded due to connection issues');
          return;
        }

        console.log('✅ Successfully loaded', data?.length || 0, 'listings');
        
        // Transform data safely
        const transformedListings = (data || []).map(item => ({
          id: item.id,
          title: item.title || 'Untitled',
          price: Number(item.price) || 0,
          status: item.status,
          category: item.category,
          photos: Array.isArray(item.photos) ? item.photos.filter(p => p && typeof p === 'string') : null,
          created_at: item.created_at
        }));
        
        setListings(transformedListings);
        
      } catch (timeoutError) {
        clearTimeout(timeoutId);
        console.error('⏰ Query timeout or abort:', timeoutError);
        
        // Show cached data if available
        if (listings.length > 0) {
          setUsingFallback(true);
          setError('Connection timeout - showing cached data');
        } else {
          setError('Connection timeout - please try again');
        }
      }
      
    } catch (err: any) {
      console.error('💥 Exception in fetchListings:', err);
      setError('Unable to load inventory due to connection issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce the query to avoid rapid-fire requests
    const timeoutId = setTimeout(() => {
      fetchListings();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  const stats = {
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  };

  return {
    listings,
    loading,
    error,
    stats,
    refetch: fetchListings,
    usingFallback
  };
};
