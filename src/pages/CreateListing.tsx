import React, { useState } from 'react';
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
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { analyzePhotos, isAnalyzing } = usePhotoAnalysis();
  const { saveListing, isSaving } = useListingSave();

  const handlePhotosChange = (newPhotos: File[]) => {
    setPhotos(newPhotos);
  };

  const handleAnalyze = async () => {
    if (photos.length === 0) return;
    
    const result = await analyzePhotos(photos);
    if (result) {
      setListingData(result);
      setCurrentStep('preview');
    }
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
    
    const success = await saveListing(listingData, shippingCost);
    if (success) {
      onViewListings();
    }
  };

  const handleShippingSelect = (option: any) => {
    setShippingCost(option.cost || 0);
  };

  const getWeight = () => {
    return listingData?.measurements?.weight || 1;
  };

  const getDimensions = () => {
    return {
      length: listingData?.measurements?.length || 12,
      width: listingData?.measurements?.width || 12,
      height: listingData?.measurements?.height || 6
    };
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Create New Listing"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-4xl mx-auto p-4">
        {!isMobile && (
          <CreateListingSteps currentStep={currentStep} />
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
          getWeight={getWeight}
          getDimensions={getDimensions}
        />
      </div>

      {isMobile && (
        <MobileNavigation
          currentView="create"
          onNavigate={() => {}} // Disabled during creation flow
          showBack
          onBack={onBack}
          title="Create Listing"
        />
      )}
    </div>
  );
};

export default CreateListing;
