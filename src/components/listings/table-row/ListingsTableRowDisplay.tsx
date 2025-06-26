
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  purchase_price?: number;
  is_consignment?: boolean;
  consignment_percentage?: number;
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
  created_at: string;
  net_profit?: number;
  profit_margin?: number;
}

interface ListingsTableRowDisplayProps {
  listing: Listing;
}

const ListingsTableRowDisplay = ({ listing }: ListingsTableRowDisplayProps) => {
  const calculateEstimatedProfit = () => {
    if (listing.net_profit !== null && listing.net_profit !== undefined) {
      return listing.net_profit;
    }
    if (listing.price && listing.purchase_price) {
      return listing.price - listing.purchase_price;
    }
    return null;
  };

  const estimatedProfit = calculateEstimatedProfit();

  return {
    title: (
      <div className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight">
        {listing.title}
        {listing.is_consignment && (
          <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">
            Consignment
          </Badge>
        )}
      </div>
    ),
    price: (
      <div className="space-y-1">
        <div className="font-bold text-green-600 text-lg">${listing.price}</div>
        {listing.purchase_price && (
          <div className="text-xs text-gray-500">
            Cost: ${listing.purchase_price}
          </div>
        )}
      </div>
    ),
    profit: (
      <div className="space-y-1">
        {estimatedProfit !== null ? (
          <>
            <div className={`font-medium flex items-center ${estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              ${estimatedProfit.toFixed(2)}
            </div>
            {listing.profit_margin && (
              <div className={`text-xs ${listing.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {listing.profit_margin.toFixed(1)}% margin
              </div>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-400">No cost data</span>
        )}
      </div>
    ),
    status: (
      <Badge 
        variant={
          listing.status === 'active' ? 'default' : 
          listing.status === 'sold' ? 'secondary' : 
          listing.status === 'draft' ? 'outline' : 'secondary'
        }
        className={
          listing.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
          listing.status === 'sold' ? 'bg-blue-100 text-blue-800 border-blue-200' :
          listing.status === 'draft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
          ''
        }
      >
        {listing.status?.charAt(0).toUpperCase() + listing.status?.slice(1)}
      </Badge>
    ),
    category: (
      <Badge variant="secondary" className="text-xs">
        {listing.category || 'Uncategorized'}
      </Badge>
    ),
    condition: (
      <Badge variant="outline" className="text-xs">
        {listing.condition || 'N/A'}
      </Badge>
    ),
    shipping: (
      <div className="text-sm font-medium">${listing.shipping_cost || 9.95}</div>
    ),
    measurements: (
      <div className="text-xs text-gray-600">
        {listing.measurements?.length && listing.measurements?.width && listing.measurements?.height
          ? `${listing.measurements.length}" x ${listing.measurements.width}" x ${listing.measurements.height}"`
          : 'Not set'
        }
      </div>
    ),
    keywords: (
      <div className="flex flex-wrap gap-1">
        {listing.keywords?.slice(0, 2).map((keyword, idx) => (
          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
            {keyword}
          </span>
        ))}
        {(listing.keywords?.length || 0) > 2 && (
          <span className="text-xs text-gray-400">+{(listing.keywords?.length || 0) - 2}</span>
        )}
      </div>
    ),
    description: (
      <div className="text-xs text-gray-600 line-clamp-3">
        {listing.description && listing.description.length > 0 
          ? listing.description.substring(0, 100) + '...'
          : 'No description'
        }
      </div>
    )
  };
};

export default ListingsTableRowDisplay;
