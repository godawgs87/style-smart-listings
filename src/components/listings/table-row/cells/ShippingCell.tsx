
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
  const displayCost = shippingCost === 0 ? 0 : (shippingCost ?? 9.95);
  
  return (
    <TableCell className="text-right">
      ${displayCost.toFixed(2)}
    </TableCell>
  );
};

export default ShippingCell;
