
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign } from 'lucide-react';
import InventoryCardDialogs from './inventory/InventoryCardDialogs';
import InventoryCardHeader from './inventory/InventoryCardHeader';
import InventoryCardFinancials from './inventory/InventoryCardFinancials';

interface Item {
  id: string;
  title: string;
  description: string | null;
  price: number;
  purchase_price?: number;
  purchase_date?: string;
  is_consignment?: boolean;
  consignment_percentage?: number;
  consignor_name?: string;
  category: string | null;
  condition: string | null;
  measurements: {
    length?: string;
    width?: string;
    height?: string;
    weight?: string;
  };
  keywords: string[] | null;
  photos: string[] | null;
  price_research: string | null;
  shipping_cost: number | null;
  status: string | null;
  created_at: string;
  sold_price?: number;
  net_profit?: number;
  profit_margin?: number;
}

interface InventoryCardProps {
  item: Item;
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
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const handleSaveEdit = (updatedListing: any) => {
    setShowEditor(false);
    console.log('Updated listing:', updatedListing);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'sold':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const calculateProfit = () => {
    if (item.sold_price && item.purchase_price) {
      return item.sold_price - item.purchase_price;
    } else if (item.price && item.purchase_price) {
      return item.price - item.purchase_price;
    }
    return item.net_profit || null;
  };

  const profit = calculateProfit();

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <InventoryCardHeader
          title={item.title}
          isBulkMode={isBulkMode}
          isSelected={isSelected}
          onSelect={onSelect}
          onEdit={() => setShowEditor(true)}
          onPreview={() => setShowPreview(true)}
          onDelete={onDelete}
        />

        <div className="space-y-3 flex-1">
          {/* Main photo */}
          {item.photos && item.photos.length > 0 && (
            <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={item.photos[0]} 
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-1">
            {item.category && (
              <Badge variant="secondary" className="text-xs">{item.category}</Badge>
            )}
            {item.condition && (
              <Badge variant="outline" className="text-xs">{item.condition}</Badge>
            )}
            {item.status && (
              <Badge variant={getStatusColor(item.status)} className="text-xs">
                {item.status}
              </Badge>
            )}
            {item.is_consignment && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                Consignment
              </Badge>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-gray-700 line-clamp-2">
              {item.description.substring(0, 80)}...
            </p>
          )}

          <InventoryCardFinancials
            price={item.price}
            purchasePrice={item.purchase_price}
            isConsignment={item.is_consignment}
            profit={profit}
            profitMargin={item.profit_margin}
            consignmentPercentage={item.consignment_percentage}
            status={item.status || undefined}
          />

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Added {new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            {item.purchase_date && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span>Bought {new Date(item.purchase_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <InventoryCardDialogs
        item={item}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        showEditor={showEditor}
        setShowEditor={setShowEditor}
        onSaveEdit={handleSaveEdit}
      />
    </>
  );
};

export default InventoryCard;
