
// Utility functions for extracting measurements from listing data

export const getWeightFromListing = (listingData: any): number => {
  if (listingData?.measurements?.weight) {
    // Extract numeric value from weight string (e.g., "5.0 lbs" -> 5.0)
    const weightMatch = listingData.measurements.weight.match(/[\d.]+/);
    return weightMatch ? parseFloat(weightMatch[0]) : 5.0;
  }
  return 5.0; // Default fallback
};

export const getDimensionsFromListing = (listingData: any) => {
  const measurements = listingData?.measurements || {};
  
  const extractNumber = (str: string): number => {
    const match = str?.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };
  
  return {
    length: extractNumber(measurements.length) || 20,
    width: extractNumber(measurements.width) || 8,
    height: extractNumber(measurements.height) || 12
  };
};

// Legacy functions for backward compatibility (can be removed if not used elsewhere)
export const getWeight = (): number => {
  return 5.0;
};

export const getDimensions = () => {
  return {
    length: 20,
    width: 8, 
    height: 12
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
