
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
      console.log('🚀 Starting ultra-optimized query...');
      console.log('📋 Query options:', options);

      const startTime = Date.now();
      
      // Build the most efficient query possible using our new indexes
      let query = supabase
        .from('listings')
        .select(`
          id, title, price, status, category, condition, created_at, updated_at, user_id, photos,
          shipping_cost, measurements, keywords, description, purchase_price,
          is_consignment, source_type, net_profit, profit_margin, price_research
        `);

      // Apply filters in the optimal order for our new composite indexes
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      // Use full-text search for better performance
      if (searchTerm && searchTerm.trim()) {
        const cleanTerm = searchTerm.trim();
        query = query.or(`title.ilike.%${cleanTerm}%,description.ilike.%${cleanTerm}%`);
      }

      // Order and limit
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      const duration = Date.now() - startTime;
      console.log(`⏱️ Ultra-optimized query completed in ${duration}ms`);

      if (error) {
        console.error('❌ Optimized query error:', error);
        
        if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
          return { listings: [], error: 'AUTH_ERROR' };
        }
        
        return { listings: [], error: 'CONNECTION_ERROR' };
      }

      console.log(`✅ Fetched ${data?.length || 0} listings with optimized query`);
      
      // Transform the data to match the Listing interface
      const transformedListings: Listing[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || null,
        price: item.price,
        purchase_price: item.purchase_price,
        category: item.category || null,
        condition: item.condition || null,
        measurements: (item.measurements as any) || {},
        keywords: item.keywords || [],
        photos: item.photos || [],
        price_research: item.price_research || null,
        shipping_cost: item.shipping_cost || null,
        status: item.status || null,
        created_at: item.created_at,
        updated_at: item.updated_at || item.created_at,
        user_id: item.user_id || '',
        is_consignment: item.is_consignment,
        source_type: item.source_type,
        net_profit: item.net_profit,
        profit_margin: item.profit_margin,
        // Add all other required fields with defaults
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
      console.error('💥 Exception in optimized query:', error);
      
      if (error.message?.includes('JWT') || error.message?.includes('authentication')) {
        return { listings: [], error: 'AUTH_ERROR' };
      }
      
      return { listings: [], error: 'CONNECTION_ERROR' };
    }
  };

  return { fetchOptimizedListings };
};
