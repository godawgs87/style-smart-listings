
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Copy, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ListingImagePreview from '../ListingImagePreview';
import type { Listing } from '@/types/Listing';

interface OptimisticInventoryTableViewProps {
  listings: Listing[];
  selectedListings: string[];
  optimisticUpdates: Map<string, 'deleting' | 'updating'>;
  visibleColumns: any;
  onSelectListing: (listingId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteListing: (listingId: string) => Promise<void>;
  onPreviewListing?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onDuplicateListing?: (listing: Listing) => Promise<Listing | null>;
}

const OptimisticInventoryTableView = ({
  listings,
  selectedListings,
  optimisticUpdates,
  visibleColumns,
  onSelectListing,
  onSelectAll,
  onDeleteListing,
  onPreviewListing,
  onEditListing,
  onDuplicateListing
}: OptimisticInventoryTableViewProps) => {
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedListings.length === listings.length && listings.length > 0}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            {visibleColumns.image && <TableHead className="w-20">Image</TableHead>}
            {visibleColumns.title && <TableHead>Title</TableHead>}
            {visibleColumns.price && <TableHead className="w-24">Price</TableHead>}
            {visibleColumns.status && <TableHead className="w-20">Status</TableHead>}
            {visibleColumns.category && <TableHead className="w-32">Category</TableHead>}
            {visibleColumns.condition && <TableHead className="w-24">Condition</TableHead>}
            {visibleColumns.shipping && <TableHead className="w-24">Shipping</TableHead>}
            <TableHead className="w-16">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => {
            const isUpdating = optimisticUpdates.get(listing.id) === 'updating';
            const isSelected = selectedListings.includes(listing.id);
            
            return (
              <TableRow 
                key={listing.id} 
                className={`${isUpdating ? 'opacity-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelectListing(listing.id, !!checked)}
                  />
                </TableCell>
                
                {visibleColumns.image && (
                  <TableCell>
                    <ListingImagePreview 
                      photos={listing.photos} 
                      title={listing.title}
                      listingId={listing.id}
                      className="w-12 h-12"
                    />
                  </TableCell>
                )}
                
                {visibleColumns.title && (
                  <TableCell className="max-w-xs">
                    <div className="truncate font-medium">{listing.title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                )}
                
                {visibleColumns.price && (
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      ${listing.price?.toFixed(2)}
                    </span>
                  </TableCell>
                )}
                
                {visibleColumns.status && (
                  <TableCell>
                    {listing.status && (
                      <Badge variant={getStatusBadgeVariant(listing.status)}>
                        {listing.status}
                      </Badge>
                    )}
                  </TableCell>
                )}
                
                {visibleColumns.category && (
                  <TableCell>
                    <span className="text-sm">{listing.category || '-'}</span>
                  </TableCell>
                )}
                
                {visibleColumns.condition && (
                  <TableCell>
                    <span className="text-sm">{listing.condition || '-'}</span>
                  </TableCell>
                )}
                
                {visibleColumns.shipping && (
                  <TableCell>
                    <span className="text-sm">
                      {listing.shipping_cost ? `$${listing.shipping_cost.toFixed(2)}` : '-'}
                    </span>
                  </TableCell>
                )}
                
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default OptimisticInventoryTableView;
