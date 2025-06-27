
import React from 'react';
import { TableCell } from '@/components/ui/table';

interface CategoryCellProps {
  category: string | null;
}

const CategoryCell = ({ category }: CategoryCellProps) => {
  return (
    <TableCell className="text-sm">{category || '-'}</TableCell>
  );
};

export default CategoryCell;
