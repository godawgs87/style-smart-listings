import React, { useState, useEffect } from 'react';
import { TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListingDetails } from '@/hooks/useListingDetails';
import EditableFields from './edit/EditableFields';
import EditableMeasurements from './edit/EditableMeasurements';
import EditActionButtons from './edit/EditActionButtons';
import type { Listing } from '@/types/Listing';

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
  clothing_size?: string | null;
  shoe_size?: string | null;
  gender?: 'Men' | 'Women' | 'Kids' | 'Unisex' | null;
  age_group?: 'Adult' | 'Youth' | 'Toddler' | 'Baby' | null;
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
    shipping_cost: listing.shipping_cost !== null ? listing.shipping_cost : 0,
    purchase_price: listing.purchase_price || 0,
    purchase_date: listing.purchase_date || '',
    source_type: listing.source_type || '',
    source_location: listing.source_location || '',
    consignor_name: listing.consignor_name || '',
    consignor_contact: listing.consignor_contact || '',
    consignment_percentage: listing.consignment_percentage || 0,
    clothing_size: listing.clothing_size || '',
    shoe_size: listing.shoe_size || '',
    gender: listing.gender || '' as '' | 'Men' | 'Women' | 'Kids' | 'Unisex',
    age_group: listing.age_group || '' as '' | 'Adult' | 'Youth' | 'Toddler' | 'Baby',
    performance_notes: listing.performance_notes || '',
    measurements: listing.measurements || { length: '', width: '', height: '', weight: '' }
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadListingDetails = async () => {
      const details = await loadDetails(listing.id);
      if (details) {
        const mergedListing = { ...listing, ...details };
        setDetailedListing(mergedListing);
        
        setEditData(prev => ({
          ...prev,
          shipping_cost: details.shipping_cost !== null ? details.shipping_cost : 0,
          measurements: details.measurements || { length: '', width: '', height: '', weight: '' },
          clothing_size: details.clothing_size || '',
          shoe_size: details.shoe_size || '',
          gender: details.gender || '',
          age_group: details.age_group || '',
          purchase_date: details.purchase_date || '',
          consignor_name: details.consignor_name || '',
          consignor_contact: details.consignor_contact || '',
          performance_notes: details.performance_notes || ''
        }));
      }
    };

    loadListingDetails();
  }, [listing.id, loadDetails]);

  const handleFieldUpdate = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleMeasurementUpdate = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      measurements: { ...prev.measurements, [field]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: Partial<Listing> = { ...editData };
      
      // Handle gender field - convert empty string to null for type safety
      if (editData.gender === '') {
        updates.gender = null;
      } else {
        updates.gender = editData.gender as 'Men' | 'Women' | 'Kids' | 'Unisex' | null;
      }
      
      // Handle age_group field - convert empty string to null for type safety
      if (editData.age_group === '') {
        updates.age_group = null;
      } else {
        updates.age_group = editData.age_group as 'Adult' | 'Youth' | 'Toddler' | 'Baby' | null;
      }
      
      // Remove empty string values for optional fields and convert to null
      Object.keys(updates).forEach(key => {
        if (updates[key as keyof Partial<Listing>] === '') {
          (updates as any)[key] = null;
        }
      });
      
      if (editData.measurements) {
        updates.measurements = editData.measurements;
      }
      
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
          <EditableFields 
            editData={editData} 
            onUpdate={handleFieldUpdate}
          />
        </TableCell>
      )}

      {visibleColumns.measurements && (
        <TableCell>
          <EditableMeasurements
            measurements={editData.measurements}
            onUpdate={handleMeasurementUpdate}
            isLoading={isLoadingData}
          />
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
            value={editData.purchase_price}
            onChange={(e) => handleFieldUpdate('purchase_price', Number(e.target.value))}
            className="w-20 text-sm"
            placeholder="0"
          />
        </TableCell>
      )}

      {visibleColumns.purchaseDate && (
        <TableCell>
          <Input
            type="date"
            value={editData.purchase_date}
            onChange={(e) => handleFieldUpdate('purchase_date', e.target.value)}
            className="w-32 text-sm"
          />
        </TableCell>
      )}

      {visibleColumns.consignmentStatus && (
        <TableCell>
          <div className="space-y-1">
            <Input
              placeholder="Consignor"
              value={editData.consignor_name}
              onChange={(e) => handleFieldUpdate('consignor_name', e.target.value)}
              className="w-24 text-xs"
            />
            <Input
              type="number"
              placeholder="%"
              value={editData.consignment_percentage}
              onChange={(e) => handleFieldUpdate('consignment_percentage', Number(e.target.value))}
              className="w-16 text-xs"
            />
          </div>
        </TableCell>
      )}

      {visibleColumns.sourceType && (
        <TableCell>
          <Select value={editData.source_type} onValueChange={(value) => handleFieldUpdate('source_type', value)}>
            <SelectTrigger className="w-24 text-xs">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Thrift Store">Thrift Store</SelectItem>
              <SelectItem value="Estate Sale">Estate Sale</SelectItem>
              <SelectItem value="Garage Sale">Garage Sale</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Auction">Auction</SelectItem>
              <SelectItem value="Consignment">Consignment</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
      )}

      {visibleColumns.sourceLocation && (
        <TableCell>
          <Input
            value={editData.source_location}
            onChange={(e) => handleFieldUpdate('source_location', e.target.value)}
            className="w-32 text-sm"
            placeholder="Location"
          />
        </TableCell>
      )}

      {visibleColumns.costBasis && <TableCell>-</TableCell>}
      {visibleColumns.netProfit && <TableCell>-</TableCell>}
      {visibleColumns.profitMargin && <TableCell>-</TableCell>}
      {visibleColumns.daysToSell && <TableCell>-</TableCell>}

      {visibleColumns.performanceNotes && (
        <TableCell>
          <Input
            value={editData.performance_notes}
            onChange={(e) => handleFieldUpdate('performance_notes', e.target.value)}
            className="w-32 text-sm"
            placeholder="Notes"
          />
        </TableCell>
      )}

      <TableCell className="sticky right-0 bg-white z-10 border-l">
        <EditActionButtons
          onSave={handleSave}
          onCancel={onCancel}
          isSaving={isSaving}
          isLoadingData={isLoadingData}
        />
      </TableCell>
    </>
  );
};

export default ListingsTableRowEdit;
