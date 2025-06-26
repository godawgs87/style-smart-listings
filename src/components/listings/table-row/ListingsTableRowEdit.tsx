
import React, { useState } from 'react';
import { TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X } from 'lucide-react';

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

interface ListingsTableRowEditProps {
  listing: Listing;
  visibleColumns: VisibleColumns;
  onSave: (updates: Partial<Listing>) => void;
  onCancel: () => void;
}

const ListingsTableRowEdit = ({ listing, visibleColumns, onSave, onCancel }: ListingsTableRowEditProps) => {
  const [editData, setEditData] = useState({
    title: listing.title,
    price: listing.price,
    category: listing.category || '',
    condition: listing.condition || '',
    status: listing.status || 'draft',
    shipping_cost: listing.shipping_cost || 0,
    purchase_price: listing.purchase_price || 0,
    source_type: listing.source_type || '',
    source_location: listing.source_location || ''
  });

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <>
      {visibleColumns.image && (
        <TableCell className="sticky left-12 bg-white z-10 border-r">
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
            {listing.photos && listing.photos.length > 0 ? (
              <img 
                src={listing.photos[0]} 
                alt={listing.title}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <span className="text-xs text-gray-400">No image</span>
            )}
          </div>
        </TableCell>
      )}

      {visibleColumns.title && (
        <TableCell className="sticky left-28 bg-white z-10 border-r min-w-[250px]">
          <Input
            value={editData.title}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full"
          />
        </TableCell>
      )}

      {visibleColumns.price && (
        <TableCell>
          <Input
            type="number"
            step="0.01"
            value={editData.price}
            onChange={(e) => setEditData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            className="w-24"
          />
        </TableCell>
      )}

      {visibleColumns.status && (
        <TableCell>
          <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
      )}

      {visibleColumns.category && (
        <TableCell>
          <Input
            value={editData.category}
            onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
            className="w-32"
            placeholder="Category"
          />
        </TableCell>
      )}

      {visibleColumns.condition && (
        <TableCell>
          <Select value={editData.condition} onValueChange={(value) => setEditData(prev => ({ ...prev, condition: value }))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Like New">Like New</SelectItem>
              <SelectItem value="Used">Used</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Poor">Poor</SelectItem>
              <SelectItem value="For Parts">For Parts</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
      )}

      {visibleColumns.shipping && (
        <TableCell>
          <Input
            type="number"
            step="0.01"
            value={editData.shipping_cost}
            onChange={(e) => setEditData(prev => ({ ...prev, shipping_cost: parseFloat(e.target.value) || 0 }))}
            className="w-24"
          />
        </TableCell>
      )}

      {/* Skip non-editable columns for brevity */}
      {visibleColumns.measurements && <TableCell>-</TableCell>}
      {visibleColumns.keywords && <TableCell>-</TableCell>}
      {visibleColumns.description && <TableCell>-</TableCell>}

      {visibleColumns.purchasePrice && (
        <TableCell>
          <Input
            type="number"
            step="0.01"
            value={editData.purchase_price}
            onChange={(e) => setEditData(prev => ({ ...prev, purchase_price: parseFloat(e.target.value) || 0 }))}
            className="w-24"
          />
        </TableCell>
      )}

      {/* Skip other non-critical edit fields for now */}
      {visibleColumns.purchaseDate && <TableCell>-</TableCell>}
      {visibleColumns.consignmentStatus && <TableCell>-</TableCell>}

      {visibleColumns.sourceType && (
        <TableCell>
          <Select value={editData.source_type} onValueChange={(value) => setEditData(prev => ({ ...prev, source_type: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="estate_sale">Estate Sale</SelectItem>
              <SelectItem value="garage_sale">Garage Sale</SelectItem>
              <SelectItem value="thrift_store">Thrift Store</SelectItem>
              <SelectItem value="auction">Auction</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
      )}

      {visibleColumns.sourceLocation && (
        <TableCell>
          <Input
            value={editData.source_location}
            onChange={(e) => setEditData(prev => ({ ...prev, source_location: e.target.value }))}
            className="w-32"
            placeholder="Location"
          />
        </TableCell>
      )}

      {/* Skip calculated fields */}
      {visibleColumns.costBasis && <TableCell>-</TableCell>}
      {visibleColumns.netProfit && <TableCell>-</TableCell>}
      {visibleColumns.profitMargin && <TableCell>-</TableCell>}
      {visibleColumns.daysToSell && <TableCell>-</TableCell>}
      {visibleColumns.performanceNotes && <TableCell>-</TableCell>}

      <TableCell className="sticky right-0 bg-white z-10 border-l">
        <div className="flex space-x-1">
          <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Check className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </>
  );
};

export default ListingsTableRowEdit;
