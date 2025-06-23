
import React, { useState, useEffect } from 'react';
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
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);

  useEffect(() => {
    // Calculate realistic shipping options based on weight and dimensions
    const calculateShippingOptions = (): ShippingOption[] => {
      const dimensionalWeight = (dimensions.length * dimensions.width * dimensions.height) / 166;
      const billableWeight = Math.max(weight, dimensionalWeight);
      
      const options: ShippingOption[] = [];

      // USPS First Class (up to 1 lb)
      if (weight <= 1) {
        options.push({
          carrier: 'USPS',
          service: 'First Class',
          cost: Math.max(4.95, weight * 3.5),
          deliveryTime: '2-5 business days',
          recommended: true
        });
      }

      // USPS Priority Mail
      const priorityBase = weight <= 1 ? 8.95 : weight <= 2 ? 9.95 : weight <= 3 ? 12.45 : 15.95;
      options.push({
        carrier: 'USPS',
        service: 'Priority Mail',
        cost: priorityBase + (billableWeight > weight ? (billableWeight - weight) * 2 : 0),
        deliveryTime: '1-3 business days',
        recommended: weight > 1 && weight <= 5
      });

      // UPS Ground
      const upsBase = billableWeight <= 1 ? 12.45 : billableWeight * 4.2 + 8;
      options.push({
        carrier: 'UPS',
        service: 'Ground',
        cost: Math.round(upsBase * 100) / 100,
        deliveryTime: '1-5 business days'
      });

      // FedEx Ground
      const fedexBase = billableWeight <= 1 ? 11.95 : billableWeight * 3.8 + 8.5;
      options.push({
        carrier: 'FedEx',
        service: 'Ground',
        cost: Math.round(fedexBase * 100) / 100,
        deliveryTime: '1-5 business days'
      });

      // USPS Priority Express for higher value items
      if (weight <= 10) {
        options.push({
          carrier: 'USPS',
          service: 'Priority Express',
          cost: Math.max(24.95, billableWeight * 8 + 15),
          deliveryTime: '1-2 business days'
        });
      }

      return options.sort((a, b) => a.cost - b.cost);
    };

    setShippingOptions(calculateShippingOptions());
  }, [weight, dimensions]);

  const handleSelect = (option: ShippingOption) => {
    setSelectedOption(option);
    onShippingSelect(option);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Package Details</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
          <span>Weight: {weight} lbs</span>
          <span>Dimensions: {dimensions.length}"×{dimensions.width}"×{dimensions.height}"</span>
          <span>Dimensional Weight: {Math.round((dimensions.length * dimensions.width * dimensions.height) / 166 * 100) / 100} lbs</span>
          <span>Billable Weight: {Math.max(weight, (dimensions.length * dimensions.width * dimensions.height) / 166).toFixed(1)} lbs</span>
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
              <span className="text-lg font-bold text-green-600">${option.cost.toFixed(2)}</span>
            </div>
          </Card>
        ))}
      </div>

      {selectedOption && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Selected Shipping</h4>
          <p className="text-sm text-green-700">
            {selectedOption.carrier} {selectedOption.service} - ${selectedOption.cost.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;
