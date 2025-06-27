
import { useListingsCore } from './listings/useListingsCore';
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
  } = useListingsCore(options);

  const { duplicateListing: duplicateListingOperation } = useListingsDuplication();
  const { deleteListing, updateListing, updateListingStatus } = useListingOperations();

  const duplicateListing = async (item: any) => {
    const result = await duplicateListingOperation(item);
    if (result) {
      refetch();
    }
    return result;
  };

  return {
    listings,
    loading,
    error,
    usingFallback,
    deleteListing,
    duplicateListing,
    updateListing,
    updateListingStatus,
    refetch,
    forceOfflineMode
  };
};
