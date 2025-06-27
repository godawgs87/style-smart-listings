
import React, { useEffect, useState } from 'react';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import ImageCell from './cells/ImageCell';
import TitleCell from './cells/TitleCell';
import BadgeCell from './cells/BadgeCell';
import MeasurementsCell from './cells/MeasurementsCell';
import KeywordsCell from './cells/KeywordsCell';
import ConsignmentStatusCell from './cells/ConsignmentStatusCell';
import ProfitCell from './cells/ProfitCell';
import { useListingDetails } from '@/hooks/useListingDetails';

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

interface ListingsTableRowDisplayProps {
  listing: Listing;
  index: number;
  visibleColumns: VisibleColumns;
}

const ListingsTableRowDisplay = ({ listing, index, visibleColumns }: ListingsTableRowDisplayProps) => {
  const { loadDetails, isLoadingDetails } = useListingDetails();
  const [detailedListing, setDetailedListing] = useState<any>(listing);

  useEffect(() => {
    const loadListingDetails = async () => {
      // Load details if we need photos, measurements, keywords, or other detailed fields
      const needsDetails = visibleColumns.image || visibleColumns.measurements || visibleColumns.keywords || visibleColumns.description;
      
      if (needsDetails) {
        console.log('🔍 ListingsTableRowDisplay - Loading details for:', listing.id);
        
        const details = await loadDetails(listing.id);
        console.log('🔍 Loaded details response:', details);
        
        if (details) {
          const mergedListing = { ...listing, ...details };
          console.log('🔍 Merged listing data:', mergedListing);
          console.log('🔍 Photos in merged data:', mergedListing.photos);
          
          setDetailedListing(mergedListing);
        } else {
          console.log('❌ No details returned for listing:', listing.id);
        }
      }
    };

    loadListingDetails();
  }, [listing.id, loadDetails, visibleColumns.image, visibleColumns.measurements, visibleColumns.keywords, visibleColumns.description]);

  const isLoading = isLoadingDetails(listing.id);

  console.log('🎯 ListingsTableRowDisplay render - listing:', listing.id);
  console.log('🎯 Current detailedListing photos:', detailedListing.photos);

  return (
    <>
      {visibleColumns.image && (
        <ImageCell 
          photos={detailedListing.photos || listing.photos}
          title={listing.title}
          listingId={listing.id}
        />
      )}

      {visibleColumns.title && (
        <TitleCell 
          title={listing.title}
          description={detailedListing.description || listing.description}
        />
      )}

      {visibleColumns.price && (
        <TableCell className="text-right font-medium">
          ${listing.price?.toFixed(2) || '0.00'}
        </TableCell>
      )}

      {visibleColumns.status && (
        <BadgeCell value={listing.status} type="status" />
      )}

      {visibleColumns.category && (
        <TableCell className="text-sm">{listing.category || '-'}</TableCell>
      )}

      {visibleColumns.condition && (
        <BadgeCell value={listing.condition} type="condition" />
      )}

      {visibleColumns.shipping && (
        <TableCell className="text-right">
          ${listing.shipping_cost?.toFixed(2) || '0.00'}
        </TableCell>
      )}

      {visibleColumns.measurements && (
        <TableCell className="text-sm">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            <MeasurementsCell measurements={detailedListing.measurements || listing.measurements} />
          )}
        </TableCell>
      )}

      {visibleColumns.keywords && (
        <TableCell className="text-sm">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            <KeywordsCell keywords={detailedListing.keywords || listing.keywords} />
          )}
        </TableCell>
      )}

      {visibleColumns.description && (
        <TableCell className="max-w-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            <div className="text-sm text-gray-600 line-clamp-3">
              {detailedListing.description || listing.description || '-'}
            </div>
          )}
        </TableCell>
      )}

      {visibleColumns.purchasePrice && (
        <TableCell className="text-right font-medium">
          {listing.purchase_price ? `$${listing.purchase_price.toFixed(2)}` : '-'}
        </TableCell>
      )}

      {visibleColumns.purchaseDate && (
        <TableCell className="text-sm">
          {listing.purchase_date || '-'}
        </TableCell>
      )}

      {visibleColumns.consignmentStatus && (
        <ConsignmentStatusCell 
          isConsignment={listing.is_consignment}
          consignmentPercentage={listing.consignment_percentage}
        />
      )}

      {visibleColumns.sourceType && (
        <TableCell className="text-sm">
          {listing.source_type ? (
            <Badge variant="outline">{listing.source_type.replace('_', ' ')}</Badge>
          ) : '-'}
        </TableCell>
      )}

      {visibleColumns.sourceLocation && (
        <TableCell className="text-sm max-w-[150px] truncate">
          {listing.source_location || '-'}
        </TableCell>
      )}

      {visibleColumns.costBasis && (
        <TableCell className="text-right font-medium">
          {listing.cost_basis ? `$${listing.cost_basis.toFixed(2)}` : '-'}
        </TableCell>
      )}

      {visibleColumns.netProfit && (
        <ProfitCell value={listing.net_profit} />
      )}

      {visibleColumns.profitMargin && (
        <ProfitCell value={listing.profit_margin} isPercentage />
      )}

      {visibleColumns.daysToSell && (
        <TableCell className="text-center">
          {listing.days_to_sell || '-'}
        </TableCell>
      )}

      {visibleColumns.performanceNotes && (
        <TableCell className="max-w-[200px]">
          <div className="text-sm text-gray-600 line-clamp-2">
            {listing.performance_notes || '-'}
          </div>
        </TableCell>
      )}
    </>
  );
};

export default ListingsTableRowDisplay;
