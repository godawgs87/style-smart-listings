
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Listing } from '@/types/Listing';

interface InventoryActionsProps {
  duplicateListing: (item: Listing) => Promise<Listing | null>;
  deleteListing: (id: string) => Promise<boolean>;
  updateListingStatus: (id: string, status: string) => Promise<boolean>;
  selectedItems: string[];
  clearSelection: () => void;
}

export const useInventoryActions = ({
  duplicateListing,
  deleteListing,
  updateListingStatus,
  selectedItems,
  clearSelection
}: InventoryActionsProps) => {
  const { toast } = useToast();

  const handleDuplicateListing = async (item: Listing) => {
    console.log('InventoryActions: Duplicating listing:', item.id);
    
    toast({
      title: "Duplicating listing...",
      description: "Please wait while we create a copy of your listing."
    });
    
    try {
      const success = await duplicateListing(item);
      if (success) {
        console.log('InventoryActions: Listing duplicated successfully');
        toast({
          title: "Success!",
          description: "Listing duplicated successfully. You can now edit the copy."
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to duplicate listing. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('InventoryActions: Error duplicating listing:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while duplicating the listing.",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    console.log('Bulk deleting items:', selectedItems);
    for (const itemId of selectedItems) {
      await deleteListing(itemId);
    }
    clearSelection();
  };

  const handleBulkStatusUpdate = async (status: string) => {
    console.log('Bulk updating status:', selectedItems, status);
    for (const itemId of selectedItems) {
      await updateListingStatus(itemId, status);
    }
    clearSelection();
  };

  return {
    handleDuplicateListing,
    handleBulkDelete,
    handleBulkStatusUpdate
  };
};
