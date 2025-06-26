
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fallbackDataService } from '@/services/fallbackDataService';
import { useListingTransforms } from './useListingTransforms';
import type { Listing } from '@/types/Listing';

interface UseLightweightQueryOptions {
  statusFilter?: string;
  limit: number;
  searchTerm?: string;
  categoryFilter?: string;
}

// Lightweight listing interface for initial load
interface LightweightListing {
  id: string;
  title: string;
  price: number;
  status: string | null;
  category: string | null;
  condition: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  purchase_price?: number;
  net_profit?: number;
  profit_margin?: number;
  days_to_sell?: number;
}

export const useLightweightQuery = () => {
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
        console.error('❌ Connection test failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Connection test successful');
      return { success: true };
    } catch (error: any) {
      console.error('💥 Connection test exception:', error);
      return { success: false, error: error.message };
    }
  };

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
      console.log('🔨 Building lightweight query (essential fields only)...');
      
      // Select only essential fields for initial load - no photos or heavy fields
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
          user_id,
          purchase_price,
          net_profit,
          profit_margin,
          days_to_sell
        `);

      // Apply filters in optimal order to leverage indexes
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
        console.log('✅ Applied status filter:', statusFilter);
      }

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
        console.log('✅ Applied category filter:', categoryFilter);
      }

      // Apply search filter using title search
      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm}%`);
        console.log('✅ Applied title search:', searchTerm);
      }

      // Order by created_at DESC
      query = query.order('created_at', { ascending: false });

      // Apply limit
      query = query.limit(limit);
      console.log('✅ Applied limit:', limit);

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
      
      // Transform lightweight listings to full Listing interface with defaults
      const transformedListings: Listing[] = data.map(item => ({
        ...item,
        description: null, // Will be loaded on-demand
        measurements: {},
        keywords: [],
        photos: [], // Will be loaded on-demand
        price_research: null,
        shipping_cost: 9.95, // Default shipping cost
        purchase_date: null,
        is_consignment: false,
        consignment_percentage: null,
        cost_basis: null,
        fees_paid: null,
        listed_date: null,
        sold_date: null,
        sold_price: null,
        consignor_contact: null,
        source_location: null,
        source_type: null,
        performance_notes: null,
        consignor_name: null
      }));
      
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

  const fetchListingDetails = async (id: string): Promise<{
    details: Partial<Listing> | null;
    error: string | null;
  }> => {
    try {
      console.log('🔍 Fetching detailed data for listing:', id);
      
      const { data, error } = await supabase
        .from('listings')
        .select(`
          description,
          measurements,
          keywords,
          photos,
          shipping_cost,
          price_research,
          purchase_date,
          is_consignment,
          consignment_percentage,
          cost_basis,
          fees_paid,
          listed_date,
          sold_date,
          sold_price,
          consignor_contact,
          source_location,
          source_type,
          performance_notes,
          consignor_name
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Failed to fetch listing details:', error);
        return { details: null, error: error.message };
      }

      console.log('✅ Successfully fetched listing details');
      
      // Transform the data to match Listing interface
      const transformedDetails: Partial<Listing> = {
        description: data.description,
        measurements: typeof data.measurements === 'object' && data.measurements !== null 
          ? data.measurements as { length?: string; width?: string; height?: string; weight?: string; }
          : {},
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        photos: Array.isArray(data.photos) ? data.photos : [],
        shipping_cost: data.shipping_cost || null,
        price_research: data.price_research,
        purchase_date: data.purchase_date,
        is_consignment: data.is_consignment,
        consignment_percentage: data.consignment_percentage,
        cost_basis: data.cost_basis,
        fees_paid: data.fees_paid,
        listed_date: data.listed_date,
        sold_date: data.sold_date,
        sold_price: data.sold_price,
        consignor_contact: data.consignor_contact,
        source_location: data.source_location,
        source_type: data.source_type,
        performance_notes: data.performance_notes,
        consignor_name: data.consignor_name
      };
      
      return { details: transformedDetails, error: null };
    } catch (error: any) {
      console.error('💥 Exception fetching listing details:', error);
      return { details: null, error: error.message };
    }
  };

  return {
    fetchLightweightListings,
    fetchListingDetails,
    testConnection
  };
};
