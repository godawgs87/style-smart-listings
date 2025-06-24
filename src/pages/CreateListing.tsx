
import React, { useState } from 'react';
import MobileHeader from '@/components/MobileHeader';
import CreateListingSteps from '@/components/create-listing/CreateListingSteps';
import CreateListingContent from '@/components/create-listing/CreateListingContent';
import AutomatedListingAssistant from '@/components/AutomatedListingAssistant';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { Step, ListingData, CreateListingProps } from '@/types/CreateListing';
import { usePhotoAnalysis } from '@/hooks/usePhotoAnalysis';
import { useListingSave } from '@/hooks/useListingSave';
import { getWeightFromListing, getDimensionsFromListing } from '@/utils/listingUtils';

const CreateListing = ({ onBack, onViewListings }: CreateListingProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('photos');
  const [photos, setPhotos] = useState<File[]>([]);
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [showAssistant, setShowAssistant] = useState(false);
  
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

  const handlePreviewExport = () => {
    console.log('Moving to shipping step');
    setCurrentStep('shipping');
  };

  const handleSaveListing = async () => {
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

  const handleUpdateListing = (updates: Partial<ListingData>) => {
    if (listingData) {
      setListingData({ ...listingData, ...updates });
    }
  };

  // Show assistant if requested
  if (showAssistant && listingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader 
          title="Listing Assistant" 
          showBack 
          onBack={() => setShowAssistant(false)}
        />
        <div className="p-4">
          <AutomatedListingAssistant
            currentListing={listingData}
            onUpdateListing={handleUpdateListing}
            onClose={() => setShowAssistant(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title="Create Listing" 
        showBack 
        onBack={onBack}
        rightElement={
          listingData && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAss assistant(true)}
              className="text-purple-600"
            >
              <Brain className="w-4 h-4 mr-1" />
              Assistant
            </Button>
          )
        }
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
          onExport={currentStep === 'preview' ? handlePreviewExport : handleSaveListing}
          onShippingSelect={handleShippingSelect}
          getWeight={() => getWeightFromListing(listingData)}
          getDimensions={() => getDimensionsFromListing(listingData)}
        />
      </div>
    </div>
  );
};

export default CreateListing;
