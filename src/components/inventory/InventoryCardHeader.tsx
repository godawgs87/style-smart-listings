
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Eye, Trash2, Copy } from 'lucide-react';

interface InventoryCardHeaderProps {
  title: string;
  isBulkMode: boolean;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onPreview: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}

const InventoryCardHeader = ({
  title,
  isBulkMode,
  isSelected,
  onSelect,
  onEdit,
  onPreview,
  onDelete,
  onDuplicate
}: InventoryCardHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {isBulkMode && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1 flex-shrink-0"
          />
        )}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
          {title}
        </h3>
      </div>
      {!isBulkMode && (
        <div className="flex space-x-1 flex-shrink-0 ml-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={onEdit}
            title="Edit item"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={onPreview}
            title="Preview item"
          >
            <Eye className="w-3 h-3" />
          </Button>
          {onDuplicate && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onDuplicate}
              title="Duplicate item"
            >
              <Copy className="w-3 h-3" />
            </Button>
          )}
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-8 w-8" 
            onClick={onDelete}
            title="Delete item"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default InventoryCardHeader;
