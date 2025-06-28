
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import ListingImagePreview from '@/components/ListingImagePreview';
import EditableTableCell from './EditableTableCell';
import TableCellActions from './TableCellActions';
import { useOptimizedListingDetailsLoader } from '@/hooks/useOptimizedListingDetailsLoader';
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
  onDuplicateListing
}: OptimisticTableRowProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Listing>>({});

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

  const isEditing = editingId === listing.id;

  const handleEdit = () => {
    setEditingId(listing.id);
    setEditData({
      title: listing.title,
      price: listing.price,
      status: listing.status,
      category: listing.category,
      condition: listing.condition,
      shipping_cost: listing.shipping_cost
    });
  };

  const handleSave = async () => {
    if (onUpdateListing) {
      try {
        await onUpdateListing(listing.id, editData);
        setEditingId(null);
        setEditData({});
      } catch (error) {
        console.error('Failed to update listing:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const updateEditData = (field: keyof Listing, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptimisticDelete = async () => {
    try {
      await onDeleteListing(listing.id);
    } catch (error) {
      throw error;
    }
  };

  // Use loadedListing photos if available, otherwise fallback to listing photos
  const photosToDisplay = loadedListing?.photos || listing.photos;

  return (
    <TableRow 
      className={`${isUpdating ? 'opacity-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
    >
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectListing(listing.id, !!checked)}
        />
      </TableCell>
      
      {visibleColumns.image && (
        <TableCell>
          <ListingImagePreview 
            photos={photosToDisplay} 
            title={listing.title}
            listingId={listing.id}
            className="w-12 h-12"
          />
        </TableCell>
      )}
      
      {visibleColumns.title && (
        <EditableTableCell
          field="title"
          value={isEditing ? editData.title : listing.title}
          isEditing={isEditing}
          onUpdate={updateEditData}
          className="max-w-xs"
        />
      )}
      
      {visibleColumns.price && (
        <EditableTableCell
          field="price"
          value={isEditing ? editData.price : listing.price}
          isEditing={isEditing}
          onUpdate={updateEditData}
        />
      )}
      
      {visibleColumns.status && (
        <EditableTableCell
          field="status"
          value={isEditing ? editData.status : listing.status}
          isEditing={isEditing}
          onUpdate={updateEditData}
        />
      )}
      
      {visibleColumns.category && (
        <EditableTableCell
          field="category"
          value={isEditing ? editData.category : listing.category}
          isEditing={isEditing}
          onUpdate={updateEditData}
        />
      )}
      
      {visibleColumns.condition && (
        <EditableTableCell
          field="condition"
          value={isEditing ? editData.condition : listing.condition}
          isEditing={isEditing}
          onUpdate={updateEditData}
        />
      )}
      
      {visibleColumns.shipping && (
        <EditableTableCell
          field="shipping_cost"
          value={isEditing ? editData.shipping_cost : listing.shipping_cost}
          isEditing={isEditing}
          onUpdate={updateEditData}
        />
      )}
      
      <TableCellActions
        listing={listing}
        isEditing={isEditing}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleOptimisticDelete}
        onPreview={onPreviewListing}
        onDuplicate={onDuplicateListing}
      />
    </TableRow>
  );
};

export default OptimisticTableRow;
