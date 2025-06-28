
export const generateShippingOptions = (weight: string) => {
  const isLight = weight.includes('oz') || parseFloat(weight) < 1;
  
  if (isLight) {
    return [
      {
        id: 'first-class',
        name: 'USPS First Class',
        cost: 4.50,
        days: '1-3 business days',
        recommended: true,
        packaging: 'Padded envelope'
      },
      {
        id: 'priority',
        name: 'USPS Priority',
        cost: 8.95,
        days: '1-2 business days',
        recommended: false,
        packaging: 'Small box'
      }
    ];
  } else {
    return [
      {
        id: 'priority',
        name: 'USPS Priority',
        cost: 8.95,
        days: '1-2 business days',
        recommended: true,
        packaging: 'Small box'
      },
      {
        id: 'ups-ground',
        name: 'UPS Ground',
        cost: 7.25,
        days: '2-5 business days',
        recommended: false,
        packaging: 'Small box'
      }
    ];
  }
};

export const calculateShippingCost = (
  weight: number,
  dimensions: { length: number; width: number; height: number },
  serviceType: 'ground' | 'expedited' | 'priority'
): number => {
  const baseRates = {
    ground: 5.50,
    priority: 8.95,
    expedited: 15.50
  };

  // Calculate dimensional weight
  const dimensionalWeight = (dimensions.length * dimensions.width * dimensions.height) / 166;
  const billableWeight = Math.max(weight, dimensionalWeight);

  // Base cost plus weight surcharge
  let cost = baseRates[serviceType];
  
  if (billableWeight > 1) {
    cost += (billableWeight - 1) * 1.25;
  }

  // Round to nearest quarter
  return Math.ceil(cost * 4) / 4;
};
