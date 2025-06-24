
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

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Create New Listing"
        showBack
        onBack={onBack}
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
