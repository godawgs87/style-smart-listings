
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  onRetry?: () => void;
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
  onDuplicateListing,
  onRetry
}: InventoryContentProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-red-700">Error Loading Data</h3>
          <p className="text-red-600 mb-4">
            Unable to load listings. Please check your internet connection and try again.
          </p>
          {onRetry && (
            <Button onClick={onRetry} className="flex items-center gap-2 mx-auto">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
        </div>
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
