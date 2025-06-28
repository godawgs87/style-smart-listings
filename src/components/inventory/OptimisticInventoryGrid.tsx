
import React from 'react';
import OptimisticInventoryGridItem from './OptimisticInventoryGridItem';
import type { Listing } from '@/types/Listing';

interface OptimisticInventoryGridProps {
  listings: Listing[];
  selectedListings: string[];
  optimisticUpdates: Map<string, 'deleting' | 'updating'>;
  onSelectListing: (listingId: string, checked: boolean) => void;
  onDeleteListing: (listingId: string) => Promise<void>;
  onPreviewListing?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onDuplicateListing?: (listing: Listing) => Promise<Listing | null>;
}

const OptimisticInventoryGrid = ({
  listings,
  selectedListings,
  optimisticUpdates,
  onSelectListing,
  onDeleteListing,
  onPreviewListing,
  onEditListing,
  onDuplicateListing
}: OptimisticInventoryGridProps) => {
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {listings.map((listing) => (
          <OptimisticInventoryGridItem
            key={listing.id}
            listing={listing}
            isSelected={selectedListings.includes(listing.id)}
            isUpdating={optimisticUpdates.get(listing.id) === 'updating'}
            onSelectListing={onSelectListing}
            onDeleteListing={onDeleteListing}
            onPreviewListing={onPreviewListing}
            onEditListing={onEditListing}
            onDuplicateListing={onDuplicateListing}
          />
        ))}
      </div>
    </div>
  );
};

export default OptimisticInventoryGrid;
