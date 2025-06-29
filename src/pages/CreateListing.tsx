
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useCreateListingState } from '@/hooks/useCreateListingState';
import { useCreateListingActions } from '@/hooks/useCreateListingActions';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import CreateListingContent from '@/components/create-listing/CreateListingContent';
import CreateListingSteps from '@/components/create-listing/CreateListingSteps';
import BulkUploadManager from '@/components/bulk-upload/BulkUploadManager';
import CreateListingModeSelector from '@/components/create-listing/CreateListingModeSelector';

interface CreateListingProps {
  onBack: () => void;
  onViewListings: () => void;
}

const CreateListing = ({ onBack, onViewListings }: CreateListingProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk' | null>(null);
  
  const {
    currentStep,
    setCurrentStep,
    photos,
    shippingCost,
    listingData,
    draftId,
    isAutoSaving,
    setDraftId,
    setListingData,
    setIsAutoSaving,
    handlePhotosChange,
    handleListingDataChange,
    handleShippingSelect
  } = useCreateListingState();

  const handleViewInventory = () => {
    window.location.href = '/inventory';
  };

  const {
    handleAnalyze,
    handleExport,
    isAnalyzing,
    isSaving
  } = useCreateListingActions({
    photos,
    listingData,
    shippingCost,
    draftId,
    isAutoSaving,
    setListingData,
    setDraftId,
    setIsAutoSaving,
    setCurrentStep,
    onViewListings: handleViewInventory
  });

  const handleEdit = () => {
    setCurrentStep('shipping');
  };

  const handleBack = () => {
    if (uploadMode === null) {
      onBack();
    } else if (uploadMode === 'single') {
      if (currentStep === 'shipping') {
        setCurrentStep('preview');
      } else if (currentStep === 'preview') {
        setCurrentStep('photos');
      } else {
        setUploadMode(null);
      }
    } else {
      setUploadMode(null);
    }
  };

  const handleBulkComplete = (results: any[]) => {
    console.log('Bulk upload completed with results:', results);
    onViewListings();
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
    if (uploadMode === null) return 'Back to Dashboard';
    if (uploadMode === 'bulk') return 'Back to Upload Mode';
    if (currentStep === 'shipping') return 'Back to Preview';
    if (currentStep === 'preview') return 'Back to Photos';
    return 'Back to Upload Mode';
  };

  const getTitle = () => {
    if (uploadMode === null) return 'Create New Listing';
    if (uploadMode === 'bulk') return 'Bulk Upload Manager';
    return 'Create Single Listing';
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title={getTitle()}
        showBack
        onBack={handleBack}
      />
      
      <div className="max-w-4xl mx-auto p-4">
        {uploadMode === null && (
          <CreateListingModeSelector onModeSelect={setUploadMode} />
        )}

        {uploadMode === 'single' && (
          <>
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
              isSaving={isSaving}
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
          </>
        )}

        {uploadMode === 'bulk' && (
          <BulkUploadManager
            onComplete={handleBulkComplete}
            onBack={() => setUploadMode(null)}
          />
        )}
      </div>

      {isMobile && (
        <MobileNavigation
          currentView="create"
          onNavigate={() => {}}
          showBack
          onBack={handleBack}
          title={getTitle()}
        />
      )}
    </div>
  );
};

export default CreateListing;
