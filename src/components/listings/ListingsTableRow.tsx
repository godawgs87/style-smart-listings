
import React, { useState } from 'react';
import { TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell } from '@/components/ui/table';
import ListingsTableRowDisplay from './table-row/ListingsTableRowDisplay';
import ListingsTableRowEdit from './table-row/ListingsTableRowEdit';
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
  onDuplicateListing?: (listing: Listing) => Promise<Listing | null>;
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
  onEditListing,
  onDuplicateListing
}: ListingsTableRowProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updates: Partial<Listing>) => {
    onUpdateListing(listing.id, updates);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      onDeleteListing(listing.id);
    }
  };

  return (
    <TableRow className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
      <TableCell className="sticky left-0 bg-inherit z-10 border-r">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectListing(listing.id, checked as boolean)}
        />
      </TableCell>

      {isEditing ? (
        <ListingsTableRowEdit
          listing={listing}
          visibleColumns={visibleColumns}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <ListingsTableRowDisplay
            listing={listing}
            index={index}
            visibleColumns={visibleColumns}
          />
          <ListingsTableRowActions
            listing={listing}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            onPreview={onPreviewListing}
            onEditListing={onEditListing}
            onDuplicate={onDuplicateListing}
          />
        </>
      )}
    </TableRow>
  );
};

export default ListingsTableRow;
