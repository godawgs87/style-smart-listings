
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

      // Test connection first with timeout
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
      console.log('⏳ Executing lightweight query...');
      
      const query = buildQuery(options);
      const result = await query;

      const queryTime = Date.now() - queryStart;
      console.log(`⏱️ Query executed in ${queryTime}ms`);

      // Type guard for Supabase response
      if (result && typeof result === 'object' && 'error' in result) {
        const supabaseResult = result as { error: any; data?: any };
        if (supabaseResult.error) {
          console.log('❌ Lightweight query error:', supabaseResult.error);
          
          // Check for authentication errors
          if (supabaseResult.error.code === 'PGRST301' || 
              supabaseResult.error.message?.includes('JWT') || 
              supabaseResult.error.message?.includes('authentication') ||
              supabaseResult.error.message?.includes('not authenticated')) {
            console.log('🔒 Detected authentication error');
            return { listings: [], error: 'AUTH_ERROR' };
          }
          
          console.log('🔌 Treating as connection error');
          return { listings: [], error: 'CONNECTION_ERROR' };
        }

        const data = supabaseResult.data || [];
        console.log(`✅ Successfully fetched ${data.length} listings`);
        const transformedListings = data.map(transformListing);
        
        return { listings: transformedListings, error: null };
      }

      // If we get here, something unexpected happened
      console.log('⚠️ Unexpected response format');
      return { listings: [], error: 'CONNECTION_ERROR' };
      
    } catch (error: any) {
      console.error('💥 Exception in lightweight query:', error);
      
      // Check if it's an authentication error
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
