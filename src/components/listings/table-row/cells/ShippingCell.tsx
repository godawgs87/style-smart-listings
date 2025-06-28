
import React from 'react';
import { TableCell } from '@/components/ui/table';

interface ShippingCellProps {
  shippingCost: number | null;
}

const ShippingCell = ({ shippingCost }: ShippingCellProps) => {
  console.log('💰 ShippingCell received shipping cost:', shippingCost, typeof shippingCost);
  
  // Handle three cases:
  // 1. shippingCost is 0 (local pickup) - show $0.00
  // 2. shippingCost is null/undefined (not set) - default to $9.95
  // 3. shippingCost has a value > 0 (regular shipping) - show actual cost
  let displayCost: number;
  
  if (shippingCost === 0) {
    displayCost = 0;
    console.log('💰 Local pickup detected, showing $0.00');
  } else if (shippingCost === null || shippingCost === undefined) {
    displayCost = 9.95;
    console.log('💰 No shipping cost set, defaulting to $9.95');
  } else {
    displayCost = shippingCost;
    console.log('💰 Using actual shipping cost:', displayCost);
  }
  
  return (
    <TableCell className="text-right">
      ${displayCost.toFixed(2)}
    </TableCell>
  );
};

export default ShippingCell;
