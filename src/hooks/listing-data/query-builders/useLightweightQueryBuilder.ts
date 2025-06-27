
import { supabase } from '@/integrations/supabase/client';

interface QueryOptions {
  statusFilter?: string;
  categoryFilter?: string;
  searchTerm?: string;
  limit: number;
}

export const useLightweightQueryBuilder = () => {
  const buildQuery = (options: QueryOptions) => {
    const { statusFilter, categoryFilter, searchTerm, limit } = options;
    
    console.log('🔧 Building lightweight query with options:', options);
    
    let query = supabase
      .from('listings')
      .select(`
        id,
        title,
        description,
        price,
        category,
        condition,
        measurements,
        keywords,
        photos,
        shipping_cost,
        price_research,
        status,
        created_at,
        updated_at,
        user_id,
        purchase_price,
        purchase_date,
        source_location,
        source_type,
        is_consignment,
        consignment_percentage,
        consignor_name,
        consignor_contact,
        listed_date,
        sold_date,
        sold_price,
        cost_basis,
        fees_paid,
        net_profit,
        profit_margin,
        days_to_sell,
        performance_notes
      `);

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
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      console.log('✅ Applied search filter:', searchTerm);
    }

    // Order by created_at DESC and apply limit
    query = query.order('created_at', { ascending: false }).limit(limit);
    console.log('✅ Applied ordering and limit:', limit);

    return query;
  };

  return { buildQuery };
};
