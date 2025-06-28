
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Truck, Package } from 'lucide-react';

interface ShippingOption {
  id: string;
  name: string;
  cost: number;
  days: string;
  description: string;
}

interface BulkShippingOptionsProps {
  itemWeight?: number;
  itemDimensions?: {
    length: number;
    width: number;
    height: number;
  };
  onShippingSelect: (option: ShippingOption) => void;
  selectedOption?: ShippingOption;
}

const BulkShippingOptions = ({ 
  itemWeight = 1, 
  itemDimensions = { length: 12, width: 12, height: 6 },
  onShippingSelect,
  selectedOption
}: BulkShippingOptionsProps) => {
  const [weight, setWeight] = useState(itemWeight);
  const [dimensions, setDimensions] = useState(itemDimensions);
  const [isLocalPickup, setIsLocalPickup] = useState(false);

  const calculateShipping = (): ShippingOption[] => {
    if (isLocalPickup) {
      return [
        { 
          id: 'local-pickup',
          name: 'Local Pickup Only', 
          cost: 0, 
          days: 'Same day', 
          description: 'Buyer picks up item locally - no shipping required' 
        }
      ];
    }

    const baseRate = 9.95;
    const volumeWeight = (dimensions.length * dimensions.width * dimensions.height) / 166;
    const billableWeight = Math.max(weight, volumeWeight);
    
    return [
      { 
        id: 'usps-ground',
        name: 'USPS Ground Advantage', 
        cost: Math.round((baseRate + (billableWeight * 0.5)) * 100) / 100, 
        days: '2-5 business days',
        description: 'Most economical shipping option'
      },
      { 
        id: 'usps-priority',
        name: 'USPS Priority Mail', 
        cost: Math.round((baseRate + (billableWeight * 1.2)) * 100) / 100, 
        days: '1-3 business days',
        description: 'Faster delivery with tracking included'
      },
      { 
        id: 'ups-ground',
        name: 'UPS Ground', 
        cost: Math.round((baseRate + (billableWeight * 0.8)) * 100) / 100, 
        days: '1-5 business days',
        description: 'Reliable ground shipping service'
      }
    ];
  };

  const shippingOptions = calculateShipping();

  const handleSelectOption = (option: ShippingOption) => {
    onShippingSelect(option);
  };

  const handleLocalPickupToggle = (checked: boolean) => {
    setIsLocalPickup(checked);
    if (checked) {
      // Auto-select local pickup when toggled on
      const localOption = { 
        id: 'local-pickup',
        name: 'Local Pickup Only', 
        cost: 0, 
        days: 'Same day', 
        description: 'Buyer picks up item locally - no shipping required' 
      };
      handleSelectOption(localOption);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center">
          <Truck className="w-4 h-4 mr-2 text-blue-600" />
          Shipping Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Local Pickup Toggle */}
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Checkbox 
            id="local-pickup"
            checked={isLocalPickup}
            onCheckedChange={handleLocalPickupToggle}
          />
          <div>
            <Label htmlFor="local-pickup" className="text-sm font-medium">
              Local Pickup Only (Free)
            </Label>
            <p className="text-xs text-gray-600">Buyer picks up item locally - no shipping required</p>
          </div>
        </div>

        {!isLocalPickup && (
          <>
            <Separator />
            
            {/* Item Specifications */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">Item Specifications</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="weight" className="text-xs">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="length" className="text-xs">Length (in)</Label>
                  <Input
                    id="length"
                    type="number"
                    value={dimensions.length}
                    onChange={(e) => setDimensions(prev => ({
                      ...prev,
                      length: parseInt(e.target.value) || 0
                    }))}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="width" className="text-xs">Width (in)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => setDimensions(prev => ({
                      ...prev,
                      width: parseInt(e.target.value) || 0
                    }))}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-xs">Height (in)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => setDimensions(prev => ({
                      ...prev,
                      height: parseInt(e.target.value) || 0
                    }))}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Shipping Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 text-sm">
            {isLocalPickup ? 'Pickup Option' : 'Available Shipping Options'}
          </h4>
          
          <RadioGroup
            value={selectedOption?.id || ''}
            onValueChange={(value) => {
              const option = shippingOptions.find(opt => opt.id === value);
              if (option) handleSelectOption(option);
            }}
            className="space-y-2"
          >
            {shippingOptions.map((option) => (
              <div 
                key={option.id} 
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedOption?.id === option.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleSelectOption(option)}
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{option.name}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Package className="w-3 h-3 mr-1" />
                          {option.days} • {option.description}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {option.cost === 0 ? 'FREE' : `$${option.cost.toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {selectedOption && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700">
              ✓ Selected: <strong>{selectedOption.name}</strong> - {selectedOption.cost === 0 ? 'FREE' : `$${selectedOption.cost.toFixed(2)}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkShippingOptions;
