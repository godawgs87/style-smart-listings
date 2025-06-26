
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Eye, Trash2 } from 'lucide-react';
import ListingImagePreview from '@/components/ListingImagePreview';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  condition: string | null;
  status: string | null;
  shipping_cost: number | null;
  photos: string[] | null;
  created_at: string;
}

interface ListingCardProps {
  listing: Listing;
  isBulkMode: boolean;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onPreview: () => void;
  onDelete: () => void;
}

const ListingCard = ({
  listing,
  isBulkMode,
  isSelected,
  onSelect,
  onEdit,
  onPreview,
  onDelete
}: ListingCardProps) => {
  return (
    <Card className="p-4 flex flex-col">
      {/* Header with checkbox and actions */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {isBulkMode && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
              {listing.title}
            </h3>
          </div>
        </div>
        {!isBulkMode && (
          <div className="flex space-x-1 flex-shrink-0 ml-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onEdit}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onPreview}
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Image Preview */}
      <div className="mb-3 flex justify-center">
        <div className="w-24 h-24">
          <ListingImagePreview 
            photos={listing.photos} 
            title={listing.title}
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 flex-1">
        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">{listing.category || 'Uncategorized'}</Badge>
          <Badge variant="outline" className="text-xs">{listing.condition || 'N/A'}</Badge>
          {listing.status && (
            <Badge variant={listing.status === 'active' ? 'default' : 'secondary'} className="text-xs">
              {listing.status}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-700 line-clamp-3">
          {listing.description?.substring(0, 80) || 'No description available'}...
        </p>

        {/* Price and Shipping */}
        <div className="space-y-1">
          <p className="text-sm font-bold text-green-600">${listing.price}</p>
          <p className="text-xs text-gray-500">
            Shipping: ${listing.shipping_cost || 9.95}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ListingCard;
