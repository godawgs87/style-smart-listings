
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
