import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, Package, Truck } from 'lucide-react';

interface ShippingCalculatorProps {
  onShippingCostChange?: (cost: number) => void;
  initialWeight?: number;
  initialDimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

const ShippingCalculator = ({ 
  onShippingCostChange, 
  initialWeight = 1, 
  initialDimensions = { length: 12, width: 8, height: 6 } 
}: ShippingCalculatorProps) => {
  const [weight, setWeight] = useState(initialWeight);
  const [dimensions, setDimensions] = useState(initialDimensions);
  const [zipCode, setZipCode] = useState('');
  const [shippingMethod, setShippingMethod] = useState('ground');
  const [isLocalPickup, setIsLocalPickup] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(9.95);

  useEffect(() => {
    if (isLocalPickup) {
      setEstimatedCost(0);
      onShippingCostChange?.(0);
    } else {
      calculateShipping();
    }
  }, [weight, dimensions, shippingMethod, isLocalPickup]);

  const calculateShipping = () => {
    let baseCost = 5.00;
    let weightCost = weight * 0.5;
    let dimensionCost = (dimensions.length * dimensions.width * dimensions.height) / 500;
    let totalCost = baseCost + weightCost + dimensionCost;

    if (shippingMethod === 'priority') {
      totalCost *= 1.5;
    } else if (shippingMethod === 'express') {
      totalCost *= 2.0;
    }

    setEstimatedCost(totalCost);
    onShippingCostChange?.(totalCost);
  };

  const handleLocalPickupChange = (checked: boolean) => {
    setIsLocalPickup(checked);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Shipping Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="local-pickup" 
            checked={isLocalPickup}
            onCheckedChange={handleLocalPickupChange}
          />
          <Label htmlFor="local-pickup">Local Pickup Available</Label>
        </div>

        {!isLocalPickup && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  placeholder="1.0"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="zipcode">Zip Code</Label>
                <Input
                  id="zipcode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="12345"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="length">Length (in)</Label>
                <Input
                  id="length"
                  type="number"
                  value={dimensions.length}
                  onChange={(e) => setDimensions(prev => ({ ...prev, length: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="width">Width (in)</Label>
                <Input
                  id="width"
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (in)</Label>
                <Input
                  id="height"
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label>Shipping Method</Label>
              <Select value={shippingMethod} onValueChange={setShippingMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ground">Ground (5-7 days)</SelectItem>
                  <SelectItem value="priority">Priority (2-3 days)</SelectItem>
                  <SelectItem value="express">Express (1-2 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="font-medium">Estimated Cost:</span>
            <span className="text-lg font-bold text-green-600">
              {isLocalPickup ? 'Free (Local Pickup)' : `$${estimatedCost.toFixed(2)}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingCalculator;
