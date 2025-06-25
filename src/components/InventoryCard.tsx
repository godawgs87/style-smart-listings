
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Eye, Trash2, Calendar } from 'lucide-react';
import InventoryCardDialogs from './inventory/InventoryCardDialogs';

interface Item {
  id: string;
  title: string;
  description: string | null;
  price: number;
  purchase_price?: number;
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

  const profit = item.sold_price ? (item.sold_price - (item.purchase_price || item.price)) : null;

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
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
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
              {item.title}
            </h3>
          </div>
          {!isBulkMode && (
            <div className="flex space-x-1 flex-shrink-0 ml-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setShowEditor(true)}
                title="Edit item"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setShowPreview(true)}
                title="Preview item"
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="h-8 w-8" 
                onClick={onDelete}
                title="Delete item"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
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
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-gray-700 line-clamp-2">
              {item.description.substring(0, 80)}...
            </p>
          )}

          {/* Financial info */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Sale Price</span>
              <span className="text-sm font-bold text-green-600">${item.price}</span>
            </div>
            
            {item.purchase_price && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Cost</span>
                <span className="text-sm text-gray-700">${item.purchase_price}</span>
              </div>
            )}
            
            {profit !== null && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Profit</span>
                <span className={`text-sm font-medium ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${profit.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Added {new Date(item.created_at).toLocaleDateString()}</span>
            </div>
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
