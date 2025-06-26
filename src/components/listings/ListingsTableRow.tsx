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
  // Enhanced fields
  purchase_price?: number | null;
  purchase_date?: string | null;
  is_consignment?: boolean;
  consignment_percentage?: number | null;
  consignor_name?: string | null;
  consignor_contact?: string | null;
  source_type?: string | null;
  source_location?: string | null;
  cost_basis?: number | null;
  fees_paid?: number | null;
  net_profit?: number | null;
  profit_margin?: number | null;
  listed_date?: string | null;
  sold_date?: string | null;
  sold_price?: number | null;
  days_to_sell?: number | null;
  performance_notes?: string | null;
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
  purchasePrice: boolean;
  purchaseDate: boolean;
  consignmentStatus: boolean;
  sourceType: boolean;
  sourceLocation: boolean;
  costBasis: boolean;
  netProfit: boolean;
  profitMargin: boolean;
  daysToSell: boolean;
  performanceNotes: boolean;
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

  // Helper function to format currency
  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '-';
    return `$${value.toFixed(2)}`;
  };

  // Helper function to format percentage
  const formatPercentage = (value: number | null | undefined) => {
    if (!value) return '-';
    return `${value.toFixed(1)}%`;
  };

  // Helper function to format date
  const formatDate = (value: string | null | undefined) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString();
  };

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
      
      {/* Core columns */}
      {visibleColumns.image && (
        <TableCell className="sticky left-12 bg-inherit z-10 border-r p-2">
          <ListingImagePreview 
            photos={listing.photos} 
            title={listing.title}
          />
        </TableCell>
      )}

      {visibleColumns.title && (
        <TableCell className="sticky left-28 bg-inherit z-10 border-r">
          {isEditing ? editComponents.title : displayComponents.title}
        </TableCell>
      )}

      {visibleColumns.price && (
        <TableCell>
          {isEditing ? editComponents.price : displayComponents.price}
        </TableCell>
      )}

      {visibleColumns.status && (
        <TableCell>
          {isEditing ? editComponents.status : displayComponents.status}
        </TableCell>
      )}

      {visibleColumns.category && (
        <TableCell>
          {isEditing ? editComponents.category : displayComponents.category}
        </TableCell>
      )}

      {visibleColumns.condition && (
        <TableCell>
          {isEditing ? editComponents.condition : displayComponents.condition}
        </TableCell>
      )}

      {visibleColumns.shipping && (
        <TableCell>
          {isEditing ? editComponents.shipping : displayComponents.shipping}
        </TableCell>
      )}

      {visibleColumns.measurements && (
        <TableCell>
          {isEditing ? editComponents.measurements : displayComponents.measurements}
        </TableCell>
      )}

      {visibleColumns.keywords && (
        <TableCell>
          {isEditing ? editComponents.keywords : displayComponents.keywords}
        </TableCell>
      )}

      {visibleColumns.description && (
        <TableCell>
          {isEditing ? editComponents.description : displayComponents.description}
        </TableCell>
      )}

      {/* New financial columns */}
      {visibleColumns.purchasePrice && (
        <TableCell>
          <div className="font-medium">
            {formatCurrency(listing.purchase_price)}
          </div>
        </TableCell>
      )}

      {visibleColumns.purchaseDate && (
        <TableCell>
          <div className="text-sm">
            {formatDate(listing.purchase_date)}
          </div>
        </TableCell>
      )}

      {visibleColumns.consignmentStatus && (
        <TableCell>
          <div className="text-sm">
            {listing.is_consignment ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Consignment ({listing.consignment_percentage}%)
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Owned
              </span>
            )}
          </div>
        </TableCell>
      )}

      {visibleColumns.sourceType && (
        <TableCell>
          <div className="text-sm capitalize">
            {listing.source_type?.replace('_', ' ') || '-'}
          </div>
        </TableCell>
      )}

      {visibleColumns.sourceLocation && (
        <TableCell>
          <div className="text-sm truncate max-w-[150px]" title={listing.source_location || ''}>
            {listing.source_location || '-'}
          </div>
        </TableCell>
      )}

      {visibleColumns.costBasis && (
        <TableCell>
          <div className="font-medium">
            {formatCurrency(listing.cost_basis)}
          </div>
        </TableCell>
      )}

      {visibleColumns.netProfit && (
        <TableCell>
          <div className={`font-medium ${
            listing.net_profit && listing.net_profit > 0 ? 'text-green-600' : 
            listing.net_profit && listing.net_profit < 0 ? 'text-red-600' : ''
          }`}>
            {formatCurrency(listing.net_profit)}
          </div>
        </TableCell>
      )}

      {visibleColumns.profitMargin && (
        <TableCell>
          <div className={`font-medium ${
            listing.profit_margin && listing.profit_margin > 0 ? 'text-green-600' : 
            listing.profit_margin && listing.profit_margin < 0 ? 'text-red-600' : ''
          }`}>
            {formatPercentage(listing.profit_margin)}
          </div>
        </TableCell>
      )}

      {visibleColumns.daysToSell && (
        <TableCell>
          <div className="text-sm">
            {listing.days_to_sell ? `${listing.days_to_sell} days` : '-'}
          </div>
        </TableCell>
      )}

      {visibleColumns.performanceNotes && (
        <TableCell>
          <div className="text-sm truncate max-w-[200px]" title={listing.performance_notes || ''}>
            {listing.performance_notes || '-'}
          </div>
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
