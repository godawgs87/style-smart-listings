import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ListingImagePreview from '@/components/ListingImagePreview';

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
  const getStatusBadge = (status: string | null) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      sold: 'bg-blue-100 text-blue-800',
      archived: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.draft}>
        {status || 'draft'}
      </Badge>
    );
  };

  const getConditionBadge = (condition: string | null) => {
    const conditionColors = {
      'New': 'bg-green-100 text-green-800',
      'Like New': 'bg-blue-100 text-blue-800',
      'Used': 'bg-yellow-100 text-yellow-800',
      'Fair': 'bg-orange-100 text-orange-800',
      'Poor': 'bg-red-100 text-red-800',
      'For Parts': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={conditionColors[condition as keyof typeof conditionColors] || 'bg-gray-100 text-gray-800'}>
        {condition || 'Unknown'}
      </Badge>
    );
  };

  return (
    <>
      {visibleColumns.image && (
        <TableCell className="sticky left-12 bg-white z-10 border-r">
          <ListingImagePreview 
            photos={listing.photos} 
            title={listing.title}
            listingId={listing.id}
            className="w-12 h-12"
          />
        </TableCell>
      )}

      {visibleColumns.title && (
        <TableCell className="sticky left-28 bg-white z-10 border-r min-w-[250px]">
          <div>
            <div className="font-medium text-sm line-clamp-2">{listing.title}</div>
            {listing.description && (
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {listing.description.length > 100 
                  ? `${listing.description.substring(0, 100)}...` 
                  : listing.description}
              </div>
            )}
          </div>
        </TableCell>
      )}

      {visibleColumns.price && (
        <TableCell className="text-right font-medium">
          ${listing.price?.toFixed(2) || '0.00'}
        </TableCell>
      )}

      {visibleColumns.status && (
        <TableCell>{getStatusBadge(listing.status)}</TableCell>
      )}

      {visibleColumns.category && (
        <TableCell className="text-sm">{listing.category || '-'}</TableCell>
      )}

      {visibleColumns.condition && (
        <TableCell>{getConditionBadge(listing.condition)}</TableCell>
      )}

      {visibleColumns.shipping && (
        <TableCell className="text-right">
          ${listing.shipping_cost?.toFixed(2) || '0.00'}
        </TableCell>
      )}

      {visibleColumns.measurements && (
        <TableCell className="text-sm">
          {listing.measurements ? (
            <div className="space-y-1">
              {listing.measurements.length && <div>L: {listing.measurements.length}</div>}
              {listing.measurements.width && <div>W: {listing.measurements.width}</div>}
              {listing.measurements.height && <div>H: {listing.measurements.height}</div>}
              {listing.measurements.weight && <div>Wt: {listing.measurements.weight}</div>}
            </div>
          ) : '-'}
        </TableCell>
      )}

      {visibleColumns.keywords && (
        <TableCell>
          {listing.keywords && listing.keywords.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {listing.keywords.slice(0, 3).map((keyword, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {listing.keywords.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{listing.keywords.length - 3}
                </Badge>
              )}
            </div>
          ) : '-'}
        </TableCell>
      )}

      {visibleColumns.description && (
        <TableCell className="max-w-[200px]">
          <div className="text-sm text-gray-600 line-clamp-3">
            {listing.description || '-'}
          </div>
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
        <TableCell>
          {listing.is_consignment ? (
            <div className="text-sm">
              <Badge className="bg-purple-100 text-purple-800">Consignment</Badge>
              {listing.consignment_percentage && (
                <div className="text-xs text-gray-500 mt-1">
                  {listing.consignment_percentage}%
                </div>
              )}
            </div>
          ) : (
            <Badge className="bg-blue-100 text-blue-800">Owned</Badge>
          )}
        </TableCell>
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
        <TableCell className="text-right font-medium">
          {listing.net_profit !== null && listing.net_profit !== undefined ? (
            <span className={listing.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
              ${listing.net_profit.toFixed(2)}
            </span>
          ) : '-'}
        </TableCell>
      )}

      {visibleColumns.profitMargin && (
        <TableCell className="text-right font-medium">
          {listing.profit_margin !== null && listing.profit_margin !== undefined ? (
            <span className={listing.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}>
              {listing.profit_margin.toFixed(1)}%
            </span>
          ) : '-'}
        </TableCell>
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
