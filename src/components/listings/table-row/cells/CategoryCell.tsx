
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { useCategories } from '@/hooks/useCategories';

interface CategoryCellProps {
  category: string | null;
  categoryId?: string | null;
}

const CategoryCell = ({ category, categoryId }: CategoryCellProps) => {
  const { getCategoryById, getCategoryPath } = useCategories();

  const getDisplayName = () => {
    if (categoryId) {
      const categoryObj = getCategoryById(categoryId);
      if (categoryObj) {
        const path = getCategoryPath(categoryId);
        if (path.length > 1) {
          // Show parent > child format for subcategories
          return `${path[0].name} > ${categoryObj.name}`;
        }
        return categoryObj.name;
      }
    }
    // Fallback to old text-based category
    return category || '-';
  };

  return (
    <TableCell className="text-sm">
      <span title={getDisplayName()}>
        {getDisplayName()}
      </span>
    </TableCell>
  );
};

export default CategoryCell;
