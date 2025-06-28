import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import ListingsTableHeader from './listings/table/ListingsTableHeader';
import ListingsTableColumnManager from './listings/table/ListingsTableColumnManager';
import ListingsTableEmpty from './listings/table/ListingsTableEmpty';
import ListingsTableRow from './listings/ListingsTableRow';

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
  purchase_price?: number | null;
  purchase_date?: string | null;
  is_consignment?: boolean;
  net_profit?: number | null;
  profit_margin?: number | null;
  days_to_sell?: number | null;
}

interface ListingsTableProps {
  listings: Listing[];
  selectedListings: string[];
  onSelectListing: (listingId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateListing: (listingId: string, updates: Partial<Listing>) => void;
  onDeleteListing: (listingId: string) => void;
  onPreviewListing?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onDuplicateListing?: (listing: Listing) => Promise<Listing | null>;
}

const ListingsTable = ({
  listings,
  selectedListings,
  onSelectListing,
  onSelectAll,
  onUpdateListing,
  onDeleteListing,
  onPreviewListing,
  onEditListing,
  onDuplicateListing
}: ListingsTableProps) => {
  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    title: true,
    price: true,
    status: true,
    category: true,
    condition: false,
    shipping: false,
    description: false,
    // Financial columns - keep these available but hidden by default
    purchasePrice: false,
    netProfit: false,
    profitMargin: false,
    // Remove unnecessary columns
    measurements: false,
    keywords: false,
    purchaseDate: false,
    consignmentStatus: false,
    sourceType: false,
    sourceLocation: false,
    costBasis: false,
    daysToSell: false,
    performanceNotes: false,
  });

  const handleColumnToggle = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <ListingsTableColumnManager
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
      />

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            <ListingsTableHeader
              visibleColumns={visibleColumns}
              selectedCount={selectedListings.length}
              totalCount={listings.length}
              onSelectAll={onSelectAll}
            />
            <TableBody>
              {listings.map((listing, index) => (
                <ListingsTableRow
                  key={listing.id}
                  listing={listing}
                  index={index}
                  isSelected={selectedListings.includes(listing.id)}
                  visibleColumns={visibleColumns}
                  onSelectListing={onSelectListing}
                  onUpdateListing={onUpdateListing}
                  onDeleteListing={onDeleteListing}
                  onPreviewListing={onPreviewListing}
                  onEditListing={onEditListing}
                  onDuplicateListing={onDuplicateListing}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {listings.length === 0 && <ListingsTableEmpty />}
    </div>
  );
};

export default ListingsTable;
