
import React from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
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
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isTimeoutError = error.includes('timeout') || error.includes('timed out');
    const isConnectionError = error.includes('connection') || error.includes('network');
    
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          {isConnectionError ? (
            <WifiOff className="w-12 h-12 mx-auto text-red-500 mb-4" />
          ) : (
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          )}
          
          <h3 className="text-lg font-semibold mb-2 text-red-700">
            {isTimeoutError ? 'Connection Timeout' : 'Error Loading Data'}
          </h3>
          
          <p className="text-red-600 mb-4">
            {isTimeoutError 
              ? 'The request took too long to complete. This might be due to a slow connection or server issues.'
              : isConnectionError
              ? 'Unable to connect to the server. Please check your internet connection.'
              : error
            }
          </p>
          
          <div className="space-y-2">
            {onRetry && (
              <Button onClick={onRetry} className="flex items-center gap-2 mx-auto">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            
            <p className="text-xs text-gray-500 mt-4">
              If the problem persists, try refreshing the page or check your internet connection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (filteredListings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Wifi className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700">No Items Found</h3>
          <p className="text-gray-500">
            No items match your current search and filter criteria.
          </p>
        </div>
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
          onDuplicateListing={onDuplicateListing}
        />
      )}
    </>
  );
};

export default InventoryContent;
