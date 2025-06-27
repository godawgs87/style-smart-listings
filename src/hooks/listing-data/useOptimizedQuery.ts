
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

interface QueryOptions {
  statusFilter?: string;
  categoryFilter?: string;
  searchTerm?: string;
  limit: number;
}

export const useOptimizedQuery = () => {
  const fetchOptimizedListings = async (options: QueryOptions): Promise<{
    listings: Listing[];
    error: 'AUTH_ERROR' | 'CONNECTION_ERROR' | null;
  }> => {
    const { statusFilter, categoryFilter, searchTerm, limit } = options;
    
    try {
      console.log('🚀 Starting optimized query with photos...');
      console.log('📋 Query options:', options);

      const startTime = Date.now();
      
      // Include photos in the query so we can show actual uploaded images
      let query = supabase
        .from('listings')
        .select(`
          id, title, price, status, category, condition, created_at, user_id,
          purchase_price, net_profit, profit_margin, shipping_cost, description, photos
        `);

      // Apply filters efficiently
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      // Use simple text search instead of complex text search
      if (searchTerm && searchTerm.trim()) {
        const cleanTerm = searchTerm.trim();
        query = query.ilike('title', `%${cleanTerm}%`);
      }

      // Order and limit - use the most optimized index
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 20));

      const duration = Date.now() - startTime;
      console.log(`⏱️ Query completed in ${duration}ms`);

      if (error) {
        console.error('❌ Query error:', error);
        
        if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
          return { listings: [], error: 'AUTH_ERROR' };
        }
        
        return { listings: [], error: 'CONNECTION_ERROR' };
      }

      console.log(`✅ Fetched ${data?.length || 0} listings with photos`);
      
      // Transform the data to match the Listing interface
      const transformedListings: Listing[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || null,
        price: item.price,
        purchase_price: item.purchase_price,
        category: item.category || null,
        condition: item.condition || null,
        measurements: {},
        keywords: [],
        photos: item.photos || null, // Include actual photos from database
        price_research: null,
        shipping_cost: item.shipping_cost || null,
        status: item.status || null,
        created_at: item.created_at,
        updated_at: item.created_at,
        user_id: item.user_id || '',
        is_consignment: false,
        source_type: null,
        net_profit: item.net_profit,
        profit_margin: item.profit_margin,
        // Add required fields with defaults
        purchase_date: undefined,
        source_location: undefined,
        cost_basis: undefined,
        fees_paid: undefined,
        sold_date: undefined,
        sold_price: undefined,
        days_to_sell: undefined,
        performance_notes: undefined,
        consignment_percentage: undefined,
        consignor_name: undefined,
        consignor_contact: undefined,
        listed_date: undefined
      }));
      
      return { listings: transformedListings, error: null };
      
    } catch (error: any) {
      console.error('💥 Exception in query:', error);
      
      if (error.message?.includes('JWT') || error.message?.includes('authentication')) {
        return { listings: [], error: 'AUTH_ERROR' };
      }
      
      return { listings: [], error: 'CONNECTION_ERROR' };
    }
  };

  return { fetchOptimizedListings };
};
