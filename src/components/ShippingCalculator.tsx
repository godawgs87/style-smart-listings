
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ShippingOption {
  carrier: string;
  service: string;
  cost: number;
  deliveryTime: string;
  recommended?: boolean;
}

interface ShippingCalculatorProps {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  onShippingSelect: (option: ShippingOption) => void;
}

const ShippingCalculator = ({ weight, dimensions, onShippingSelect }: ShippingCalculatorProps) => {
  const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);

  // Simulated shipping options based on weight and dimensions
  const shippingOptions: ShippingOption[] = [
    {
      carrier: 'USPS',
      service: 'First Class',
      cost: weight <= 1 ? 4.95 : 8.95,
      deliveryTime: '2-5 business days',
      recommended: weight <= 1
    },
    {
      carrier: 'USPS',
      service: 'Priority Mail',
      cost: 9.95,
      deliveryTime: '1-3 business days',
      recommended: weight > 1 && weight <= 5
    },
    {
      carrier: 'UPS',
      service: 'Ground',
      cost: 12.45,
      deliveryTime: '1-5 business days'
    },
    {
      carrier: 'FedEx',
      service: 'Ground',
      cost: 11.95,
      deliveryTime: '1-5 business days'
    }
  ];

  const handleSelect = (option: ShippingOption) => {
    setSelectedOption(option);
    onShippingSelect(option);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Estimated Package Info</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
          <span>Weight: {weight} lbs</span>
          <span>Dimensions: {dimensions.length}"×{dimensions.width}"×{dimensions.height}"</span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Shipping Options</h3>
        {shippingOptions.map((option, index) => (
          <Card
            key={index}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedOption === option ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelect(option)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">{option.carrier}</span>
                  <span className="text-sm text-gray-600">{option.service}</span>
                  {option.recommended && (
                    <Badge variant="default" className="text-xs">Recommended</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{option.deliveryTime}</p>
              </div>
              <span className="text-lg font-bold text-green-600">${option.cost}</span>
            </div>
          </Card>
        ))}
      </div>

      {selectedOption && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Selected Shipping</h4>
          <p className="text-sm text-green-700">
            {selectedOption.carrier} {selectedOption.service} - ${selectedOption.cost}
          </p>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;
