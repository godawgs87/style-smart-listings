
import { useToast } from '@/hooks/use-toast';
import { fallbackDataService } from '@/services/fallbackDataService';
import { useListingTransforms } from './useListingTransforms';
import { useLightweightQueryBuilder } from './query-builders/useLightweightQueryBuilder';
import { useLightweightTransformer } from './transformers/useLightweightTransformer';
import { useConnectionTest } from './connection/useConnectionTest';
import { useListingDetailsQuery } from './details/useListingDetailsQuery';
import type { Listing } from '@/types/Listing';

interface UseLightweightQueryOptions {
  statusFilter?: string;
  limit: number;
  searchTerm?: string;
  categoryFilter?: string;
}

export const useLightweightQuery = () => {
  const { toast } = useToast();
  const { transformListing } = useListingTransforms();
  const { buildLightweightQuery } = useLightweightQueryBuilder();
  const { transformLightweightListings } = useLightweightTransformer();
  const { testConnection } = useConnectionTest();
  const { fetchListingDetails } = useListingDetailsQuery();

  const fetchLightweightListings = async (options: UseLightweightQueryOptions): Promise<{
    listings: Listing[];
    error: string | null;
  }> => {
    const { statusFilter, limit, searchTerm, categoryFilter } = options;

    console.log('🚀 Starting lightweight query...');
    console.log('📋 Query options:', { statusFilter, limit, searchTerm, categoryFilter });

    // Test connection first
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      console.log('🔌 Connection test failed:', connectionTest.error);
      return { listings: [], error: 'CONNECTION_ERROR' };
    }

    try {
      const query = buildLightweightQuery({
        statusFilter,
        categoryFilter,
        searchTerm,
        limit
      });

      console.log('⏳ Executing lightweight query...');
      const startTime = Date.now();
      
      const { data, error } = await query;
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ Lightweight query executed in ${duration}ms`);

      if (error) {
        console.error('❌ Lightweight query error:', error);

        if (error.message.includes('JWT') || 
            error.message.includes('authentication') || 
            error.message.includes('not authenticated') ||
            error.code === 'PGRST301') {
          console.log('🔒 Detected authentication error');
          return { listings: [], error: 'AUTH_ERROR' };
        }

        console.log('🔌 Treating as connection error');
        return { listings: [], error: 'CONNECTION_ERROR' };
      }

      if (!data) {
        console.log('📭 Query returned no data');
        return { listings: [], error: null };
      }

      console.log(`✅ Successfully fetched ${data.length} lightweight listings`);
      
      const transformedListings = transformLightweightListings(data);
      
      try {
        fallbackDataService.saveFallbackData(transformedListings);
        console.log('💾 Saved lightweight fallback data');
      } catch (saveError) {
        console.warn('⚠️ Failed to save fallback data:', saveError);
      }
      
      return { listings: transformedListings, error: null };
      
    } catch (error: any) {
      console.error('💥 Lightweight fetch exception:', error);
      
      if (error.message?.includes('JWT') || 
          error.message?.includes('authentication') ||
          error.message?.includes('not authenticated')) {
        console.log('🔒 Exception indicates auth error');
        return { listings: [], error: 'AUTH_ERROR' };
      }
      
      console.log('🔌 Exception treated as connection error');
      return { listings: [], error: 'CONNECTION_ERROR' };
    }
  };

  return {
    fetchLightweightListings,
    fetchListingDetails,
    testConnection
  };
};
