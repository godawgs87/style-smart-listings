
export const generateRealisticListingData = (groupName: string, photoCount: number) => {
  // Sample realistic titles based on common reseller items
  const realisticTitles = [
    "Vintage Nike Air Force 1 Sneakers",
    "Levi's 501 Original Fit Jeans",
    "North Face Fleece Jacket",
    "Adidas Track Jacket",
    "Champion Reverse Weave Hoodie",
    "Carhartt Work Jacket", 
    "Tommy Hilfiger Polo Shirt",
    "Ralph Lauren Button Down Shirt",
    "Patagonia Outdoor Vest",
    "Under Armour Athletic Shorts",
    "Columbia Rain Jacket",
    "Gap Denim Jacket",
    "Old Navy Casual Pants",
    "Timberland Work Boots",
    "Converse All Star High Tops"
  ];

  // Generate realistic measurements for clothing items
  const generateMeasurements = () => {
    const clothingMeasurements = [
      { length: "28", width: "20", height: "2", weight: "0.8" }, // Shirt
      { length: "32", width: "16", height: "1", weight: "1.2" }, // Pants
      { length: "26", width: "22", height: "3", weight: "1.5" }, // Jacket
      { length: "12", width: "8", height: "5", weight: "2.1" }, // Shoes
      { length: "24", width: "18", height: "2", weight: "0.9" }, // Hoodie
    ];
    return clothingMeasurements[Math.floor(Math.random() * clothingMeasurements.length)];
  };

  // Generate realistic descriptions
  const conditions = ["Excellent", "Very Good", "Good", "Fair"];
  const brands = ["Nike", "Adidas", "Levi's", "Champion", "Carhartt", "Tommy Hilfiger", "Ralph Lauren"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  
  const randomTitle = realisticTitles[Math.floor(Math.random() * realisticTitles.length)];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
  const measurements = generateMeasurements();
  
  // Generate realistic price based on item type and condition
  let basePrice = 25;
  if (randomTitle.includes("Nike") || randomTitle.includes("Adidas")) basePrice = 45;
  if (randomTitle.includes("Levi's") || randomTitle.includes("Ralph Lauren")) basePrice = 35;
  if (randomTitle.includes("boots") || randomTitle.includes("Boots")) basePrice = 55;
  
  const conditionMultiplier = {
    "Excellent": 1.0,
    "Very Good": 0.85,
    "Good": 0.7,
    "Fair": 0.5
  };
  
  const finalPrice = Math.round(basePrice * conditionMultiplier[randomCondition as keyof typeof conditionMultiplier]);

  return {
    title: randomTitle,
    description: `${randomCondition} condition ${randomTitle.toLowerCase()}. Size ${randomSize}. Great for resale or personal use. Item has been inspected and is ready to list.`,
    price: finalPrice,
    category: randomTitle.includes("shoes") || randomTitle.includes("Boots") || randomTitle.includes("Sneakers") ? "Shoes" : "Clothing",
    category_id: null,
    condition: randomCondition,
    measurements: measurements,
    keywords: [
      randomTitle.split(" ")[0].toLowerCase(), // Brand
      "clothing",
      "fashion", 
      randomCondition.toLowerCase().replace(" ", ""),
      "resale"
    ],
    photos: [],
    priceResearch: `Similar items selling for $${finalPrice - 5}-${finalPrice + 10} on various platforms`,
    purchase_price: undefined,
    purchase_date: undefined,
    source_location: undefined,
    source_type: undefined,
    is_consignment: false,
    consignment_percentage: undefined,
    consignor_name: undefined,
    consignor_contact: undefined,
    clothing_size: randomSize,
    shoe_size: randomTitle.includes("shoes") || randomTitle.includes("Boots") || randomTitle.includes("Sneakers") ? 
      Math.floor(Math.random() * 6 + 7).toString() : undefined,
    gender: Math.random() > 0.5 ? "Men" : "Women",
    age_group: "Adult",
    features: [],
    includes: [],
    defects: []
  };
};
