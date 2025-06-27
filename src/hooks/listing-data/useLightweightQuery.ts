
import { useLightweightQueryBuilder } from './query-builders/useLightweightQueryBuilder';
import { useLightweightTransformer } from './transformers/useLightweightTransformer';
import { useConnectionTest } from './connection/useConnectionTest';
import { useListingDetailsQuery } from './details/useListingDetailsQuery';
import type { Listing } from '@/types/Listing';

interface QueryOptions {
  statusFilter?: string;
  categoryFilter?: string;
  searchTerm?: string;
  limit: number;
}

export const useLightweightQuery = () => {
  const { buildQuery } = useLightweightQueryBuilder();
  const { transformListing } = useLightweightTransformer();
  const { testConnection } = useConnectionTest();
  const { fetchListingDetails } = useListingDetailsQuery();

  const fetchLightweightListings = async (options: QueryOptions): Promise<{
    listings: Listing[];
    error: 'AUTH_ERROR' | 'CONNECTION_ERROR' | null;
  }> => {
    try {
      console.log('🚀 Starting optimized lightweight query...');
      console.log('📋 Query options:', options);

      // Test connection first with short timeout
      console.log('🔍 Testing Supabase connection...');
      const connectionStart = Date.now();
      const isConnected = await testConnection();
      const connectionTime = Date.now() - connectionStart;
      console.log(`⏱️ Connection test took ${connectionTime}ms`);

      if (!isConnected) {
        console.log('❌ Connection test failed - switching to fallback');
        return { listings: [], error: 'CONNECTION_ERROR' };
      }

      console.log('✅ Connection test successful');

      const queryStart = Date.now();
      console.log('⏳ Executing lightweight query with timeout protection...');
      
      // Create timeout protection for the main query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 10000); // 10 second timeout
      });
      
      const query = buildQuery(options);
      const queryPromise = query;
      
      const result = await Promise.race([queryPromise, timeoutPromise]);

      const queryTime = Date.now() - queryStart;
      console.log(`⏱️ Query executed in ${queryTime}ms`);

      if ('error' in result && result.error) {
        console.log('❌ Lightweight query error:', result.error);
        
        // Check for authentication errors
        if (result.error.code === 'PGRST301' || 
            result.error.message?.includes('JWT') || 
            result.error.message?.includes('authentication') ||
            result.error.message?.includes('not authenticated')) {
          console.log('🔒 Detected authentication error');
          return { listings: [], error: 'AUTH_ERROR' };
        }
        
        console.log('🔌 Treating as connection error');
        return { listings: [], error: 'CONNECTION_ERROR' };
      }

      const data = result.data || [];
      console.log(`✅ Successfully fetched ${data.length} listings`);
      const transformedListings = data.map(transformListing);
      
      return { listings: transformedListings, error: null };
    } catch (error: any) {
      console.error('💥 Exception in lightweight query:', error);
      
      // Check if it's a timeout or authentication error
      if (error.message?.includes('timeout') || error.message?.includes('Query timeout')) {
        console.log('⏰ Query timeout detected');
        return { listings: [], error: 'CONNECTION_ERROR' };
      }
      
      if (error.message?.includes('JWT') || 
          error.message?.includes('authentication') ||
          error.message?.includes('not authenticated')) {
        console.log('🔒 Exception indicates auth error');
        return { listings: [], error: 'AUTH_ERROR' };
      }
      
      return { listings: [], error: 'CONNECTION_ERROR' };
    }
  };

  return { 
    fetchLightweightListings,
    fetchListingDetails
  };
};
