
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter } from 'lucide-react';

interface ColumnCustomizerProps {
  visibleColumns: {
    image: boolean;
    title: boolean;
    price: boolean;
    status: boolean;
    category: boolean;
    condition: boolean;
    shipping: boolean;
    measurements: boolean;
    keywords: boolean;
    description: boolean;
  };
  onColumnToggle: (column: keyof typeof visibleColumns) => void;
}

const ColumnCustomizer = ({ visibleColumns, onColumnToggle }: ColumnCustomizerProps) => {
  const columns = [
    { key: 'image' as const, label: 'Image' },
    { key: 'title' as const, label: 'Product Details' },
    { key: 'price' as const, label: 'Price' },
    { key: 'status' as const, label: 'Status' },
    { key: 'category' as const, label: 'Category' },
    { key: 'condition' as const, label: 'Condition' },
    { key: 'shipping' as const, label: 'Shipping' },
    { key: 'measurements' as const, label: 'Measurements' },
    { key: 'keywords' as const, label: 'Keywords' },
    { key: 'description' as const, label: 'Description' }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Show Columns</h4>
          <div className="space-y-2">
            {columns.map((column) => (
              <div key={column.key} className="flex items-center space-x-2">
                <Checkbox
                  id={column.key}
                  checked={visibleColumns[column.key]}
                  onCheckedChange={() => onColumnToggle(column.key)}
                />
                <label htmlFor={column.key} className="text-sm">
                  {column.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColumnCustomizer;
