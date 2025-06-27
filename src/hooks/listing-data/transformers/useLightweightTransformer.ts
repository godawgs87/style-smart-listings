
export const useLightweightTransformer = () => {
  const transformListing = (rawListing: any) => {
    console.log('🔄 Transforming listing:', rawListing.id);
    console.log('🔄 Raw measurements:', rawListing.measurements, 'Type:', typeof rawListing.measurements);
    console.log('🔄 Raw keywords:', rawListing.keywords, 'Type:', typeof rawListing.keywords);
    console.log('🔄 Raw description:', rawListing.description ? 'Present' : 'Missing');
    
    // Ensure measurements is a proper object
    let measurements = {};
    if (rawListing.measurements && typeof rawListing.measurements === 'object') {
      measurements = rawListing.measurements;
    }
    
    // Ensure keywords is a proper array
    let keywords = [];
    if (Array.isArray(rawListing.keywords)) {
      keywords = rawListing.keywords;
    }
    
    const transformed = {
      id: rawListing.id,
      title: rawListing.title || '',
      description: rawListing.description || null,
      price: rawListing.price || 0,
      category: rawListing.category || null,
      condition: rawListing.condition || null,
      measurements,
      keywords,
      photos: Array.isArray(rawListing.photos) ? rawListing.photos : [],
      shipping_cost: rawListing.shipping_cost,
      price_research: rawListing.price_research,
      status: rawListing.status || 'draft',
      created_at: rawListing.created_at,
      updated_at: rawListing.updated_at,
      user_id: rawListing.user_id,
      purchase_price: rawListing.purchase_price,
      purchase_date: rawListing.purchase_date,
      source_location: rawListing.source_location,
      source_type: rawListing.source_type,
      is_consignment: rawListing.is_consignment || false,
      consignment_percentage: rawListing.consignment_percentage,
      consignor_name: rawListing.consignor_name,
      consignor_contact: rawListing.consignor_contact,
      listed_date: rawListing.listed_date,
      sold_date: rawListing.sold_date,
      sold_price: rawListing.sold_price,
      cost_basis: rawListing.cost_basis,
      fees_paid: rawListing.fees_paid,
      net_profit: rawListing.net_profit,
      profit_margin: rawListing.profit_margin,
      days_to_sell: rawListing.days_to_sell,
      performance_notes: rawListing.performance_notes
    };
    
    console.log('✅ Transformed listing:', {
      id: transformed.id,
      description: transformed.description ? 'Present' : 'Missing',
      measurements: Object.keys(transformed.measurements),
      keywords: transformed.keywords.length
    });
    
    return transformed;
  };

  return { transformListing };
};
