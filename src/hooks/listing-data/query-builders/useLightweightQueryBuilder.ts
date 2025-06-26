
import { supabase } from '@/integrations/supabase/client';

interface QueryOptions {
  statusFilter?: string;
  categoryFilter?: string;
  searchTerm?: string;
  limit: number;
}

export const useLightweightQueryBuilder = () => {
  const buildLightweightQuery = (options: QueryOptions) => {
    const { statusFilter, categoryFilter, searchTerm, limit } = options;
    
    console.log('🔨 Building lightweight query (essential fields + shipping + photos)...');
    
    // Select essential fields for initial load + shipping cost and photos
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
        days_to_sell,
        shipping_cost,
        photos
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

    return query;
  };

  return { buildLightweightQuery };
};
