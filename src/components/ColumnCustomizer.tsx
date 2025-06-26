
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter } from 'lucide-react';

interface VisibleColumns {
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
  // New financial tracking columns
  purchasePrice: boolean;
  purchaseDate: boolean;
  consignmentStatus: boolean;
  sourceType: boolean;
  sourceLocation: boolean;
  costBasis: boolean;
  netProfit: boolean;
  profitMargin: boolean;
  daysToSell: boolean;
  performanceNotes: boolean;
}

interface ColumnCustomizerProps {
  visibleColumns: VisibleColumns;
  onColumnToggle: (column: keyof VisibleColumns) => void;
}

const ColumnCustomizer = ({ visibleColumns, onColumnToggle }: ColumnCustomizerProps) => {
  const columnGroups = [
    {
      title: 'Basic Info',
      columns: [
        { key: 'image' as const, label: 'Image' },
        { key: 'title' as const, label: 'Product Details' },
        { key: 'price' as const, label: 'Price' },
        { key: 'status' as const, label: 'Status' },
        { key: 'category' as const, label: 'Category' },
        { key: 'condition' as const, label: 'Condition' },
      ]
    },
    {
      title: 'Shipping & Details',
      columns: [
        { key: 'shipping' as const, label: 'Shipping' },
        { key: 'measurements' as const, label: 'Measurements' },
        { key: 'keywords' as const, label: 'Keywords' },
        { key: 'description' as const, label: 'Description' },
      ]
    },
    {
      title: 'Purchase & Source',
      columns: [
        { key: 'purchasePrice' as const, label: 'Purchase Price' },
        { key: 'purchaseDate' as const, label: 'Purchase Date' },
        { key: 'sourceType' as const, label: 'Source Type' },
        { key: 'sourceLocation' as const, label: 'Source Location' },
        { key: 'consignmentStatus' as const, label: 'Consignment' },
      ]
    },
    {
      title: 'Financial Metrics',
      columns: [
        { key: 'costBasis' as const, label: 'Cost Basis' },
        { key: 'netProfit' as const, label: 'Net Profit' },
        { key: 'profitMargin' as const, label: 'Profit Margin' },
        { key: 'daysToSell' as const, label: 'Days to Sell' },
        { key: 'performanceNotes' as const, label: 'Performance Notes' },
      ]
    }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Show Columns</h4>
          
          {columnGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {group.title}
              </h5>
              <div className="space-y-2 pl-2">
                {group.columns.map((column) => (
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
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColumnCustomizer;
