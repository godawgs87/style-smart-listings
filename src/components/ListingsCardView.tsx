
import React from 'react';
import ListingCard from '@/components/ListingCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
        <div key={listing.id} className="relative">
          <ListingCard
            listing={listing}
            isBulkMode={isBulkMode}
            isSelected={selectedListings.includes(listing.id)}
            onSelect={(checked) => onSelectListing(listing.id, checked)}
            onEdit={() => onEditListing(listing)}
            onPreview={() => onPreviewListing(listing)}
            onDelete={() => {
              // This will be handled by AlertDialog now
            }}
          />
          
          {/* Delete confirmation overlay */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-75 hover:opacity-100 transition-opacity">
                ×
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteListing(listing.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
};

export default ListingsCardView;
