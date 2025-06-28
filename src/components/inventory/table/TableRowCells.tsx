
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import ListingImagePreview from '@/components/ListingImagePreview';
import EditableTableCell from './EditableTableCell';
import type { Listing } from '@/types/Listing';

interface TableRowCellsProps {
  listing: Listing;
  photosToDisplay: string[] | null;
  isSelected: boolean;
  isEditing: boolean;
  editData: Partial<Listing>;
  visibleColumns: any;
  onSelectListing: (listingId: string, checked: boolean) => void;
  updateEditData: (field: keyof Listing, value: any) => void;
}

const TableRowCells = ({
  listing,
  photosToDisplay,
  isSelected,
  isEditing,
  editData,
  visibleColumns,
  onSelectListing,
  updateEditData
}: TableRowCellsProps) => {
  return (
    <>
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
    </>
  );
};

export default TableRowCells;
