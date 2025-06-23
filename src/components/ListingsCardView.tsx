
import React from 'react';
import ListingCard from '@/components/ListingCard';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  condition: string | null;
  status: string | null;
  shipping_cost: number | null;
  created_at: string;
}

interface ListingsCardViewProps {
  listings: Listing[];
  isBulkMode: boolean;
  selectedListings: string[];
  onSelectListing: (listingId: string, checked: boolean) => void;
  onEditListing: (listing: Listing) => void;
  onPreviewListing: (listing: Listing) => void;
  onDeleteListing: (listingId: string) => void;
}

const ListingsCardView = ({
  listings,
  isBulkMode,
  selectedListings,
  onSelectListing,
  onEditListing,
  onPreviewListing,
  onDeleteListing
}: ListingsCardViewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isBulkMode={isBulkMode}
          isSelected={selectedListings.includes(listing.id)}
          onSelect={(checked) => onSelectListing(listing.id, checked)}
          onEdit={() => onEditListing(listing)}
          onPreview={() => onPreviewListing(listing)}
          onDelete={() => {
            if (window.confirm('Are you sure you want to delete this listing?')) {
              onDeleteListing(listing.id);
            }
          }}
        />
      ))}
    </div>
  );
};

export default ListingsCardView;
