
import React, { useState } from 'react';
import MobileHeader from '@/components/MobileHeader';
import CreateListingSteps from '@/components/create-listing/CreateListingSteps';
import CreateListingContent from '@/components/create-listing/CreateListingContent';
import { Step, ListingData, CreateListingProps } from '@/types/CreateListing';
import { usePhotoAnalysis } from '@/hooks/usePhotoAnalysis';
import { useListingSave } from '@/hooks/useListingSave';
import { getWeightFromListing, getDimensionsFromListing } from '@/utils/listingUtils';

const CreateListing = ({ onBack, onViewListings }: CreateListingProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('photos');
  const [photos, setPhotos] = useState<File[]>([]);
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  
  const { isAnalyzing, analyzePhotos } = usePhotoAnalysis();
  const { isSaving, saveListing } = useListingSave();

  const handlePhotosChange = (newPhotos: File[]) => {
    setPhotos(newPhotos);
  };

  const handleAnalyze = async () => {
    const result = await analyzePhotos(photos);
    if (result) {
      setListingData(result);
      setCurrentStep('preview');
    }
  };

  const handleShippingSelect = (option: any) => {
    console.log('Selected shipping:', option);
    console.log('Setting shipping cost to:', option.cost);
    setShippingCost(option.cost);
  };

  const handleExport = async () => {
    if (!listingData) return;
    
    console.log('Attempting to save with shipping cost:', shippingCost);
    const success = await saveListing(listingData, shippingCost);
    if (success) {
      // Small delay to ensure toast is visible
      setTimeout(() => {
        if (onViewListings) {
          console.log('Navigating to listings manager');
          onViewListings();
        } else {
          console.log('Going back to previous screen');
          onBack();
        }
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title="Create Listing" 
        showBack 
        onBack={onBack}
      />

      <CreateListingSteps 
        currentStep={currentStep}
        photos={photos}
        listingData={listingData}
      />

      <div className="p-4 space-y-4">
        <CreateListingContent
          currentStep={currentStep}
          photos={photos}
          isAnalyzing={isAnalyzing}
          listingData={listingData}
          shippingCost={shippingCost}
          isSaving={isSaving}
          onPhotosChange={handlePhotosChange}
          onAnalyze={handleAnalyze}
          onEdit={() => setCurrentStep('photos')}
          onExport={handleExport}
          onShippingSelect={handleShippingSelect}
          getWeight={() => getWeightFromListing(listingData)}
          getDimensions={() => getDimensionsFromListing(listingData)}
        />
      </div>
    </div>
  );
};

export default CreateListing;
