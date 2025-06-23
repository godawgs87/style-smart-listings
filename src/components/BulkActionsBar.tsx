
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Trash2, MoreVertical } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkStatusUpdate: (status: string) => void;
}

const BulkActionsBar = ({ selectedCount, onBulkDelete, onBulkStatusUpdate }: BulkActionsBarProps) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-900">
          {selectedCount} listing{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Change Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onBulkStatusUpdate('draft')}>
                Set to Draft
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkStatusUpdate('active')}>
                Set to Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkStatusUpdate('sold')}>
                Mark as Sold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkStatusUpdate('archived')}>
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onBulkDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;
