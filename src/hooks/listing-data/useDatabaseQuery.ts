
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

  const testConnection = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔍 Testing Supabase connection...');
      console.log('📡 Supabase URL:', supabase.supabaseUrl);
      console.log('🔑 Supabase Key (first 20 chars):', supabase.supabaseKey.substring(0, 20) + '...');
      
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('listings')
        .select('id')
        .limit(1);
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ Connection test took ${duration}ms`);
        
      if (error) {
        console.error('❌ Connection test failed:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { success: false, error: error.message };
      }
      
      console.log('✅ Connection test successful, data:', data);
      return { success: true };
    } catch (error: any) {
      console.error('💥 Connection test exception:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return { success: false, error: error.message };
    }
  };

  const fetchFromDatabase = async (options: UseDatabaseQueryOptions): Promise<{
    listings: Listing[];
    error: string | null;
  }> => {
    const { statusFilter, limit, searchTerm, categoryFilter } = options;

    console.log('🚀 Starting database fetch...');
    console.log('📋 Query options:', { statusFilter, limit, searchTerm, categoryFilter });

    // Test connection first
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      console.log('🔌 Connection test failed:', connectionTest.error);
      return { listings: [], error: 'CONNECTION_ERROR' };
    }

    try {
      console.log('🔨 Building query...');
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
        console.log('✅ Applied status filter:', statusFilter);
      }

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
        console.log('✅ Applied category filter:', categoryFilter);
      }

      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm}%`);
        console.log('✅ Applied search filter:', searchTerm);
      }

      console.log('⏳ Executing main query...');
      const startTime = Date.now();
      
      const { data, error } = await query;
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ Main query executed in ${duration}ms`);

      if (error) {
        console.error('❌ Main query error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

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

      console.log(`✅ Successfully fetched ${data.length} listings`);
      
      const transformedListings = data.map(transformListing);
      console.log(`🔄 Transformed ${transformedListings.length} listings`);
      
      try {
        fallbackDataService.saveFallbackData(data);
        console.log('💾 Saved fallback data');
      } catch (saveError) {
        console.warn('⚠️ Failed to save fallback data:', saveError);
      }
      
      return { listings: transformedListings, error: null };
      
    } catch (error: any) {
      console.error('💥 Main fetch exception:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
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
    fetchFromDatabase,
    testConnection
  };
};
