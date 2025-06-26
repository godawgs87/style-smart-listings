
import { useListingData } from './useListingData';
import { useListingOperations } from './useListingOperations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

interface UseListingsOptions {
  statusFilter?: string;
  limit?: number;
  searchTerm?: string;
  categoryFilter?: string;
}

export const useListings = (options?: UseListingsOptions) => {
  const { 
    listings, 
    setListings, 
    loading, 
    error, 
    usingFallback,
    fetchListings, 
    refetch,
    forceOfflineMode
  } = useListingData(options || {});
  
  const { deleteListing: deleteOperation, duplicateListing: duplicateOperation, updateListing: updateOperation, updateListingStatus } = useListingOperations();
  const { toast } = useToast();

  console.log('useListings hook - listings count:', listings.length, 'loading:', loading, 'error:', error, 'fallback:', usingFallback);

  const deleteListing = async (id: string) => {
    if (usingFallback) {
      toast({
        title: "Offline Mode",
        description: "Cannot delete items while offline. Items will reappear when you reconnect.",
        variant: "destructive"
      });
      return false;
    }

    const success = await deleteOperation(id);
    if (success) {
      setListings(prev => prev.filter(l => l.id !== id));
    }
    return success;
  };

  const duplicateListing = async (originalItem: Listing) => {
    if (usingFallback) {
      toast({
        title: "Offline Mode",
        description: "Cannot duplicate items while offline. Please reconnect to the database.",
        variant: "destructive"
      });
      return null;
    }

    console.log('useListings: Starting duplicate operation for:', originalItem.id);
    
    const newListing = await duplicateOperation(originalItem);
    if (newListing) {
      console.log('useListings: Duplicate operation successful, updating state');
      
      // Ensure the newListing matches the Listing interface structure
      const transformedListing: Listing = {
        ...newListing,
        measurements: typeof newListing.measurements === 'object' && newListing.measurements !== null 
          ? newListing.measurements as { length?: string; width?: string; height?: string; weight?: string; }
          : {},
        photos: Array.isArray(newListing.photos) ? newListing.photos : [],
        keywords: Array.isArray(newListing.keywords) ? newListing.keywords : [],
        shipping_cost: newListing.shipping_cost || null,
        category: newListing.category || null,
        condition: newListing.condition || null,
        description: newListing.description || null,
        price_research: newListing.price_research || null,
        status: newListing.status || null
      };
      
      setListings(prev => [transformedListing, ...prev]);
      return transformedListing;
    }
    return null;
  };

  const updateListing = async (id: string, updateData: any) => {
    if (usingFallback) {
      toast({
        title: "Offline Mode",
        description: "Cannot update items while offline. Changes will not be saved.",
        variant: "destructive"
      });
      return false;
    }

    const success = await updateOperation(id, updateData);
    if (success) {
      setListings(prev => prev.map(l => 
        l.id === id ? { ...l, ...updateData } : l
      ));
    }
    return success;
  };

  const updateListingStatusLocal = async (id: string, status: string, additionalData?: any) => {
    if (usingFallback) {
      toast({
        title: "Offline Mode",
        description: "Cannot update status while offline. Changes will not be saved.",
        variant: "destructive"
      });
      return false;
    }

    const success = await updateListingStatus(id, status, additionalData);
    if (success) {
      const updateData = { status, updated_at: new Date().toISOString(), ...additionalData };
      setListings(prev => prev.map(l => 
        l.id === id ? { ...l, ...updateData } : l
      ));
    }
    return success;
  };

  return {
    listings,
    loading,
    error,
    usingFallback,
    fetchListings,
    refetch,
    forceOfflineMode,
    deleteListing,
    duplicateListing,
    updateListing,
    updateListingStatus: updateListingStatusLocal
  };
};
