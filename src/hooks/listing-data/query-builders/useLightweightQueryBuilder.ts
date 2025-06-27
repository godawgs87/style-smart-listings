
export const useLightweightQueryBuilder = () => {
  const buildQuery = (supabase: any) => {
    console.log('🔧 Building lightweight query with full field set');
    
    return supabase
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
  };

  return { buildQuery };
};
