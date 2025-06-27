
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
        console.log('🔍 ListingsTableRowDisplay - Loading details for:', listing.id);
        
        const details = await loadDetails(listing.id);
        console.log('🔍 Loaded details response:', details);
        
        if (details) {
          const mergedListing = { ...listing, ...details };
          console.log('🔍 Merged listing data:', mergedListing);
          console.log('🔍 Photos in merged data:', mergedListing.photos);
          
          setDetailedListing(mergedListing);
        } else {
          console.log('❌ No details returned for listing:', listing.id);
        }
      }
    };

    loadListingDetails();
  }, [listing.id, loadDetails, visibleColumns.image, visibleColumns.measurements, visibleColumns.keywords, visibleColumns.description]);

  const isLoading = isLoadingDetails(listing.id);

  console.log('🎯 ListingsTableRowDisplay render - listing:', listing.id);
  console.log('🎯 Current detailedListing photos:', detailedListing.photos);

  return { detailedListing, isLoading };
};
