
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import OptimizedTableRow from './table/OptimizedTableRow';
import type { Listing } from '@/types/Listing';

interface VirtualizedInventoryTableRowsProps {
  listings: Listing[];
  selectedListings: string[];
  optimisticUpdates: Map<string, 'deleting' | 'updating'>;
  visibleColumns: any;
  onSelectListing: (listingId: string, checked: boolean) => void;
  onUpdateListing?: (listingId: string, updates: Partial<Listing>) => Promise<void>;
  onDeleteListing: (listingId: string) => Promise<void>;
  onPreviewListing?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onDuplicateListing?: (listing: Listing) => Promise<Listing | null>;
  height?: number;
}

interface RowData {
  listings: Listing[];
  selectedListings: string[];
  optimisticUpdates: Map<string, 'deleting' | 'updating'>;
  visibleColumns: any;
  onSelectListing: (listingId: string, checked: boolean) => void;
  onUpdateListing?: (listingId: string, updates: Partial<Listing>) => Promise<void>;
  onDeleteListing: (listingId: string) => Promise<void>;
  onPreviewListing?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onDuplicateListing?: (listing: Listing) => Promise<Listing | null>;
}

const Row = ({ index, style, data }: { index: number; style: React.CSSProperties; data: RowData }) => {
  const {
    listings,
    selectedListings,
    optimisticUpdates,
    visibleColumns,
    onSelectListing,
    onUpdateListing,
    onDeleteListing,
    onPreviewListing,
    onEditListing,
    onDuplicateListing
  } = data;

  const listing = listings[index];
  if (!listing) return null;

  const isUpdating = optimisticUpdates.get(listing.id) === 'updating';
  const isSelected = selectedListings.includes(listing.id);

  return (
    <div style={style}>
      <OptimisticTableRow
        listing={listing}
        detailedListing={listing}
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
    </div>
  );
};

const VirtualizedInventoryTableRows = ({
  listings,
  selectedListings,
  optimisticUpdates,
  visibleColumns,
  onSelectListing,
  onUpdateListing,
  onDeleteListing,
  onPreviewListing,
  onEditListing,
  onDuplicateListing,
  height = 400
}: VirtualizedInventoryTableRowsProps) => {
  const itemData = useMemo(() => ({
    listings,
    selectedListings,
    optimisticUpdates,
    visibleColumns,
    onSelectListing,
    onUpdateListing,
    onDeleteListing,
    onPreviewListing,
    onEditListing,
    onDuplicateListing
  }), [
    listings,
    selectedListings,
    optimisticUpdates,
    visibleColumns,
    onSelectListing,
    onUpdateListing,
    onDeleteListing,
    onPreviewListing,
    onEditListing,
    onDuplicateListing
  ]);

  return (
    <List
      height={height}
      itemCount={listings.length}
      itemSize={80}
      itemData={itemData}
      width="100%"
    >
      {Row}
    </List>
  );
};

export default VirtualizedInventoryTableRows;
