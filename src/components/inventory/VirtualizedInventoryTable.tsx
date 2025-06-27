
import React, { useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface ListingSummary {
  id: string;
  title: string;
  price: number;
  status: string | null;
  category: string | null;
  created_at: string;
  photos: string[] | null;
}

interface VirtualizedInventoryTableProps {
  listings: ListingSummary[];
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  loadNextPage: () => Promise<void>;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ITEM_HEIGHT = 80;

const VirtualizedInventoryTable = ({
  listings,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  onViewDetails,
  onEdit,
  onDelete
}: VirtualizedInventoryTableProps) => {
  const itemCount = hasNextPage ? listings.length + 1 : listings.length;
  const isItemLoaded = (index: number) => !!listings[index];

  const ListingRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const listing = listings[index];
    
    if (!listing) {
      return (
        <div style={style} className="flex items-center justify-center p-4">
          <div className="text-gray-500">Loading...</div>
        </div>
      );
    }

    return (
      <div style={style} className="px-4 py-2">
        <Card className="p-3 hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {listing.photos && listing.photos[0] && (
                <img 
                  src={listing.photos[0]} 
                  alt={listing.title}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{listing.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>${listing.price.toFixed(2)}</span>
                  {listing.status && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      listing.status === 'active' ? 'bg-green-100 text-green-800' :
                      listing.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status}
                    </span>
                  )}
                  {listing.category && (
                    <span className="text-gray-500">{listing.category}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(listing.id)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(listing.id)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(listing.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-96 w-full">
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadNextPage}
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            height={400}
            itemCount={itemCount}
            itemSize={ITEM_HEIGHT}
            onItemsRendered={onItemsRendered}
          >
            {ListingRow}
          </List>
        )}
      </InfiniteLoader>
    </div>
  );
};

export default VirtualizedInventoryTable;
