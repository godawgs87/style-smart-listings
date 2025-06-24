
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Eye, Trash2, DollarSign, Calendar, MapPin } from 'lucide-react';

interface InventoryItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  purchase_price?: number;
  purchase_date?: string;
  source_location?: string;
  category: string | null;
  condition: string | null;
  status: string | null;
  sold_price?: number;
  sold_date?: string;
  days_to_sell?: number;
  net_profit?: number;
  photos: string[];
  created_at: string;
}

interface InventoryCardProps {
  item: InventoryItem;
  isBulkMode: boolean;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onPreview: () => void;
  onDelete: () => void;
}

const InventoryCard = ({
  item,
  isBulkMode,
  isSelected,
  onSelect,
  onEdit,
  onPreview,
  onDelete
}: InventoryCardProps) => {
  const calculateProfit = () => {
    if (item.sold_price && item.purchase_price) {
      return item.sold_price - item.purchase_price;
    }
    if (item.purchase_price) {
      return item.price - item.purchase_price;
    }
    return null;
  };

  const profit = item.net_profit || calculateProfit();
  const profitMargin = profit && item.purchase_price ? ((profit / item.purchase_price) * 100) : null;
  const daysListed = item.created_at ? Math.floor((new Date().getTime() - new Date(item.created_at).getTime()) / (1000 * 3600 * 24)) : 0;

  return (
    <Card className="p-4 flex flex-col h-full">
      {/* Header */}
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
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">
              {item.title}
            </h3>
            {item.photos && item.photos.length > 0 && (
              <img 
                src={item.photos[0]} 
                alt={item.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
            )}
          </div>
        </div>
        {!isBulkMode && (
          <div className="flex space-x-1 flex-shrink-0 ml-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPreview}>
              <Eye className="w-3 h-3" />
            </Button>
            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 mb-3">
        {item.category && <Badge variant="secondary" className="text-xs">{item.category}</Badge>}
        {item.condition && <Badge variant="outline" className="text-xs">{item.condition}</Badge>}
        {item.status && (
          <Badge variant={item.status === 'active' ? 'default' : item.status === 'sold' ? 'default' : 'secondary'} className={`text-xs ${item.status === 'sold' ? 'bg-green-600 text-white' : ''}`}>
            {item.status}
          </Badge>
        )}
      </div>

      {/* Financial Info */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Listed Price</span>
          <span className="text-sm font-bold text-green-600">${item.price}</span>
        </div>
        
        {item.purchase_price && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Cost Basis</span>
            <span className="text-sm font-medium">${item.purchase_price}</span>
          </div>
        )}

        {profit && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Profit</span>
            <span className={`text-sm font-bold ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${profit.toFixed(2)}
              {profitMargin && ` (${profitMargin.toFixed(1)}%)`}
            </span>
          </div>
        )}

        {item.sold_price && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Sold For</span>
            <span className="text-sm font-bold text-blue-600">${item.sold_price}</span>
          </div>
        )}
      </div>

      {/* Source & Timing Info */}
      <div className="space-y-1 text-xs text-gray-500 mt-auto">
        {item.source_location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{item.source_location}</span>
          </div>
        )}
        
        {item.purchase_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Purchased: {new Date(item.purchase_date).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span>Listed: {daysListed} days ago</span>
          {item.days_to_sell && (
            <span>Sold in: {item.days_to_sell} days</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default InventoryCard;
