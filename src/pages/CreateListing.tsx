
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { usePhotoAnalysis } from '@/hooks/usePhotoAnalysis';
import { useListingSave } from '@/hooks/useListingSave';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import CreateListingContent from '@/components/create-listing/CreateListingContent';
import CreateListingSteps from '@/components/create-listing/CreateListingSteps';
import { Step, ListingData } from '@/types/CreateListing';

interface CreateListingProps {
  onBack: () => void;
  onViewListings: () => void;
}

const CreateListing = ({ onBack, onViewListings }: CreateListingProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('photos');
  const [photos, setPhotos] = useState<File[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { analyzePhotos, isAnalyzing } = usePhotoAnalysis();
  const { saveListing, isSaving } = useListingSave();

  // Auto-save draft whenever listingData changes (debounced)
  useEffect(() => {
    if (!listingData || isAnalyzing || isSaving || isAutoSaving) return;
    
    const autoSaveTimer = setTimeout(async () => {
      setIsAutoSaving(true);
      console.log('Auto-saving draft with current data:', listingData);
      
      try {
        const saveResult = await saveListing(listingData, shippingCost, 'draft', draftId || undefined);
        if (saveResult.success && saveResult.listingId && !draftId) {
          setDraftId(saveResult.listingId);
          console.log('Draft auto-saved with ID:', saveResult.listingId);
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000); // Auto-save after 2 seconds of no changes

    return () => clearTimeout(autoSaveTimer);
  }, [listingData, shippingCost, draftId, isAnalyzing, isSaving, isAutoSaving, saveListing]);

  const handlePhotosChange = (newPhotos: File[]) => {
    setPhotos(newPhotos);
  };

  const handleAnalyze = async () => {
    if (photos.length === 0) return;
    
    const result = await analyzePhotos(photos);
    if (result) {
      // Preserve any existing sourcing data when merging analysis results
      const enrichedResult = {
        ...result,
        // Preserve existing sourcing data if it exists
        is_consignment: listingData?.is_consignment || false,
        consignment_percentage: listingData?.consignment_percentage,
        consignor_name: listingData?.consignor_name,
        consignor_contact: listingData?.consignor_contact,
        purchase_price: listingData?.purchase_price,
        purchase_date: listingData?.purchase_date,
        source_location: listingData?.source_location,
        source_type: listingData?.source_type
      };
      
      console.log('Analysis complete, preserving existing data:', enrichedResult);
      setListingData(enrichedResult);
      setCurrentStep('preview');
    }
  };

  const handleListingDataChange = (updates: Partial<ListingData>) => {
    console.log('Updating listing data:', updates);
    setListingData(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleEdit = () => {
    setCurrentStep('preview');
  };

  const handleExport = async () => {
    if (!listingData) return;
    
    if (currentStep === 'preview') {
      setCurrentStep('shipping');
      return;
    }
    
    try {
      // Update the existing draft to active status instead of creating new listing
      const success = await saveListing(listingData, shippingCost, 'active', draftId || undefined);
      if (success.success) {
        console.log('Listing published successfully');
        onViewListings();
      } else {
        console.error('Failed to publish listing');
      }
    } catch (error) {
      console.error('Error publishing listing:', error);
      // Show error to user but don't navigate away
    }
  };

  const handleBack = () => {
    if (currentStep === 'shipping') {
      setCurrentStep('preview');
    } else if (currentStep === 'preview') {
      setCurrentStep('photos');
    } else {
      onBack();
    }
  };

  const handleShippingSelect = (option: any) => {
    setShippingCost(option.cost || 0);
  };

  const getWeight = (): number => {
    const weight = listingData?.measurements?.weight;
    if (typeof weight === 'string') {
      const parsed = parseFloat(weight);
      return isNaN(parsed) ? 1 : parsed;
    }
    return typeof weight === 'number' ? weight : 1;
  };

  const getDimensions = (): { length: number; width: number; height: number } => {
    const measurements = listingData?.measurements;
    
    const parseValue = (value: string | number | undefined, defaultValue: number): number => {
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
      }
      return typeof value === 'number' ? value : defaultValue;
    };

    return {
      length: parseValue(measurements?.length, 12),
      width: parseValue(measurements?.width, 12),
      height: parseValue(measurements?.height, 6)
    };
  };

  const getBackButtonText = () => {
    if (currentStep === 'shipping') return 'Back to Preview';
    if (currentStep === 'preview') return 'Back to Photos';
    return 'Back to Dashboard';
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Create New Listing"
        showBack
        onBack={handleBack}
      />
      
      <div className="max-w-4xl mx-auto p-4">
        {!isMobile && (
          <CreateListingSteps 
            currentStep={currentStep} 
            photos={photos}
            listingData={listingData}
          />
        )}
        
        <CreateListingContent
          currentStep={currentStep}
          photos={photos}
          isAnalyzing={isAnalyzing}
          listingData={listingData}
          shippingCost={shippingCost}
          isSaving={isSaving || isAutoSaving}
          onPhotosChange={handlePhotosChange}
          onAnalyze={handleAnalyze}
          onEdit={handleEdit}
          onExport={handleExport}
          onShippingSelect={handleShippingSelect}
          onListingDataChange={handleListingDataChange}
          getWeight={getWeight}
          getDimensions={getDimensions}
          onBack={handleBack}
          backButtonText={getBackButtonText()}
        />
      </div>

      {isMobile && (
        <MobileNavigation
          currentView="create"
          onNavigate={() => {}}
          showBack
          onBack={handleBack}
          title="Create Listing"
        />
      )}
    </div>
  );
};

export default CreateListing;
