
// Fixed dimensions and weight for DeWalt blower to ensure consistency
export const getWeight = (): number => {
  return 5.0; // Fixed weight for DeWalt blower
};

export const getDimensions = () => {
  return {
    length: 20,
    width: 8, 
    height: 12
  }; // Fixed dimensions for DeWalt blower
};

// Helper function to get consistent measurement strings
export const getMeasurementStrings = () => {
  const dims = getDimensions();
  return {
    length: `${dims.length} inches`,
    width: `${dims.width} inches`, 
    height: `${dims.height} inches`,
    weight: `${getWeight()} lbs`
  };
};
