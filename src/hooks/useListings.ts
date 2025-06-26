
import { useListingData } from './useListingData';
import { useListingOperations } from './useListingOperations';
import type { Listing } from '@/types/Listing';

export const useListings = (options?: { statusFilter?: string; limit?: number }) => {
  const { listings, setListings, loading, error, fetchListings, refetch } = useListingData(options || {});
  const { deleteListing: deleteOperation, duplicateListing: duplicateOperation, updateListing: updateOperation, updateListingStatus } = useListingOperations();

  console.log('useListings hook - listings count:', listings.length, 'loading:', loading, 'error:', error);

  const deleteListing = async (id: string) => {
    const success = await deleteOperation(id);
    if (success) {
      setListings(prev => prev.filter(l => l.id !== id));
    }
    return success;
  };

  const duplicateListing = async (originalItem: Listing) => {
    const newListing = await duplicateOperation(originalItem);
    if (newListing) {
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
    }
    return newListing;
  };

  const updateListing = async (id: string, updateData: any) => {
    const success = await updateOperation(id, updateData);
    if (success) {
      setListings(prev => prev.map(l => 
        l.id === id ? { ...l, ...updateData } : l
      ));
    }
    return success;
  };

  const updateListingStatusLocal = async (id: string, status: string, additionalData?: any) => {
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
    fetchListings,
    refetch,
    deleteListing,
    duplicateListing,
    updateListing,
    updateListingStatus: updateListingStatusLocal
  };
};
