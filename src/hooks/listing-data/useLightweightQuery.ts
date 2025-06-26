
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
  const { buildLightweightQuery } = useLightweightQueryBuilder();
  const { transformLightweightListings } = useLightweightTransformer();
  const { testConnection } = useConnectionTest();
  const { fetchListingDetails } = useListingDetailsQuery();

  const fetchLightweightListings = async (options: QueryOptions): Promise<{
    listings: Listing[];
    error: 'AUTH_ERROR' | 'CONNECTION_ERROR' | null;
  }> => {
    try {
      console.log('🚀 Starting lightweight query...');
      console.log('📋 Query options:', options);

      // Test connection first
      console.log('🔍 Testing Supabase connection...');
      const connectionStart = Date.now();
      const isConnected = await testConnection();
      const connectionTime = Date.now() - connectionStart;
      console.log(`⏱️ Connection test took ${connectionTime}ms`);

      if (!isConnected) {
        console.log('❌ Connection test failed');
        return { listings: [], error: 'CONNECTION_ERROR' };
      }

      console.log('✅ Connection test successful');

      const queryStart = Date.now();
      console.log('⏳ Executing lightweight query...');
      
      const query = buildLightweightQuery(options);
      const { data, error } = await query;

      const queryTime = Date.now() - queryStart;
      console.log(`⏱️ Lightweight query executed in ${queryTime}ms`);

      if (error) {
        console.log('❌ Lightweight query error:', error);
        
        if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
          return { listings: [], error: 'AUTH_ERROR' };
        }
        
        console.log('🔌 Treating as connection error');
        return { listings: [], error: 'CONNECTION_ERROR' };
      }

      console.log(`✅ Successfully fetched ${data?.length || 0} lightweight listings`);
      const transformedListings = transformLightweightListings(data || []);
      
      return { listings: transformedListings, error: null };
    } catch (error: any) {
      console.error('💥 Exception in lightweight query:', error);
      return { listings: [], error: 'CONNECTION_ERROR' };
    }
  };

  return { 
    fetchLightweightListings,
    fetchListingDetails
  };
};
