
// AI simulation utilities for bulk upload
// TODO: Replace with actual AI photo analysis service

export const generateRealisticListingData = (groupName: string, photoCount: number) => {
  // IMPORTANT: This should analyze actual photos, not generate random data
  // For now, creating basic placeholder data that users must customize
  
  console.log('Generating listing data for group:', groupName, 'with', photoCount, 'photos');
  
  // Use the actual group name as the title (this comes from photo grouping)
  const title = groupName || 'Untitled Item';
  
  // Basic measurements that user should customize
  const measurements = {
    length: "12", 
    width: "8", 
    height: "4", 
    weight: "1.0"
  };
  
  // Default pricing that user should research and update
  const basePrice = 25;

  return {
    title: title,
    description: `Please add description for: ${title}. Review and update all details before posting.`,
    price: basePrice,
    category: 'Uncategorized', // User should select proper category
    category_id: null,
    condition: 'Good', // User should verify condition
    measurements: measurements,
    keywords: [], // User should add relevant keywords
    photos: [], // Will be populated with actual photo URLs
    priceResearch: 'Please research comparable items and update pricing accordingly',
    purchase_price: undefined, // User should add if applicable
    purchase_date: undefined,
    source_location: undefined,
    source_type: undefined,
    is_consignment: false,
    consignment_percentage: undefined,
    consignor_name: undefined,
    consignor_contact: undefined,
    clothing_size: undefined, // User should specify if clothing
    shoe_size: undefined, // User should specify if shoes
    gender: 'Unisex', // User should specify
    age_group: 'Adult', // User should specify
    features: [], // User should add
    includes: [], // User should add
    defects: [] // User should note any defects
  };
};
