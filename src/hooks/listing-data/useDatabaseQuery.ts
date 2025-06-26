
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
      console.log(`🔍 Fetching ${limit} listings from database with filters:`, {
        statusFilter,
        searchTerm: searchTerm ? `"${searchTerm}"` : 'none',
        categoryFilter,
        timestamp: new Date().toISOString()
      });
      
      // Quick authentication check with reduced timeout
      const authStartTime = Date.now();
      console.log('🔐 Checking authentication...');
      
      const authTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Authentication timeout')), 3000)
      );
      
      const authPromise = supabase.auth.getUser();
      const authResult = await Promise.race([authPromise, authTimeoutPromise]);
      const { data: authData, error: authError } = authResult as any;
      
      const authTime = Date.now() - authStartTime;
      console.log(`🔐 Auth check completed in ${authTime}ms`);
      
      if (authError || !authData?.user) {
        console.error('❌ Authentication failed:', authError?.message);
        return { 
          listings: [], 
          error: 'AUTHENTICATION_ERROR: Please sign in again'
        };
      }
      
      console.log('✅ User authenticated:', authData.user.id);
      
      // Set a reduced timeout for the database query
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout after 15 seconds')), 15000)
      );

      // Build optimized query with smaller limit to reduce timeout risk
      console.log('🔧 Building optimized database query...');
      const optimizedLimit = Math.min(limit, 50); // Reduce limit to prevent timeouts
      
      let query = supabase
        .from('listings')
        .select('id, title, description, price, category, condition, status, shipping_cost, created_at, updated_at, photos, measurements, keywords, purchase_price, purchase_date, is_consignment, source_type, cost_basis, net_profit, profit_margin, days_to_sell')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false })
        .limit(optimizedLimit);

      const appliedFilters = [];
      
      // Apply filters with logging
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
        appliedFilters.push(`status=${statusFilter}`);
      }

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
        appliedFilters.push(`category=${categoryFilter}`);
      }

      if (searchTerm && searchTerm.trim()) {
        // Simplify search to reduce query complexity
        query = query.ilike('title', `%${searchTerm}%`);
        appliedFilters.push(`search="${searchTerm}"`);
      }

      console.log('🎯 Query filters applied:', appliedFilters.length > 0 ? appliedFilters.join(', ') : 'none');
      console.log('⏱️ Executing database query with 15s timeout...');
      const queryStartTime = Date.now();
      
      const result = await Promise.race([query, timeoutPromise]);
      const { data, error: fetchError } = result as any;
      
      const queryTime = Date.now() - queryStartTime;
      console.log(`📊 Database query completed in ${queryTime}ms`);

      if (fetchError) {
        console.error('❌ Database fetch error:', {
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint
        });
        
        // More specific error handling with detailed logging
        if (fetchError.code === 'PGRST116') {
          console.error('🚫 RLS policy violation detected - checking permissions');
          return { 
            listings: [], 
            error: 'ACCESS_DENIED: Row Level Security policy violation. Please check your account permissions.'
          };
        }
        
        if (fetchError.message?.includes('JWT') || fetchError.code === 'PGRST301') {
          console.error('🔑 JWT token issue detected - token may be expired');
          return { 
            listings: [], 
            error: 'JWT_ERROR: Authentication token expired. Please sign out and back in.'
          };
        }
        
        // Network/timeout errors for fallback mode
        if (fetchError.message?.includes('fetch') || 
            fetchError.message?.includes('network') ||
            fetchError.message?.includes('timeout') ||
            fetchError.code === 'ECONNREFUSED') {
          console.error('🌐 Network/connection error detected');
          return { listings: [], error: 'CONNECTION_ERROR' };
        }
        
        // All other errors are returned as-is (not connection errors)
        return { 
          listings: [], 
          error: `Database error: ${fetchError.message} (Code: ${fetchError.code || 'unknown'})`
        };
      }

      if (!data) {
        console.log('📭 No data returned from query');
        return { listings: [], error: null };
      }

      console.log(`✅ Successfully loaded ${data.length} listings from database`);
      
      // Transform the data with error catching
      let transformedListings: Listing[] = [];
      try {
        transformedListings = data.map(transformListing);
        console.log(`🔄 Successfully transformed ${transformedListings.length} listings`);
      } catch (transformError) {
        console.error('❌ Error transforming listings:', transformError);
        return { 
          listings: [], 
          error: `Data transformation error: ${transformError instanceof Error ? transformError.message : 'Unknown error'}`
        };
      }
      
      // Save successful data for fallback
      try {
        fallbackDataService.saveFallbackData(data);
        console.log('💾 Fallback data saved successfully');
      } catch (saveError) {
        console.warn('⚠️ Failed to save fallback data:', saveError);
        // Don't fail the whole operation for this
      }
      
      return { listings: transformedListings, error: null };
      
    } catch (error: any) {
      console.error('💥 Unexpected error in fetchFromDatabase:', {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 500)
      });
      
      // Only treat actual network/timeout errors as connection issues
      if (error.message?.includes('timeout') || 
          error.message?.includes('fetch') ||
          error.message?.includes('network') ||
          error.name === 'AbortError') {
        console.log('🔌 Timeout/network error - will use fallback');
        return { listings: [], error: 'CONNECTION_ERROR' };
      }
      
      // All other errors are real errors, not connection issues
      return { 
        listings: [], 
        error: `Unexpected error: ${error.message || 'Unknown database error'}`
      };
    }
  };

  return {
    fetchFromDatabase
  };
};
