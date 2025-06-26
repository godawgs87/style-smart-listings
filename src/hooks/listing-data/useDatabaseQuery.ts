
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
      
      // Force a fresh auth check
      console.log('🔐 Starting fresh authentication check...');
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        return { listings: [], error: `Authentication failed: ${authError.message}` };
      }
      
      if (!authData?.user) {
        console.error('❌ No user found in auth response');
        return { listings: [], error: 'No authenticated user found' };
      }
      
      console.log(`✅ User authenticated: ${authData.user.id}`);
      
      // Test database connection first with a simple query
      console.log('🧪 Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('listings')
        .select('id')
        .limit(1);
        
      if (testError) {
        console.error('❌ Database connection test failed:', testError);
        return { listings: [], error: 'CONNECTION_ERROR' };
      }
      
      console.log('✅ Database connection test passed');

      // Build the main query
      console.log('🔧 Building main query...');
      let query = supabase
        .from('listings')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
        console.log(`🎯 Applied status filter: ${statusFilter}`);
      }

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
        console.log(`🎯 Applied category filter: ${categoryFilter}`);
      }

      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm}%`);
        console.log(`🎯 Applied search filter: ${searchTerm}`);
      }

      console.log('⏱️ Executing main database query...');
      const queryStartTime = Date.now();
      
      const { data, error: fetchError } = await query;
      
      const queryTime = Date.now() - queryStartTime;
      console.log(`📊 Main query completed in ${queryTime}ms`);

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
      console.error('💥 Unexpected error in fetchFromDatabase:', error);
      return { listings: [], error: 'CONNECTION_ERROR' };
    }
  };

  return {
    fetchFromDatabase
  };
};
