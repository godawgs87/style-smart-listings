
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Copy, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ListingImagePreview from '../ListingImagePreview';
import type { Listing } from '@/types/Listing';

interface OptimisticInventoryGridItemProps {
  listing: Listing;
  isSelected: boolean;
  isUpdating: boolean;
  onSelectListing: (listingId: string, checked: boolean) => void;
  onDeleteListing: (listingId: string) => Promise<void>;
  onPreviewListing?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onDuplicateListing?: (listing: Listing) => Promise<Listing | null>;
}

const OptimisticInventoryGridItem = ({
  listing,
  isSelected,
  isUpdating,
  onSelectListing,
  onDeleteListing,
  onPreviewListing,
  onEditListing,
  onDuplicateListing
}: OptimisticInventoryGridItemProps) => {
  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'active': return 'default';
      case 'sold': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const handleOptimisticDelete = async (listingId: string) => {
    try {
      await onDeleteListing(listingId);
    } catch (error) {
      throw error;
    }
  };

  return (
    <Card className={`p-3 transition-all ${isUpdating ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''} hover:shadow-md`}>
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectListing(listing.id, !!checked)}
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
              {onPreviewListing && (
                <DropdownMenuItem onClick={() => onPreviewListing(listing)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
              )}
              {onEditListing && (
                <DropdownMenuItem onClick={() => onEditListing(listing)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDuplicateListing && (
                <DropdownMenuItem onClick={() => onDuplicateListing(listing)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => handleOptimisticDelete(listing.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Image */}
        <div className="aspect-square">
          <ListingImagePreview 
            photos={listing.photos} 
            title={listing.title}
            listingId={listing.id}
            className="w-full h-full"
          />
        </div>
        
        {/* Content */}
        <div className="space-y-1">
          <h3 className="font-medium text-xs leading-tight line-clamp-2">{listing.title}</h3>
          
          <div className="flex items-center justify-between">
            <span className="font-semibold text-green-600 text-sm">${listing.price?.toFixed(2)}</span>
            {listing.status && (
              <Badge variant={getStatusBadgeVariant(listing.status)} className="text-xs px-1 py-0">
                {listing.status}
              </Badge>
            )}
          </div>
          
          {listing.category && (
            <p className="text-xs text-gray-500 truncate">{listing.category}</p>
          )}
          
          <div className="text-xs text-gray-400">
            {new Date(listing.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OptimisticInventoryGridItem;
