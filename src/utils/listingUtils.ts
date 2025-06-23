
// Utility functions for extracting measurements from listing data

export const getWeightFromListing = (listingData: any): number => {
  if (listingData?.measurements?.weight) {
    const weightStr = listingData.measurements.weight.toLowerCase();
    const weightMatch = weightStr.match(/[\d.]+/);
    
    if (weightMatch) {
      const numericWeight = parseFloat(weightMatch[0]);
      
      // Check if it's in ounces and convert to pounds
      if (weightStr.includes('oz')) {
        return numericWeight / 16; // Convert ounces to pounds
      } else if (weightStr.includes('lb') || weightStr.includes('pound')) {
        return numericWeight;
      } else {
        // Default assume pounds if no unit specified
        return numericWeight;
      }
    }
  }
  return 1.0; // More reasonable default for small items
};

export const getDimensionsFromListing = (listingData: any) => {
  const measurements = listingData?.measurements || {};
  
  const extractNumber = (str: string): number => {
    const match = str?.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };
  
  return {
    length: extractNumber(measurements.length) || 10,
    width: extractNumber(measurements.width) || 6,
    height: extractNumber(measurements.height) || 4
  };
};

// Legacy functions for backward compatibility (can be removed if not used elsewhere)
export const getWeight = (): number => {
  return 1.0;
};

export const getDimensions = () => {
  return {
    length: 10,
    width: 6, 
    height: 4
  };
};

// Helper function to get measurement strings from listing data
export const getMeasurementStrings = (listingData?: any) => {
  if (listingData?.measurements) {
    return listingData.measurements;
  }
  
  // Fallback to default measurements
  const dims = getDimensions();
  return {
    length: `${dims.length} inches`,
    width: `${dims.width} inches`, 
    height: `${dims.height} inches`,
    weight: `${getWeight()} lbs`
  };
};
