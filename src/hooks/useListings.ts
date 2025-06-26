
import { useListingData } from './useListingData';
import { useListingOperations } from './useListingOperations';

export const useListings = (options?: { statusFilter?: string; limit?: number }) => {
  const { listings, setListings, loading, error, fetchListings, refetch } = useListingData(options || {});
  const { deleteListing: deleteOperation, updateListing: updateOperation, updateListingStatus } = useListingOperations();

  const deleteListing = async (id: string) => {
    const success = await deleteOperation(id);
    if (success) {
      setListings(prev => prev.filter(l => l.id !== id));
    }
    return success;
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
    updateListing,
    updateListingStatus: updateListingStatusLocal
  };
};
