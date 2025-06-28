import React, { useState, useEffect } from 'react';
import { TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Loader2 } from 'lucide-react';
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

interface ListingsTableRowEditProps {
  listing: Listing;
  visibleColumns: VisibleColumns;
  onSave: (updates: Partial<Listing>) => void;
  onCancel: () => void;
}

const ListingsTableRowEdit = ({ listing, visibleColumns, onSave, onCancel }: ListingsTableRowEditProps) => {
  const { loadDetails, isLoadingDetails } = useListingDetails();
  const [detailedListing, setDetailedListing] = useState<any>(listing);
  const [editData, setEditData] = useState({
    title: listing.title,
    price: listing.price,
    category: listing.category || '',
    condition: listing.condition || '',
    status: listing.status || 'draft',
    shipping_cost: listing.shipping_cost !== null ? listing.shipping_cost : 9.95,
    purchase_price: listing.purchase_price || 0,
    source_type: listing.source_type || '',
    source_location: listing.source_location || '',
    measurements: listing.measurements || { length: '', width: '', height: '', weight: '' }
  });
  const [isSaving, setIsSaving] = useState(false);

  console.log('✏️ Edit row - listing shipping_cost:', listing.shipping_cost);
  console.log('✏️ Edit row - editData shipping_cost:', editData.shipping_cost);

  useEffect(() => {
    const loadListingDetails = async () => {
      console.log('Loading details for edit row:', listing.id);
      const details = await loadDetails(listing.id);
      if (details) {
        console.log('Loaded details:', details);
        const mergedListing = { ...listing, ...details };
        setDetailedListing(mergedListing);
        
        // Update edit data with loaded details
        setEditData(prev => ({
          ...prev,
          shipping_cost: details.shipping_cost !== null ? details.shipping_cost : 9.95,
          measurements: details.measurements || { length: '', width: '', height: '', weight: '' }
        }));
      }
    };

    loadListingDetails();
  }, [listing.id, loadDetails]);

  const handleMeasurementChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      measurements: { ...prev.measurements, [field]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = { ...editData };
      // Ensure measurements is properly structured
      if (editData.measurements) {
        updates.measurements = editData.measurements;
      }
      console.log('✏️ Saving updates:', updates);
      await onSave(updates);
    } finally {
      setIsSaving(false);
    }
  };

  const isLoadingData = isLoadingDetails(listing.id);

  return (
    <>
      {visibleColumns.image && (
        <TableCell className="sticky left-12 bg-white z-10 border-r">
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
            {detailedListing.photos && detailedListing.photos.length > 0 ? (
              <img 
                src={detailedListing.photos[0]} 
                alt={detailedListing.title}
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

      {visibleColumns.measurements && (
        <TableCell>
          {isLoadingData ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            <div className="space-y-1 min-w-[120px]">
              <Input
                placeholder="Length"
                value={editData.measurements.length || ''}
                onChange={(e) => handleMeasurementChange('length', e.target.value)}
                className="text-xs h-6"
              />
              <Input
                placeholder="Width" 
                value={editData.measurements.width || ''}
                onChange={(e) => handleMeasurementChange('width', e.target.value)}
                className="text-xs h-6"
              />
              <Input
                placeholder="Height"
                value={editData.measurements.height || ''}
                onChange={(e) => handleMeasurementChange('height', e.target.value)}
                className="text-xs h-6"
              />
              <Input
                placeholder="Weight"
                value={editData.measurements.weight || ''}
                onChange={(e) => handleMeasurementChange('weight', e.target.value)}
                className="text-xs h-6"
              />
            </div>
          )}
        </TableCell>
      )}

      {visibleColumns.keywords && (
        <TableCell>
          <div className="text-sm text-gray-600">
            {detailedListing.keywords?.join(', ') || '-'}
          </div>
        </TableCell>
      )}

      {visibleColumns.description && (
        <TableCell>
          <div className="text-sm text-gray-600 max-w-[200px] truncate">
            {detailedListing.description || '-'}
          </div>
        </TableCell>
      )}

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
          <Button 
            size="sm" 
            onClick={handleSave} 
            className="bg-green-600 hover:bg-green-700" 
            disabled={isSaving || isLoadingData}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </>
  );
};

export default ListingsTableRowEdit;
