
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fallbackDataService } from '@/services/fallbackDataService';
import { useListingTransforms } from './useListingTransforms';
import type { Listing } from '@/types/Listing';

interface UseDatabaseQueryOptions {
  statusFilter?: string;
  limit: number;
  searchTerm?: string;
  categoryFilter?: string;
}

export const useDatabaseQuery = () => {
  const { toast } = useToast();
  const { transformListing } = useListingTransforms();

  const fetchFromDatabase = async (options: UseDatabaseQueryOptions): Promise<{
    listings: Listing[];
    error: string | null;
  }> => {
    const { statusFilter, limit, searchTerm, categoryFilter } = options;

    try {
      console.log(`Fetching ${limit} listings from database...`);
      
      // Quick authentication check
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData?.user) {
        console.error('Authentication failed:', authError?.message);
        return { 
          listings: [], 
          error: 'AUTHENTICATION_ERROR'
        };
      }
      
      console.log('User authenticated:', authData.user.id);
      
      // Set a more reasonable timeout (30 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 30000)
      );

      // Build optimized query
      let query = supabase
        .from('listings')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 100));

      // Apply filters
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (searchTerm && searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      console.log('Executing database query...');
      const queryStartTime = Date.now();
      
      const result = await Promise.race([query, timeoutPromise]);
      const { data, error: fetchError } = result as any;
      
      const queryTime = Date.now() - queryStartTime;
      console.log(`Database query completed in ${queryTime}ms`);

      if (fetchError) {
        console.error('Database fetch error:', fetchError);
        
        // More specific error handling
        if (fetchError.code === 'PGRST116') {
          console.error('RLS policy violation detected');
          return { 
            listings: [], 
            error: 'RLS_POLICY_ERROR: Check your permissions or contact support'
          };
        }
        
        if (fetchError.message?.includes('JWT')) {
          console.error('JWT token issue detected');
          return { 
            listings: [], 
            error: 'JWT_ERROR: Please sign out and back in'
          };
        }
        
        // Only treat network/timeout errors as connection issues
        if (fetchError.message?.includes('fetch') || 
            fetchError.message?.includes('network') ||
            fetchError.code === 'ECONNREFUSED') {
          console.error('Network connection error detected');
          return { listings: [], error: 'CONNECTION_ERROR' };
        }
        
        // All other errors are returned as-is (not connection errors)
        return { 
          listings: [], 
          error: `Database error: ${fetchError.message}`
        };
      }

      if (!data) {
        console.log('No data returned from query');
        return { listings: [], error: null };
      }

      console.log(`Successfully loaded ${data.length} listings from database`);
      
      // Transform the data
      const transformedListings = data.map(transformListing);
      
      // Save successful data for fallback
      fallbackDataService.saveFallbackData(data);
      
      return { listings: transformedListings, error: null };
      
    } catch (error: any) {
      console.error('Unexpected error in fetchFromDatabase:', error);
      
      // Only treat actual network/timeout errors as connection issues
      if (error.message?.includes('timeout') || 
          error.message?.includes('fetch') ||
          error.message?.includes('network') ||
          error.name === 'AbortError') {
        console.log('Network/timeout error - will use fallback');
        return { listings: [], error: 'CONNECTION_ERROR' };
      }
      
      // All other errors are real errors, not connection issues
      return { 
        listings: [], 
        error: error.message || 'Unexpected database error'
      };
    }
  };

  return {
    fetchFromDatabase
  };
};
