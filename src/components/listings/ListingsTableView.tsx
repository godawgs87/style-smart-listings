
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import ColumnCustomizer from '@/components/ColumnCustomizer';
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
}

const ListingsTableView = ({
  listings,
  selectedListings,
  onSelectListing,
  onSelectAll,
  onUpdateListing,
  onDeleteListing,
  onPreviewListing,
  onEditListing
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
      {/* Column Customizer */}
      <div className="p-4 border-b bg-gray-50">
        <ColumnCustomizer
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-b-2">
                <TableHead className="w-12 sticky left-0 bg-gray-50 z-20 border-r">
                  <Checkbox
                    checked={selectedListings.length === listings.length && listings.length > 0}
                    onCheckedChange={onSelectAll}
                  />
                </TableHead>
                
                {/* Core columns */}
                {visibleColumns.image && (
                  <TableHead className="w-16 sticky left-12 bg-gray-50 z-20 border-r">Image</TableHead>
                )}
                {visibleColumns.title && (
                  <TableHead className="min-w-[250px] sticky left-28 bg-gray-50 z-20 border-r font-semibold">
                    Product Details
                  </TableHead>
                )}
                {visibleColumns.price && (
                  <TableHead className="w-[120px] font-semibold">Price</TableHead>
                )}
                {visibleColumns.status && (
                  <TableHead className="w-[100px] font-semibold">Status</TableHead>
                )}
                {visibleColumns.category && (
                  <TableHead className="w-[120px] font-semibold">Category</TableHead>
                )}
                {visibleColumns.condition && (
                  <TableHead className="w-[100px] font-semibold">Condition</TableHead>
                )}
                {visibleColumns.shipping && (
                  <TableHead className="w-[100px]">Shipping</TableHead>
                )}
                {visibleColumns.measurements && (
                  <TableHead className="w-[150px]">Measurements</TableHead>
                )}
                {visibleColumns.keywords && (
                  <TableHead className="w-[150px]">Keywords</TableHead>
                )}
                {visibleColumns.description && (
                  <TableHead className="w-[200px]">Description</TableHead>
                )}
                
                {/* New financial columns */}
                {visibleColumns.purchasePrice && (
                  <TableHead className="w-[120px] font-semibold">Purchase Price</TableHead>
                )}
                {visibleColumns.purchaseDate && (
                  <TableHead className="w-[120px]">Purchase Date</TableHead>
                )}
                {visibleColumns.consignmentStatus && (
                  <TableHead className="w-[120px]">Consignment</TableHead>
                )}
                {visibleColumns.sourceType && (
                  <TableHead className="w-[120px]">Source Type</TableHead>
                )}
                {visibleColumns.sourceLocation && (
                  <TableHead className="w-[150px]">Source Location</TableHead>
                )}
                {visibleColumns.costBasis && (
                  <TableHead className="w-[120px] font-semibold">Cost Basis</TableHead>
                )}
                {visibleColumns.netProfit && (
                  <TableHead className="w-[120px] font-semibold">Net Profit</TableHead>
                )}
                {visibleColumns.profitMargin && (
                  <TableHead className="w-[120px] font-semibold">Profit Margin</TableHead>
                )}
                {visibleColumns.daysToSell && (
                  <TableHead className="w-[120px]">Days to Sell</TableHead>
                )}
                {visibleColumns.performanceNotes && (
                  <TableHead className="w-[200px]">Performance Notes</TableHead>
                )}
                
                <TableHead className="w-[140px] sticky right-0 bg-gray-50 z-20 border-l font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
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
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {listings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg font-medium mb-2">No listings found</div>
          <div className="text-sm">Create your first listing to get started!</div>
        </div>
      )}
    </div>
  );
};

export default ListingsTableView;
