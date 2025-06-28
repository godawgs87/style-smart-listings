
import { useEffect, useState } from 'react';
import { useListingDetails } from '@/hooks/useListingDetails';

interface VisibleColumns {
  image: boolean;
  measurements: boolean;
  keywords: boolean;
  description: boolean;
}

export const useListingDetailsLoader = (
  listing: any,
  visibleColumns: VisibleColumns
) => {
  const { loadDetails, isLoadingDetails } = useListingDetails();
  const [detailedListing, setDetailedListing] = useState<any>(listing);

  useEffect(() => {
    const loadListingDetails = async () => {
      // Load details if we need photos, measurements, keywords, or other detailed fields
      const needsDetails = visibleColumns.image || visibleColumns.measurements || visibleColumns.keywords || visibleColumns.description;
      
      if (needsDetails) {
        const details = await loadDetails(listing.id);
        
        if (details) {
          const mergedListing = { ...listing, ...details };
          setDetailedListing(mergedListing);
        }
      }
    };

    loadListingDetails();
  }, [listing.id, loadDetails, visibleColumns.image, visibleColumns.measurements, visibleColumns.keywords, visibleColumns.description]);

  const isLoading = isLoadingDetails(listing.id);

  return { detailedListing, isLoading };
};
