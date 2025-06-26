
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import ListingImagePreview from '@/components/ListingImagePreview';
import ListingsTableRowEdit from './table-row/ListingsTableRowEdit';
import ListingsTableRowDisplay from './table-row/ListingsTableRowDisplay';
import ListingsTableRowActions from './table-row/ListingsTableRowActions';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  condition: string | null;
  status: string | null;
  shipping_cost: number | null;
  measurements: {
    length?: string;
    width?: string;
    height?: string;
    weight?: string;
  } | null;
  keywords: string[] | null;
  photos: string[] | null;
  price_research: string | null;
  created_at: string;
}

interface VisibleColumns {
  image: boolean;
  title: boolean;
  price: boolean;
  status: boolean;
  category: boolean;
  condition: boolean;
  shipping: boolean;
  measurements: boolean;
  keywords: boolean;
  description: boolean;
}

interface ListingsTableRowProps {
  listing: Listing;
  index: number;
  isSelected: boolean;
  visibleColumns: VisibleColumns;
  onSelectListing: (listingId: string, checked: boolean) => void;
  onUpdateListing: (listingId: string, updates: Partial<Listing>) => void;
  onDeleteListing: (listingId: string) => void;
  onPreviewListing?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
}

const ListingsTableRow = ({
  listing,
  index,
  isSelected,
  visibleColumns,
  onSelectListing,
  onUpdateListing,
  onDeleteListing,
  onPreviewListing,
  onEditListing
}: ListingsTableRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Listing>>({});

  const startEditing = () => {
    setEditData({ ...listing });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
  };

  const saveEditing = () => {
    onUpdateListing(listing.id, editData);
    setIsEditing(false);
    setEditData({});
  };

  const updateEditData = (field: keyof Listing, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateMeasurements = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value
      }
    }));
  };

  const updateKeywords = (keywords: string) => {
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setEditData(prev => ({
      ...prev,
      keywords: keywordArray
    }));
  };

  const handlePreview = () => {
    if (onPreviewListing) {
      onPreviewListing(listing);
    } else {
      console.log('Preview listing:', listing.id);
    }
  };

  const handleEdit = () => {
    if (onEditListing) {
      onEditListing(listing);
    } else {
      startEditing();
    }
  };

  const editComponents = ListingsTableRowEdit({
    editData,
    updateEditData,
    updateMeasurements,
    updateKeywords
  });

  const displayComponents = ListingsTableRowDisplay({ listing });

  return (
    <TableRow 
      className={`
        ${isSelected ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
        hover:bg-blue-100/50 transition-colors
      `}
    >
      {/* Checkbox */}
      <TableCell className="sticky left-0 bg-inherit z-10 border-r">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectListing(listing.id, checked as boolean)}
        />
      </TableCell>
      
      {/* Image Preview */}
      {visibleColumns.image && (
        <TableCell className="sticky left-12 bg-inherit z-10 border-r p-2">
          <ListingImagePreview 
            photos={listing.photos} 
            title={listing.title}
          />
        </TableCell>
      )}

      {/* Product Details */}
      {visibleColumns.title && (
        <TableCell className="sticky left-28 bg-inherit z-10 border-r">
          {isEditing ? editComponents.title : displayComponents.title}
        </TableCell>
      )}

      {/* Price */}
      {visibleColumns.price && (
        <TableCell>
          {isEditing ? editComponents.price : displayComponents.price}
        </TableCell>
      )}

      {/* Status */}
      {visibleColumns.status && (
        <TableCell>
          {isEditing ? editComponents.status : displayComponents.status}
        </TableCell>
      )}

      {/* Category */}
      {visibleColumns.category && (
        <TableCell>
          {isEditing ? editComponents.category : displayComponents.category}
        </TableCell>
      )}

      {/* Condition */}
      {visibleColumns.condition && (
        <TableCell>
          {isEditing ? editComponents.condition : displayComponents.condition}
        </TableCell>
      )}

      {/* Shipping */}
      {visibleColumns.shipping && (
        <TableCell>
          {isEditing ? editComponents.shipping : displayComponents.shipping}
        </TableCell>
      )}

      {/* Measurements */}
      {visibleColumns.measurements && (
        <TableCell>
          {isEditing ? editComponents.measurements : displayComponents.measurements}
        </TableCell>
      )}

      {/* Keywords */}
      {visibleColumns.keywords && (
        <TableCell>
          {isEditing ? editComponents.keywords : displayComponents.keywords}
        </TableCell>
      )}

      {/* Description */}
      {visibleColumns.description && (
        <TableCell>
          {isEditing ? editComponents.description : displayComponents.description}
        </TableCell>
      )}

      {/* Actions */}
      <TableCell className="sticky right-0 bg-inherit z-10 border-l">
        <ListingsTableRowActions
          listing={listing}
          isEditing={isEditing}
          onSave={saveEditing}
          onCancel={cancelEditing}
          onEdit={handleEdit}
          onPreview={handlePreview}
          onDelete={onDeleteListing}
        />
      </TableCell>
    </TableRow>
  );
};

export default ListingsTableRow;
