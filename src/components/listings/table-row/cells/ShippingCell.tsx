
import React from 'react';
import { TableCell } from '@/components/ui/table';

interface ShippingCellProps {
  shippingCost: number | null;
}

const ShippingCell = ({ shippingCost }: ShippingCellProps) => {
  console.log('💰 ShippingCell received shipping cost:', shippingCost, typeof shippingCost);
  
  const displayCost = shippingCost !== null && shippingCost !== undefined ? shippingCost : 9.95;
  
  return (
    <TableCell className="text-right">
      ${displayCost.toFixed(2)}
    </TableCell>
  );
};

export default ShippingCell;
