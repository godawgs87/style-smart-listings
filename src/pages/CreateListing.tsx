
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
import { sanitizeListingData } from '@/utils/listingDataValidator';

const CreateListing = ({ onBack, onViewListings }: CreateListingProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('photos');
  const [photos, setPhotos] = useState<File[]>([]);
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [showAssistant, setShowAssistant] = useState(false);
  
  const { isAnalyzing, analyzePhotos } = usePhotoAnalysis();
  const { isSaving, saveListing } = useListingSave();

  const handlePhotosChange = (newPhotos: File[]) => {
    console.log('Photos changed:', newPhotos.length);
    setPhotos(newPhotos);
  };

  const handleAnalyze = async () => {
    console.log('Starting photo analysis...');
    const result = await analyzePhotos(photos);
    if (result) {
      console.log('Analysis successful, setting listing data');
      setListingData(result);
      setCurrentStep('preview');
    } else {
      console.error('Analysis failed');
    }
  };

  const handleShippingSelect = (option: any) => {
    console.log('Shipping option selected:', option);
    setShippingCost(Number(option.cost) || 0);
  };

  const handlePreviewExport = () => {
    console.log('Moving from preview to shipping step');
    setCurrentStep('shipping');
  };

  const handleSaveListing = async () => {
    if (!listingData) {
      console.error('No listing data to save');
      return;
    }
    
    console.log('=== SAVE LISTING INITIATED ===');
    console.log('Original listing data:', listingData);
    console.log('Shipping cost:', shippingCost);
    
    // Sanitize data before saving
    const sanitizedData = sanitizeListingData(listingData);
    console.log('Sanitized listing data:', sanitizedData);
    
    const success = await saveListing(sanitizedData, shippingCost);
    
    if (success) {
      console.log('Save successful, navigating...');
      // Small delay to ensure toast is visible
      setTimeout(() => {
        if (onViewListings) {
          console.log('Navigating to listings manager');
          onViewListings();
        } else {
          console.log('Going back to previous screen');
          onBack();
        }
      }, 1500);
    } else {
      console.log('Save failed');
    }
  };

  const handleUpdateListing = (updates: Partial<ListingData>) => {
    if (listingData) {
      console.log('Updating listing data with:', updates);
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
        rightAction={
          listingData && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAssistant(true)}
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
