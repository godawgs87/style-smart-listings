
import React from 'react';
import { TableCell } from '@/components/ui/table';

interface TitleCellProps {
  title: string;
  description: string | null;
}

const TitleCell = ({ title, description }: TitleCellProps) => {
  return (
    <TableCell className="sticky left-28 bg-white z-10 border-r min-w-[250px]">
      <div>
        <div className="font-medium text-sm line-clamp-2">{title}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
            {description.length > 100 
              ? `${description.substring(0, 100)}...` 
              : description}
          </div>
        )}
      </div>
    </TableCell>
  );
};

export default TitleCell;
