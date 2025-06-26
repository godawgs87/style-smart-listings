
import React from 'react';
import { AlertCircle } from 'lucide-react';
import InventoryCard from '@/components/InventoryCard';
import ListingsTable from '@/components/ListingsTable';
import type { Listing } from '@/types/Listing';

interface InventoryContentProps {
  viewMode: 'grid' | 'table';
  filteredListings: Listing[];
  selectedItems: string[];
  isBulkMode: boolean;
  loading: boolean;
  error: string | null;
  onSelectItem: (itemId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateListing: (listingId: string, updates: any) => void;
  onDeleteListing: (listingId: string) => void;
  onDuplicateListing?: (item: Listing) => void;
}

const InventoryContent = ({
  viewMode,
  filteredListings,
  selectedItems,
  isBulkMode,
  loading,
  error,
  onSelectItem,
  onSelectAll,
  onUpdateListing,
  onDeleteListing,
  onDuplicateListing
}: InventoryContentProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 flex items-center">
        <AlertCircle className="mr-2 h-4 w-4" />
        Connection timed out. Please try refreshing or check your internet connection.
      </div>
    );
  }

  if (filteredListings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No items found matching your criteria.
      </div>
    );
  }

  return (
    <>
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredListings.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              isBulkMode={isBulkMode}
              isSelected={selectedItems.includes(item.id)}
              onSelect={(checked) => onSelectItem(item.id, checked)}
              onEdit={() => console.log('Edit', item.id)}
              onPreview={() => console.log('Preview', item.id)}
              onDelete={() => onDeleteListing(item.id)}
              onDuplicate={onDuplicateListing ? () => onDuplicateListing(item) : undefined}
            />
          ))}
        </div>
      )}

      {viewMode === 'table' && (
        <ListingsTable
          listings={filteredListings}
          selectedListings={selectedItems}
          onSelectListing={onSelectItem}
          onSelectAll={onSelectAll}
          onUpdateListing={onUpdateListing}
          onDeleteListing={onDeleteListing}
        />
      )}
    </>
  );
};

export default InventoryContent;
