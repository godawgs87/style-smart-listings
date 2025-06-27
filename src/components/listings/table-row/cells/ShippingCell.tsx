
import React from 'react';
import { TableCell } from '@/components/ui/table';

interface ShippingCellProps {
  shippingCost: number | null;
}

const ShippingCell = ({ shippingCost }: ShippingCellProps) => {
  return (
    <TableCell className="text-right">
      ${shippingCost?.toFixed(2) || '0.00'}
    </TableCell>
  );
};

export default ShippingCell;
