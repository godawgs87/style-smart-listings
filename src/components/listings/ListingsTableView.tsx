
import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import ListingsTableHeader from './table/ListingsTableHeader';
import ListingsTableColumnManager from './table/ListingsTableColumnManager';
import ListingsTableEmpty from './table/ListingsTableEmpty';
import ListingsTableRow from './ListingsTableRow';

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

interface ListingsTableViewProps {
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

const ListingsTableView = ({
  listings,
  selectedListings,
  onSelectListing,
  onSelectAll,
  onUpdateListing,
  onDeleteListing,
  onPreviewListing,
  onEditListing,
  onDuplicateListing
}: ListingsTableViewProps) => {
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    image: true,
    title: true,
    price: true,
    status: true,
    category: true,
    condition: true,
    shipping: true,
    measurements: false,
    keywords: false,
    description: false,
    purchasePrice: false,
    purchaseDate: false,
    consignmentStatus: false,
    sourceType: false,
    sourceLocation: false,
    costBasis: false,
    netProfit: false,
    profitMargin: false,
    daysToSell: false,
    performanceNotes: false,
  });

  const handleColumnToggle = (column: keyof VisibleColumns) => {
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

export default ListingsTableView;
