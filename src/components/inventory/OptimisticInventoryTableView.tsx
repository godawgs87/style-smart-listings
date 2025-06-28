
import React, { useState, useEffect, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import OptimisticTableRow from './table/OptimisticTableRow';
import { useListingDetails } from '@/hooks/useListingDetails';
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
  const [detailedListings, setDetailedListings] = useState<Map<string, Listing>>(new Map());
  const loadedListingsRef = useRef<Set<string>>(new Set());
  const { loadDetails, isLoadingDetails } = useListingDetails();

  // Load detailed data for all listings to get photos
  useEffect(() => {
    const loadAllDetails = async () => {
      const updatedDetails = new Map(detailedListings);
      let hasUpdates = false;
      
      for (const listing of listings) {
        if (!loadedListingsRef.current.has(listing.id) && !isLoadingDetails(listing.id)) {
          loadedListingsRef.current.add(listing.id);
          const details = await loadDetails(listing.id);
          if (details) {
            const mergedListing = { ...listing, ...details };
            updatedDetails.set(listing.id, mergedListing);
            hasUpdates = true;
          }
        }
      }
      
      if (hasUpdates) {
        setDetailedListings(updatedDetails);
      }
    };

    loadAllDetails();
  }, [listings, loadDetails, isLoadingDetails]);

  const getListingWithDetails = (listing: Listing): Listing => {
    const detailed = detailedListings.get(listing.id);
    return detailed || listing;
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
            const detailedListing = getListingWithDetails(listing);
            const isUpdating = optimisticUpdates.get(listing.id) === 'updating';
            const isSelected = selectedListings.includes(listing.id);
            
            return (
              <OptimisticTableRow
                key={listing.id}
                listing={listing}
                detailedListing={detailedListing}
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
