
import { useDeleteOperation } from './listing-operations/useDeleteOperation';
import { useDuplicateOperation } from './listing-operations/useDuplicateOperation';
import { useUpdateOperation } from './listing-operations/useUpdateOperation';

export const useListingOperations = () => {
  const { deleteListing } = useDeleteOperation();
  const { duplicateListing } = useDuplicateOperation();
  const { updateListing, updateListingStatus } = useUpdateOperation();

  return {
    deleteListing,
    duplicateListing,
    updateListing,
    updateListingStatus
  };
};
