
import React from 'react';
import { TableRow } from '@/components/ui/table';
import TableRowCells from './TableRowCells';
import TableCellActions from './TableCellActions';
import { useOptimizedListingDetailsLoader } from '@/hooks/useOptimizedListingDetailsLoader';
import { useTableRowEdit } from './hooks/useTableRowEdit';
import type { Listing } from '@/types/Listing';

interface OptimisticTableRowProps {
  listing: Listing;
  detailedListing: Listing;
  isSelected: boolean;
  isUpdating: boolean;
  visibleColumns: any;
  onSelectListing: (listingId: string, checked: boolean) => void;
  onUpdateListing?: (listingId: string, updates: Partial<Listing>) => Promise<void>;
  onDeleteListing: (listingId: string) => Promise<void>;
  onPreviewListing?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onDuplicateListing?: (listing: Listing) => Promise<Listing | null>;
  onSyncComplete?: () => void;
}

const OptimisticTableRow = ({
  listing,
  detailedListing,
  isSelected,
  isUpdating,
  visibleColumns,
  onSelectListing,
  onUpdateListing,
  onDeleteListing,
  onPreviewListing,
  onEditListing,
  onDuplicateListing,
  onSyncComplete
}: OptimisticTableRowProps) => {
  const {
    isEditing,
    editData,
    handleEdit,
    handleSave,
    handleCancel,
    updateEditData
  } = useTableRowEdit(listing, onUpdateListing);

  // Use optimized loading for images and other details only when needed
  const { detailedListing: loadedListing, isLoading } = useOptimizedListingDetailsLoader(listing, {
    image: visibleColumns.image,
    measurements: visibleColumns.measurements,
    keywords: visibleColumns.keywords,
    description: visibleColumns.description,
    purchasePrice: visibleColumns.purchasePrice,
    netProfit: visibleColumns.netProfit,
    profitMargin: visibleColumns.profitMargin,
    purchaseDate: visibleColumns.purchaseDate,
    consignmentStatus: visibleColumns.consignmentStatus,
    sourceType: visibleColumns.sourceType,
    sourceLocation: visibleColumns.sourceLocation,
    costBasis: visibleColumns.costBasis,
    daysToSell: visibleColumns.daysToSell,
    performanceNotes: visibleColumns.performanceNotes,
  });

  const handleOptimisticDelete = async () => {
    try {
      await onDeleteListing(listing.id);
    } catch (error) {
      throw error;
    }
  };

  // Use loaded listing photos if available, otherwise fallback to base listing photos
  const photosToDisplay = loadedListing?.photos || listing.photos;

  return (
    <TableRow 
      className={`${isUpdating ? 'opacity-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
    >
      <TableRowCells
        listing={listing}
        photosToDisplay={photosToDisplay}
        isSelected={isSelected}
        isEditing={isEditing}
        editData={editData}
        visibleColumns={visibleColumns}
        onSelectListing={onSelectListing}
        updateEditData={updateEditData}
      />
      
      <TableCellActions
        listing={listing}
        isEditing={isEditing}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleOptimisticDelete}
        onPreview={onPreviewListing}
        onDuplicate={onDuplicateListing}
        onSyncComplete={onSyncComplete}
      />
    </TableRow>
  );
};

export default OptimisticTableRow;
