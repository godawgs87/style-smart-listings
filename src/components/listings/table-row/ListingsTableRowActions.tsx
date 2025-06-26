
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Trash2, Eye, MoreVertical, Copy, Archive } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  condition: string | null;
  status: string | null;
  shipping_cost: number | null;
  measurements: {
    length?: string;
    width?: string;
    height?: string;
    weight?: string;
  } | null;
  keywords: string[] | null;
  photos: string[] | null;
  price_research: string | null;
  created_at: string;
  purchase_price?: number | null;
  purchase_date?: string | null;
  is_consignment?: boolean;
  consignment_percentage?: number | null;
  consignor_name?: string | null;
  consignor_contact?: string | null;
  source_type?: string | null;
  source_location?: string | null;
  cost_basis?: number | null;
  fees_paid?: number | null;
  net_profit?: number | null;
  profit_margin?: number | null;
  listed_date?: string | null;
  sold_date?: string | null;
  sold_price?: number | null;
  days_to_sell?: number | null;
  performance_notes?: string | null;
}

interface ListingsTableRowActionsProps {
  listing: Listing;
  onEdit: () => void;
  onDelete: () => void;
  onPreview?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
}

const ListingsTableRowActions = ({ 
  listing, 
  onEdit, 
  onDelete, 
  onPreview,
  onEditListing 
}: ListingsTableRowActionsProps) => {
  
  const handleDelete = () => {
    console.log('Delete button clicked for listing:', listing.id);
    if (window.confirm(`Are you sure you want to delete "${listing.title}"?`)) {
      console.log('User confirmed deletion');
      onDelete();
    } else {
      console.log('User cancelled deletion');
    }
  };

  return (
    <TableCell className="sticky right-0 bg-white z-10 border-l">
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onPreview && (
              <DropdownMenuItem onClick={() => onPreview(listing)}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
            )}
            {onEditListing && (
              <DropdownMenuItem onClick={() => onEditListing(listing)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => console.log('Duplicate listing')}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Archive listing')}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableCell>
  );
};

export default ListingsTableRowActions;
