
import React from 'react';
import UnifiedListingCard from '@/components/UnifiedListingCard';
import ListingsTable from '@/components/ListingsTable';
import ListingsEmptyState from '@/components/ListingsEmptyState';

interface ListingsManagerContentProps {
  viewMode: 'grid' | 'table';
  filteredListings: any[];
  selectedListings: string[];
  loading: boolean;
  error: string | null;
  onSelectListing: (listingId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateListing: (listingId: string, updates: any) => Promise<void>;
  onDeleteListing: (listingId: string) => Promise<void>;
  onPreviewListing: (listing: any) => Promise<void>;
  onEditListing: (listing: any) => Promise<void>;
}

const ListingsManagerContent = ({
  viewMode,
  filteredListings,
  selectedListings,
  loading,
  error,
  onSelectListing,
  onSelectAll,
  onUpdateListing,
  onDeleteListing,
  onPreviewListing,
  onEditListing
}: ListingsManagerContentProps) => {
  if (loading || error) {
    return null;
  }

  if (filteredListings.length === 0) {
    return <ListingsEmptyState />;
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredListings.map((listing) => (
          <UnifiedListingCard
            key={listing.id}
            listing={listing}
            isBulkMode={selectedListings.length > 0}
            isSelected={selectedListings.includes(listing.id)}
            onSelect={(checked) => onSelectListing(listing.id, checked)}
            onEdit={() => onEditListing(listing)}
            onPreview={() => onPreviewListing(listing)}
            onDelete={() => onDeleteListing(listing.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <ListingsTable
      listings={filteredListings}
      selectedListings={selectedListings}
      onSelectListing={onSelectListing}
      onSelectAll={onSelectAll}
      onUpdateListing={onUpdateListing}
      onDeleteListing={onDeleteListing}
      onPreviewListing={onPreviewListing}
      onEditListing={onEditListing}
    />
  );
};

export default ListingsManagerContent;
