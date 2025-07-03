
import { useState } from 'react';
import type { Listing } from '@/types/Listing';

export const useTableRowEdit = (listing: Listing, onUpdateListing?: (listingId: string, updates: Partial<Listing>) => Promise<void>) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Listing>>({});

  const isEditing = editingId === listing.id;

  const handleEdit = () => {
    setEditingId(listing.id);
    setEditData({
      title: listing.title,
      price: listing.price,
      status: listing.status,
      category: listing.category,
      condition: listing.condition,
      shipping_cost: listing.shipping_cost
    });
  };

  const handleSave = async () => {
    if (onUpdateListing) {
      try {
        console.log('🔄 Saving edit data:', { listingId: listing.id, editData });
        await onUpdateListing(listing.id, editData);
        console.log('✅ Save completed successfully');
        setEditingId(null);
        setEditData({});
      } catch (error) {
        console.error('❌ Failed to update listing:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const updateEditData = (field: keyof Listing, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return {
    isEditing,
    editData,
    handleEdit,
    handleSave,
    handleCancel,
    updateEditData
  };
};
