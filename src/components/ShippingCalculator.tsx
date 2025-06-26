
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface ShippingCalculatorProps {
  itemWeight?: number;
  itemDimensions?: {
    length: number;
    width: number;
    height: number;
  };
  onShippingSelect: (option: any) => void;
}

const ShippingCalculator = ({ 
  itemWeight = 1, 
  itemDimensions = { length: 12, width: 12, height: 6 },
  onShippingSelect 
}: ShippingCalculatorProps) => {
  const [weight, setWeight] = useState(itemWeight);
  const [dimensions, setDimensions] = useState(itemDimensions);
  const [isLocalPickup, setIsLocalPickup] = useState(false);

  const calculateShipping = () => {
    if (isLocalPickup) {
      return [
        { service: 'Local Pickup', cost: 0, days: '0-1' }
      ];
    }

    const baseRate = 9.95;
    const weightMultiplier = Math.max(1, Math.ceil(weight));
    const volumeWeight = (dimensions.length * dimensions.width * dimensions.height) / 166;
    const billableWeight = Math.max(weight, volumeWeight);
    
    return [
      { 
        service: 'USPS Ground Advantage', 
        cost: baseRate + (billableWeight * 0.5), 
        days: '2-5' 
      },
      { 
        service: 'USPS Priority Mail', 
        cost: baseRate + (billableWeight * 1.2), 
        days: '1-3' 
      },
      { 
        service: 'UPS Ground', 
        cost: baseRate + (billableWeight * 0.8), 
        days: '1-5' 
      }
    ];
  };

  const shippingOptions = calculateShipping();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="local-pickup"
            checked={isLocalPickup}
            onCheckedChange={(checked) => setIsLocalPickup(checked as boolean)}
          />
          <Label htmlFor="local-pickup">Local Pickup Only (Free)</Label>
        </div>

        {!isLocalPickup && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="length">Length (in)</Label>
                <Input
                  id="length"
                  type="number"
                  value={dimensions.length}
                  onChange={(e) => setDimensions(prev => ({
                    ...prev,
                    length: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="width">Width (in)</Label>
                <Input
                  id="width"
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions(prev => ({
                    ...prev,
                    width: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (in)</Label>
                <Input
                  id="height"
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({
                    ...prev,
                    height: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Shipping Options:</h4>
          {shippingOptions.map((option, index) => (
            <div key={index} className="flex justify-between items-center p-2 border rounded">
              <div>
                <span className="font-medium">{option.service}</span>
                <span className="text-sm text-gray-500 ml-2">({option.days} business days)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">${option.cost.toFixed(2)}</span>
                <Button
                  size="sm"
                  onClick={() => onShippingSelect({
                    service: option.service,
                    cost: option.cost,
                    estimatedDays: option.days
                  })}
                >
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingCalculator;
