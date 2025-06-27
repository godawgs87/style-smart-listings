
import { supabase } from '@/integrations/supabase/client';

export const useLightweightQueryBuilder = () => {
  const buildQuery = (options: {
    statusFilter?: string;
    categoryFilter?: string;
    searchTerm?: string;
    limit: number;
  }) => {
    console.log('🔨 Building ultra-lightweight query with options:', options);
    
    // Only select essential fields for display - this is the key optimization
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
        photos,
        description
      `)
      .order('created_at', { ascending: false })
      .limit(options.limit);

    // Apply filters server-side to reduce data transfer
    if (options.statusFilter && options.statusFilter !== 'all') {
      query = query.eq('status', options.statusFilter);
    }

    if (options.categoryFilter && options.categoryFilter !== 'all') {
      query = query.eq('category', options.categoryFilter);
    }

    if (options.searchTerm && options.searchTerm.trim()) {
      query = query.or(`title.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%`);
    }

    console.log('✅ Lightweight query built - fetching only display fields');
    return query;
  };

  return { buildQuery };
};
