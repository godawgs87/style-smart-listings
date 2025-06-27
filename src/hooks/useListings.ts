
import { useUnifiedInventory } from './useUnifiedInventory';
import { useListingsDuplication } from './listings/useListingsDuplication';
import { useListingOperations } from './useListingOperations';

interface UseListingsOptions {
  statusFilter?: string;
  limit?: number;
  searchTerm?: string;
  categoryFilter?: string;
}

export const useListings = (options: UseListingsOptions = {}) => {
  const {
    listings,
    loading,
    error,
    usingFallback,
    refetch,
    forceOfflineMode
  } = useUnifiedInventory({
    statusFilter: options.statusFilter,
    categoryFilter: options.categoryFilter, 
    searchTerm: options.searchTerm,
    limit: options.limit
  });

  const { duplicateListing: duplicateListingOperation } = useListingsDuplication();
  const { deleteListing, updateListing, updateListingStatus } = useListingOperations();

  const duplicateListing = async (item: any) => {
    const result = await duplicateListingOperation(item);
    if (result) {
      // Refetch after successful duplication
      setTimeout(() => refetch(), 500);
    }
    return result;
  };

  const deleteListingWithRefresh = async (id: string) => {
    const result = await deleteListing(id);
    if (result) {
      // Refetch after successful deletion
      setTimeout(() => refetch(), 500);
    }
    return result;
  };

  const updateListingWithRefresh = async (id: string, updates: any) => {
    const result = await updateListing(id, updates);
    if (result) {
      // Refetch after successful update
      setTimeout(() => refetch(), 500);
    }
    return result;
  };

  const updateListingStatusWithRefresh = async (id: string, status: string) => {
    const result = await updateListingStatus(id, status);
    if (result) {
      // Refetch after successful status update
      setTimeout(() => refetch(), 500);
    }
    return result;
  };

  return {
    listings,
    loading,
    error,
    usingFallback,
    deleteListing: deleteListingWithRefresh,
    duplicateListing,
    updateListing: updateListingWithRefresh,
    updateListingStatus: updateListingStatusWithRefresh,
    refetch,
    forceOfflineMode
  };
};
