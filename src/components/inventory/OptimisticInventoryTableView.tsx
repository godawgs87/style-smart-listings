
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import OptimisticTableRow from './table/OptimisticTableRow';
import type { Listing } from '@/types/Listing';

interface OptimisticInventoryTableViewProps {
  listings: Listing[];
  selectedListings: string[];
  optimisticUpdates: Map<string, 'deleting' | 'updating'>;
  visibleColumns: any;
  onSelectListing: (listingId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteListing: (listingId: string) => Promise<void>;
  onUpdateListing?: (listingId: string, updates: Partial<Listing>) => Promise<void>;
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
  onUpdateListing,
  onPreviewListing,
  onEditListing,
  onDuplicateListing
}: OptimisticInventoryTableViewProps) => {
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
              <OptimisticTableRow
                key={listing.id}
                listing={listing}
                detailedListing={listing} // We'll let OptimisticTableRow handle selective loading
                isSelected={isSelected}
                isUpdating={isUpdating}
                visibleColumns={visibleColumns}
                onSelectListing={onSelectListing}
                onUpdateListing={onUpdateListing}
                onDeleteListing={onDeleteListing}
                onPreviewListing={onPreviewListing}
                onEditListing={onEditListing}
                onDuplicateListing={onDuplicateListing}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default OptimisticInventoryTableView;
