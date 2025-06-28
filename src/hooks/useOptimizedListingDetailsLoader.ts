
import { useEffect, useState } from 'react';
import { useSelectiveListingDetails } from '@/hooks/useSelectiveListingDetails';

interface VisibleColumns {
  image: boolean;
  measurements: boolean;
  keywords: boolean;
  description: boolean;
  purchasePrice: boolean;
  netProfit: boolean;
  profitMargin: boolean;
  purchaseDate: boolean;
  consignmentStatus: boolean;
  sourceType: boolean;
  sourceLocation: boolean;
  costBasis: boolean;
  daysToSell: boolean;
  performanceNotes: boolean;
}

export const useOptimizedListingDetailsLoader = (
  listing: any,
  visibleColumns: VisibleColumns
) => {
  const { loadSelectiveDetails, isLoadingDetails } = useSelectiveListingDetails();
  const [detailedListing, setDetailedListing] = useState<any>(listing);

  useEffect(() => {
    const loadListingDetails = async () => {
      // Check if we need any additional details beyond what's in the base listing
      const needsDetails = 
        visibleColumns.image || 
        visibleColumns.measurements || 
        visibleColumns.keywords || 
        visibleColumns.description ||
        visibleColumns.purchasePrice ||
        visibleColumns.netProfit ||
        visibleColumns.profitMargin ||
        visibleColumns.purchaseDate ||
        visibleColumns.consignmentStatus ||
        visibleColumns.sourceType ||
        visibleColumns.sourceLocation ||
        visibleColumns.costBasis ||
        visibleColumns.daysToSell ||
        visibleColumns.performanceNotes;
      
      if (needsDetails) {
        const details = await loadSelectiveDetails(listing.id, visibleColumns);
        
        if (details) {
          const mergedListing = { ...listing, ...details };
          setDetailedListing(mergedListing);
        }
      }
    };

    loadListingDetails();
  }, [
    listing.id, 
    loadSelectiveDetails, 
    // Include all visible column dependencies
    visibleColumns.image,
    visibleColumns.measurements,
    visibleColumns.keywords,
    visibleColumns.description,
    visibleColumns.purchasePrice,
    visibleColumns.netProfit,
    visibleColumns.profitMargin,
    visibleColumns.purchaseDate,
    visibleColumns.consignmentStatus,
    visibleColumns.sourceType,
    visibleColumns.sourceLocation,
    visibleColumns.costBasis,
    visibleColumns.daysToSell,
    visibleColumns.performanceNotes
  ]);

  const isLoading = isLoadingDetails(listing.id);

  return { detailedListing, isLoading };
};
