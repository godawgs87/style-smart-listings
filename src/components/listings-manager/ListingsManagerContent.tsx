
import React from 'react';
import { Card } from '@/components/ui/card';
import OptimisticInventoryTable from '@/components/inventory/OptimisticInventoryTable';
import ListingsErrorState from '@/components/ListingsErrorState';
import type { Listing } from '@/types/Listing';

interface ListingsManagerContentProps {
  loading: boolean;
  error: string | null;
  filteredListings: Listing[];
  selectedListings: string[];
  onSelectListing: (listingId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateListing: (listingId: string, updates: any) => Promise<void>;
  onDeleteListing: (listingId: string) => Promise<void>;
}

const ListingsManagerContent = ({
  loading,
  error,
  filteredListings,
  selectedListings,
  onSelectListing,
  onSelectAll,
  onUpdateListing,
  onDeleteListing
}: ListingsManagerContentProps) => {
  if (error) {
    return <ListingsErrorState error={error} />;
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">Loading listings...</div>
      </Card>
    );
  }

  return (
    <OptimisticInventoryTable
      listings={filteredListings}
      selectedListings={selectedListings}
      onSelectListing={onSelectListing}
      onSelectAll={onSelectAll}
      onUpdateListing={onUpdateListing}
      onDeleteListing={onDeleteListing}
    />
  );
};

export default ListingsManagerContent;
