
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Eye, Trash2 } from 'lucide-react';
import ListingImagePreview from '@/components/ListingImagePreview';
import ProfitIndicator from '@/components/listing-card/ProfitIndicator';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  condition: string | null;
  status: string | null;
  shipping_cost: number | null;
  photos: string[] | null;
  created_at: string;
  purchase_price?: number;
  net_profit?: number;
  profit_margin?: number;
  days_to_sell?: number;
}

interface ListingCardProps {
  listing: Listing;
  isBulkMode: boolean;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onPreview: () => void;
  onDelete: () => void;
}

const ListingCard = ({
  listing,
  isBulkMode,
  isSelected,
  onSelect,
  onEdit,
  onPreview,
  onDelete
}: ListingCardProps) => {
  const getDaysListedBadge = () => {
    if (!listing.days_to_sell && !listing.created_at) return null;
    
    const daysListed = listing.days_to_sell || 
      Math.floor((new Date().getTime() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysListed <= 7) {
      return <Badge variant="default" className="text-xs bg-green-100 text-green-800">New</Badge>;
    } else if (daysListed <= 30) {
      return <Badge variant="secondary" className="text-xs">{daysListed} days</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs text-orange-600">{daysListed} days</Badge>;
    }
  };

  return (
    <Card className="p-4 flex flex-col hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      {/* Header with checkbox and actions */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {isBulkMode && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
              {listing.title}
            </h3>
          </div>
        </div>
        {!isBulkMode && (
          <div className="flex space-x-1 flex-shrink-0 ml-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200" 
              onClick={onEdit}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 hover:bg-green-50 hover:border-green-200 transition-colors duration-200" 
              onClick={onPreview}
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon" 
              className="h-8 w-8 hover:bg-red-600 transition-colors duration-200" 
              onClick={onDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Image Preview with on-demand loading */}
      <div className="mb-3 flex justify-center">
        <ListingImagePreview 
          photos={listing.photos} 
          title={listing.title}
          listingId={listing.id}
          className="w-32 h-32"
        />
      </div>

      {/* Content */}
      <div className="space-y-3 flex-1">
        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">{listing.category || 'Uncategorized'}</Badge>
          <Badge variant="outline" className="text-xs">{listing.condition || 'N/A'}</Badge>
          {listing.status && (
            <Badge variant={listing.status === 'active' ? 'default' : 'secondary'} className="text-xs">
              {listing.status}
            </Badge>
          )}
          {getDaysListedBadge()}
        </div>

        {/* Profit Indicator */}
        <ProfitIndicator
          purchasePrice={listing.purchase_price}
          price={listing.price}
          netProfit={listing.net_profit}
          profitMargin={listing.profit_margin}
        />

        {/* Description */}
        <p className="text-xs text-gray-700 line-clamp-3">
          {listing.description?.substring(0, 80) || 'No description available'}...
        </p>

        {/* Price and Shipping */}
        <div className="space-y-1">
          <p className="text-sm font-bold text-green-600">${listing.price}</p>
          <p className="text-xs text-gray-500">
            Shipping: ${(listing.shipping_cost || 9.95).toFixed(2)}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ListingCard;
