
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
    
    console.log('🔧 Building optimized lightweight query with options:', options);
    
    // Use a more focused select to reduce data transfer and improve performance
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

    // Apply filters in optimal order to leverage the new composite indexes
    // Always filter by user_id first (this is implicit via RLS but helps with planning)
    
    // Apply status filter first to leverage idx_listings_user_status_category_created
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
      console.log('✅ Applied status filter (indexed):', statusFilter);
    }

    // Apply category filter second to leverage the composite indexes
    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter);
      console.log('✅ Applied category filter (indexed):', categoryFilter);
    }

    // Apply search filter using the new combined search index
    if (searchTerm && searchTerm.trim()) {
      // Use full-text search which leverages our new GIN index
      const cleanSearchTerm = searchTerm.trim().replace(/[^\w\s]/g, '');
      query = query.textSearch('title,description', cleanSearchTerm, {
        type: 'websearch',
        config: 'english'
      });
      console.log('✅ Applied full-text search (GIN indexed):', cleanSearchTerm);
    }

    // Order by created_at DESC (leverages all our composite indexes)
    query = query.order('created_at', { ascending: false });

    // Apply limit last
    query = query.limit(limit);
    console.log('✅ Applied ordering and limit:', limit);

    return query;
  };

  return { buildQuery };
};
