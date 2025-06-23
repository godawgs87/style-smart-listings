
import React, { useState } from 'react';
import MobileHeader from '@/components/MobileHeader';
import CreateListingSteps from '@/components/create-listing/CreateListingSteps';
import CreateListingContent from '@/components/create-listing/CreateListingContent';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Step, ListingData, CreateListingProps } from '@/types/CreateListing';

const CreateListing = ({ onBack, onViewListings }: CreateListingProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('photos');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [shippingCost, setShippingCost] = useState(9.95);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handlePhotosChange = (newPhotos: File[]) => {
    setPhotos(newPhotos);
  };

  const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
    const promises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    return Promise.all(promises);
  };

  const handleAnalyze = async () => {
    if (photos.length === 0) return;
    
    setIsAnalyzing(true);
    
    try {
      console.log('=== PHOTO ANALYSIS DEBUG ===');
      console.log('Starting photo analysis with', photos.length, 'photos');
      
      // Convert photos to base64
      const base64Photos = await convertFilesToBase64(photos);
      console.log('Photos converted to base64, first photo size:', base64Photos[0]?.length || 0);
      
      console.log('Calling analyze-photos function...');
      
      const { data, error } = await supabase.functions.invoke('analyze-photos', {
        body: { photos: base64Photos }
      });

      console.log('Supabase function response received');
      console.log('Error:', error);
      console.log('Data:', data);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Function call failed: ${error.message}`);
      }

      if (data.success && data.listing) {
        const analysisResult = data.listing;
        setListingData({
          ...analysisResult,
          photos: base64Photos
        });
        setCurrentStep('preview');
        toast({
          title: "Analysis Complete!",
          description: "Your listing has been generated successfully."
        });
      } else {
        throw new Error(data.error || 'Analysis failed - no data returned');
      }
    } catch (error) {
      console.error('=== ANALYSIS ERROR ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Full error:', error);
      
      toast({
        title: "Analysis Failed",
        description: `Error: ${error?.message || 'Unknown error'}. Please check your photos and try again.`,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShippingSelect = (option: any) => {
    console.log('Selected shipping:', option);
    setShippingCost(option.cost);
  };

  const handleExport = async () => {
    console.log('=== SAVE LISTING DEBUG ===');
    console.log('handleExport called');
    console.log('listingData exists:', !!listingData);
    console.log('listingData:', listingData);
    console.log('shippingCost:', shippingCost);
    
    if (!listingData) {
      console.error('No listing data available');
      toast({
        title: "Error",
        description: "No listing data available to save. Please go back and analyze your photos first.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('Starting save process...');
      
      // Test localStorage access
      const testKey = 'test-access';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      console.log('localStorage access test passed');
      
      // Get existing listings
      const savedListingsStr = localStorage.getItem('savedListings');
      console.log('Existing savedListings string:', savedListingsStr);
      
      const savedListings = savedListingsStr ? JSON.parse(savedListingsStr) : [];
      console.log('Parsed savedListings array:', savedListings);
      
      const newListing = {
        id: `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...listingData,
        shippingCost: Number(shippingCost) || 9.95,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('New listing object created:', newListing);
      
      savedListings.push(newListing);
      console.log('Updated savedListings array:', savedListings);
      
      const stringifiedListings = JSON.stringify(savedListings);
      console.log('Stringified listings length:', stringifiedListings.length);
      
      localStorage.setItem('savedListings', stringifiedListings);
      console.log('Successfully saved to localStorage');
      
      // Verify the save
      const verification = localStorage.getItem('savedListings');
      console.log('Verification - localStorage content exists:', !!verification);
      console.log('Verification - content length:', verification?.length || 0);

      toast({
        title: "Listing Saved Successfully! ✅",
        description: `Your ${listingData.title} listing has been saved and is ready for export.`
      });

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

    } catch (error) {
      console.error('=== SAVE ERROR ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Full error object:', error);
      
      toast({
        title: "Save Failed",
        description: `Save failed: ${error?.message || 'Unknown error'}. Please try again or contact support.`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      console.log('Save process completed, isSaving set to false');
    }
  };

  // Extract weight from listing data for shipping calculator
  const getWeight = (): number => {
    if (!listingData?.measurements?.weight) return 2.0;
    const weightStr = listingData.measurements.weight;
    const weightMatch = weightStr.match(/(\d+\.?\d*)/);
    return weightMatch ? parseFloat(weightMatch[1]) : 2.0;
  };

  const getDimensions = () => {
    if (!listingData?.measurements) {
      return { length: 10, width: 8, height: 6 };
    }
    
    const parseSize = (sizeStr?: string): number => {
      if (!sizeStr) return 8;
      const match = sizeStr.match(/(\d+\.?\d*)/);
      return match ? parseFloat(match[1]) : 8;
    };

    return {
      length: parseSize(listingData.measurements.length),
      width: parseSize(listingData.measurements.width),
      height: parseSize(listingData.measurements.height)
    };
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
          onExport={() => setCurrentStep('shipping')}
          onShippingSelect={handleShippingSelect}
          getWeight={getWeight}
          getDimensions={getDimensions}
        />
      </div>
    </div>
  );
};

export default CreateListing;
