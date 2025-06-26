
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

    console.log('🚀 Starting optimized indexed query...');
    console.log('📋 Query options:', { statusFilter, limit, searchTerm, categoryFilter });

    // Test connection first
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      console.log('🔌 Connection test failed:', connectionTest.error);
      return { listings: [], error: 'CONNECTION_ERROR' };
    }

    try {
      console.log('🔨 Building optimized indexed query...');
      
      let query = supabase
        .from('listings')
        .select(`
          id, 
          title, 
          price, 
          status, 
          category, 
          condition, 
          created_at, 
          updated_at,
          description,
          shipping_cost,
          measurements,
          keywords,
          photos,
          price_research,
          user_id,
          purchase_price,
          purchase_date,
          is_consignment,
          consignment_percentage,
          cost_basis,
          fees_paid,
          net_profit,
          profit_margin,
          listed_date,
          sold_date,
          sold_price,
          days_to_sell,
          consignor_contact,
          source_location,
          source_type,
          performance_notes,
          consignor_name
        `);

      // Apply filters in optimal order to leverage indexes
      // First filter by status (uses idx_listings_user_status_created)
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
        console.log('✅ Applied status filter (indexed):', statusFilter);
      }

      // Then filter by category (uses idx_listings_user_category)
      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
        console.log('✅ Applied category filter (indexed):', categoryFilter);
      }

      // Apply search filter using GIN index for full-text search
      if (searchTerm && searchTerm.trim()) {
        query = query.textSearch('title', searchTerm, {
          type: 'websearch',
          config: 'english'
        });
        console.log('✅ Applied full-text search (GIN indexed):', searchTerm);
      }

      // Order by created_at DESC (leverages all our composite indexes)
      query = query.order('created_at', { ascending: false });

      // Apply limit last
      query = query.limit(limit);
      console.log('✅ Applied limit:', limit);

      console.log('⏳ Executing optimized indexed query...');
      const startTime = Date.now();
      
      const { data, error } = await query;
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ Indexed query executed in ${duration}ms`);

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

      console.log(`✅ Successfully fetched ${data.length} listings with indexed query`);
      
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
