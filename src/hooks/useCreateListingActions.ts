
import { useEffect } from 'react';
import { usePhotoAnalysis } from '@/hooks/usePhotoAnalysis';
import { useListingSave } from '@/hooks/useListingSave';
import { ListingData } from '@/types/CreateListing';

interface UseCreateListingActionsProps {
  photos: File[];
  listingData: ListingData | null;
  shippingCost: number;
  draftId: string | null;
  isAutoSaving: boolean;
  setListingData: (data: ListingData | null) => void;
  setDraftId: (id: string | null) => void;
  setIsAutoSaving: (saving: boolean) => void;
  setCurrentStep: (step: any) => void;
  onViewListings: () => void;
}

export const useCreateListingActions = ({
  photos,
  listingData,
  shippingCost,
  draftId,
  isAutoSaving,
  setListingData,
  setDraftId,
  setIsAutoSaving,
  setCurrentStep,
  onViewListings
}: UseCreateListingActionsProps) => {
  const { analyzePhotos, isAnalyzing } = usePhotoAnalysis();
  const { saveListing, isSaving } = useListingSave();

  // Auto-save draft whenever listingData changes (debounced)
  useEffect(() => {
    if (!listingData || isAnalyzing || isSaving || isAutoSaving) return;
    
    const autoSaveTimer = setTimeout(async () => {
      setIsAutoSaving(true);
      
      try {
        const saveResult = await saveListing(listingData, shippingCost, 'draft', draftId || undefined);
        if (saveResult.success && saveResult.listingId && !draftId) {
          setDraftId(saveResult.listingId);
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [listingData, shippingCost, draftId, isAnalyzing, isSaving, isAutoSaving, saveListing]);

  const handleAnalyze = async () => {
    if (photos.length === 0) return;
    
    const result = await analyzePhotos(photos);
    if (result) {
      const enrichedResult = {
        ...result,
        is_consignment: listingData?.is_consignment || false,
        consignment_percentage: listingData?.consignment_percentage,
        consignor_name: listingData?.consignor_name,
        consignor_contact: listingData?.consignor_contact,
        purchase_price: listingData?.purchase_price,
        purchase_date: listingData?.purchase_date,
        source_location: listingData?.source_location,
        source_type: listingData?.source_type
      };
      
      setListingData(enrichedResult);
      setCurrentStep('preview');
    }
  };

  const handleExport = async () => {
    if (!listingData) return;
    
    try {
      const success = await saveListing(listingData, shippingCost, 'active', draftId || undefined);
      if (success.success) {
        onViewListings();
      }
    } catch (error) {
      console.error('Error publishing listing:', error);
    }
  };

  return {
    handleAnalyze,
    handleExport,
    isAnalyzing,
    isSaving: isSaving || isAutoSaving
  };
};
