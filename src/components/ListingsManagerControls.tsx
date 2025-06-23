
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckSquare, Table } from 'lucide-react';

interface ListingsManagerControlsProps {
  viewMode: 'cards' | 'table';
  isBulkMode: boolean;
  selectedCount: number;
  onToggleViewMode: () => void;
  onToggleBulkMode: () => void;
}

const ListingsManagerControls = ({
  viewMode,
  isBulkMode,
  selectedCount,
  onToggleViewMode,
  onToggleBulkMode
}: ListingsManagerControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant={viewMode === 'table' ? "default" : "outline"}
          size="sm"
          onClick={onToggleViewMode}
        >
          <Table className="w-4 h-4 mr-2" />
          {viewMode === 'table' ? 'Table View' : 'Card View'}
        </Button>
        
        {viewMode === 'cards' && (
          <Button
            variant={isBulkMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleBulkMode}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            {isBulkMode ? 'Exit Bulk Mode' : 'Bulk Select'}
          </Button>
        )}
        
        {(isBulkMode || viewMode === 'table') && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedCount} selected
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsManagerControls;
