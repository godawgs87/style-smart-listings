
export const useLightweightTransformer = () => {
  const transformListing = (rawListing: any) => {
    console.log('🔄 Transforming lightweight listing:', rawListing.id);
    
    // For lightweight display, we only need essential fields
    const transformed = {
      id: rawListing.id,
      title: rawListing.title || '',
      description: rawListing.description || null,
      price: rawListing.price || 0,
      category: rawListing.category || null,
      condition: rawListing.condition || null,
      measurements: {}, // Empty for lightweight - will load on demand
      keywords: [], // Empty for lightweight - will load on demand
      photos: Array.isArray(rawListing.photos) ? rawListing.photos : [],
      shipping_cost: null, // Not needed for display
      price_research: null, // Not needed for display
      status: rawListing.status || 'draft',
      created_at: rawListing.created_at,
      updated_at: rawListing.updated_at || rawListing.created_at,
      user_id: rawListing.user_id || '',
      
      // Set minimal defaults for fields not in lightweight query
      purchase_price: undefined,
      purchase_date: undefined,
      source_location: undefined,
      source_type: undefined,
      is_consignment: undefined,
      consignment_percentage: undefined,
      consignor_name: undefined,
      consignor_contact: undefined,
      listed_date: undefined,
      sold_date: undefined,
      sold_price: undefined,
      cost_basis: undefined,
      fees_paid: undefined,
      net_profit: undefined,
      profit_margin: undefined,
      days_to_sell: undefined,
      performance_notes: undefined
    };
    
    console.log('✅ Transformed lightweight listing for display');
    
    return transformed;
  };

  return { transformListing };
};
