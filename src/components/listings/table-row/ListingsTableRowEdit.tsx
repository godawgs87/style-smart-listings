
import React, { useState, useEffect } from 'react';
import { TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListingDetails } from '@/hooks/useListingDetails';
import EditableFields from './edit/EditableFields';
import EditableMeasurements from './edit/EditableMeasurements';
import EditActionButtons from './edit/EditActionButtons';

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
    shipping_cost: listing.shipping_cost !== null ? listing.shipping_cost : 0,
    purchase_price: listing.purchase_price || 0,
    source_type: listing.source_type || '',
    source_location: listing.source_location || '',
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
          measurements: details.measurements || { length: '', width: '', height: '', weight: '' }
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
      const updates = { ...editData };
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

      {/* Render other columns with simplified display */}
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

      {/* Skip other non-essential columns in edit mode */}
      {visibleColumns.purchaseDate && <TableCell>-</TableCell>}
      {visibleColumns.consignmentStatus && <TableCell>-</TableCell>}
      {visibleColumns.costBasis && <TableCell>-</TableCell>}
      {visibleColumns.netProfit && <TableCell>-</TableCell>}
      {visibleColumns.profitMargin && <TableCell>-</TableCell>}
      {visibleColumns.daysToSell && <TableCell>-</TableCell>}
      {visibleColumns.performanceNotes && <TableCell>-</TableCell>}

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
