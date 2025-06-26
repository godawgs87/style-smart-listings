
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

  const testConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Testing basic Supabase connection...');
      
      // Test basic connection with a simple query
      const { data, error } = await supabase
        .from('listings')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error('❌ Connection test failed:', error);
        return false;
      }
      
      console.log('✅ Connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Connection test exception:', error);
      return false;
    }
  };

  const fetchFromDatabase = async (options: UseDatabaseQueryOptions): Promise<{
    listings: Listing[];
    error: string | null;
  }> => {
    const { statusFilter, limit, searchTerm, categoryFilter } = options;

    console.log(`🚀 Starting database fetch - ${new Date().toISOString()}`);
    console.log('📋 Query options:', { statusFilter, limit, searchTerm, categoryFilter });

    // First test basic connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('🔌 Basic connection test failed - returning connection error');
      return { listings: [], error: 'CONNECTION_ERROR' };
    }

    try {
      console.log('🔨 Building query...');
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters
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

      console.log('⏳ Executing query...');
      const startTime = Date.now();
      
      const { data, error } = await query;
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ Query executed in ${duration}ms`);

      if (error) {
        console.error('❌ Query error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // Check for authentication errors
        if (error.message.includes('JWT') || 
            error.message.includes('authentication') || 
            error.message.includes('not authenticated') ||
            error.code === 'PGRST301') {
          console.log('🔒 Detected authentication error');
          return { listings: [], error: 'AUTH_ERROR' };
        }

        // All other errors are connection errors
        console.log('🔌 Treating as connection error');
        return { listings: [], error: 'CONNECTION_ERROR' };
      }

      if (!data) {
        console.log('📭 Query returned no data');
        return { listings: [], error: null };
      }

      console.log(`✅ Successfully fetched ${data.length} listings`);
      
      // Transform listings
      const transformedListings = data.map(transformListing);
      console.log(`🔄 Transformed ${transformedListings.length} listings`);
      
      // Save for fallback
      try {
        fallbackDataService.saveFallbackData(data);
        console.log('💾 Saved fallback data');
      } catch (saveError) {
        console.warn('⚠️ Failed to save fallback data:', saveError);
      }
      
      return { listings: transformedListings, error: null };
      
    } catch (error: any) {
      console.error('💥 Fetch exception:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Check for auth errors in exception
      if (error.message?.includes('JWT') || 
          error.message?.includes('authentication') ||
          error.message?.includes('not authenticated')) {
        console.log('🔒 Exception indicates auth error');
        return { listings: [], error: 'AUTH_ERROR' };
      }
      
      // All other exceptions are connection errors
      console.log('🔌 Exception treated as connection error');
      return { listings: [], error: 'CONNECTION_ERROR' };
    }
  };

  return {
    fetchFromDatabase
  };
};
