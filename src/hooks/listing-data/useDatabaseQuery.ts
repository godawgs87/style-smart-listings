
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

      // Build and execute query directly without complex timeout handling
      console.log('🔧 Building database query...');
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
        console.log('📝 Applied status filter:', statusFilter);
      }

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
        console.log('📝 Applied category filter:', categoryFilter);
      }

      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm}%`);
        console.log('📝 Applied search filter:', searchTerm);
      }

      console.log('⏱️ Executing database query...');
      const queryStartTime = Date.now();
      
      const { data, error: fetchError } = await query;
      
      const queryTime = Date.now() - queryStartTime;
      console.log(`📊 Query completed in ${queryTime}ms`);

      if (fetchError) {
        console.error('❌ Database fetch error:', fetchError);
        
        // Check if it's an auth error
        if (fetchError.message?.includes('JWT') || fetchError.message?.includes('auth') || fetchError.message?.includes('policy')) {
          console.log('🔒 Authentication error detected');
          return { listings: [], error: 'AUTH_ERROR' };
        }
        
        // For other errors, return connection error
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
      console.error('💥 Error in fetchFromDatabase:', error);
      
      // Check for specific error types
      if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        console.log('🔒 Authentication error in catch block');
        return { listings: [], error: 'AUTH_ERROR' };
      }
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        console.log('🌐 Network error detected');
        return { listings: [], error: 'CONNECTION_ERROR' };
      }
      
      // Generic connection error for other cases
      return { listings: [], error: 'CONNECTION_ERROR' };
    }
  };

  return {
    fetchFromDatabase
  };
};
