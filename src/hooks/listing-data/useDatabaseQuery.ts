
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
      console.log(`🚀 ATTEMPTING DATABASE CONNECTION - ${new Date().toISOString()}`);
      console.log(`🔍 Fetching ${limit} listings with filters:`, {
        statusFilter,
        searchTerm: searchTerm ? `"${searchTerm}"` : 'none',
        categoryFilter
      });
      
      // Quick auth check first
      console.log('🔐 Checking authentication...');
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData?.user) {
        console.error('❌ Auth failed:', authError?.message || 'No user');
        return { listings: [], error: 'CONNECTION_ERROR' };
      }
      
      console.log(`✅ User authenticated: ${authData.user.id}`);

      // Build query with short timeout
      console.log('🔧 Building database query...');
      let query = supabase
        .from('listings')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      console.log('⏱️ Executing database query with 5s timeout...');
      const queryStartTime = Date.now();
      
      // Set a reasonable timeout for the query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 5000); // 5 second timeout
      });
      
      const queryPromise = query;
      
      const { data, error: fetchError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any;
      
      const queryTime = Date.now() - queryStartTime;
      console.log(`📊 Query completed in ${queryTime}ms`);

      if (fetchError) {
        console.error('❌ Database fetch error:', fetchError);
        return { listings: [], error: 'CONNECTION_ERROR' };
      }

      if (!data) {
        console.log('📭 No data returned from query');
        return { listings: [], error: null };
      }

      console.log(`✅ Successfully loaded ${data.length} listings from database`);
      
      // Transform the data
      const transformedListings = data.map(transformListing);
      console.log(`🔄 Successfully transformed ${transformedListings.length} listings`);
      
      // Save successful data for fallback
      try {
        fallbackDataService.saveFallbackData(data);
        console.log('💾 Fallback data saved successfully');
      } catch (saveError) {
        console.warn('⚠️ Failed to save fallback data:', saveError);
      }
      
      return { listings: transformedListings, error: null };
      
    } catch (error: any) {
      console.error('💥 Error in fetchFromDatabase:', error.message);
      
      if (error.message === 'Query timeout') {
        console.log('⏰ Database query timed out');
      }
      
      return { listings: [], error: 'CONNECTION_ERROR' };
    }
  };

  return {
    fetchFromDatabase
  };
};
