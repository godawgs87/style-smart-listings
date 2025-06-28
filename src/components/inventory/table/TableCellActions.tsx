
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Copy, MoreVertical, Check, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Listing } from '@/types/Listing';

interface TableCellActionsProps {
  listing: Listing;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onPreview?: (listing: Listing) => void;
  onDuplicate?: (listing: Listing) => Promise<Listing | null>;
}

const TableCellActions = ({
  listing,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onPreview,
  onDuplicate
}: TableCellActionsProps) => {
  return (
    <TableCell>
      {isEditing ? (
        <div className="flex gap-1">
          <Button 
            size="sm" 
            onClick={onSave}
            className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
          >
            <Check className="w-4 h-4 text-white" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
            {onPreview && (
              <DropdownMenuItem onClick={() => onPreview(listing)}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {onDuplicate && (
              <DropdownMenuItem onClick={() => onDuplicate(listing)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </TableCell>
  );
};

export default TableCellActions;
