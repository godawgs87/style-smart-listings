
import React, { useState } from 'react';
import MobileHeader from '@/components/MobileHeader';
import CreateListingSteps from '@/components/create-listing/CreateListingSteps';
import CreateListingContent from '@/components/create-listing/CreateListingContent';
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
      
      // Use fetch instead of supabase.functions.invoke for better error handling
      const response = await fetch('/api/analyze-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photos: base64Photos })
      });

      console.log('Function response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Function call failed:', errorText);
        throw new Error(`Analysis failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Function response data:', data);

      if (data.success && data.listing) {
        const analysisResult = data.listing;
        setListingData({
          ...analysisResult,
          photos: base64Photos
        });
        setCurrentStep('preview');
        
        // Show price research info if available
        const priceInfo = analysisResult.priceResearch 
          ? ` (${analysisResult.priceResearch})`
          : '';
        
        toast({
          title: "Analysis Complete! 🎯",
          description: `Listing generated with researched price: $${analysisResult.price}${priceInfo}`
        });
      } else {
        throw new Error(data.error || 'Analysis failed - no data returned');
      }
    } catch (error) {
      console.error('=== ANALYSIS ERROR ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Full error:', error);
      
      // More specific error handling
      let errorMessage = 'Please check your photos and try again.';
      if (error?.message?.includes('quota')) {
        errorMessage = 'OpenAI quota exceeded. Please try again later or contact support.';
      } else if (error?.message?.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error?.message?.includes('API key')) {
        errorMessage = 'API configuration issue. Please contact support.';
      }
      
      toast({
        title: "Analysis Failed",
        description: `Error: ${error?.message || 'Unknown error'}. ${errorMessage}`,
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
      
      // Enhanced error handling for localStorage
      try {
        // Test localStorage access
        const testKey = 'test-access-' + Date.now();
        localStorage.setItem(testKey, 'test');
        const testResult = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        if (testResult !== 'test') {
          throw new Error('localStorage not functioning properly');
        }
        
        console.log('localStorage access test passed');
      } catch (storageError) {
        console.error('localStorage test failed:', storageError);
        throw new Error('Browser storage not available. Please check your browser settings.');
      }
      
      // Get existing listings with better error handling
      let savedListings = [];
      try {
        const savedListingsStr = localStorage.getItem('savedListings');
        console.log('Existing savedListings string length:', savedListingsStr?.length || 0);
        
        if (savedListingsStr) {
          savedListings = JSON.parse(savedListingsStr);
          if (!Array.isArray(savedListings)) {
            console.warn('savedListings is not an array, resetting');
            savedListings = [];
          }
        }
        console.log('Parsed savedListings array length:', savedListings.length);
      } catch (parseError) {
        console.error('Error parsing saved listings:', parseError);
        savedListings = [];
      }
      
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
      console.log('Updated savedListings array length:', savedListings.length);
      
      try {
        const stringifiedListings = JSON.stringify(savedListings);
        console.log('Stringified listings length:', stringifiedListings.length);
        
        // Check if we're approaching localStorage limits (usually ~5MB)
        if (stringifiedListings.length > 4000000) { // 4MB warning threshold
          console.warn('Approaching localStorage size limit');
          toast({
            title: "Storage Warning",
            description: "Your saved listings are taking up significant storage. Consider exporting older listings.",
            variant: "destructive"
          });
        }
        
        localStorage.setItem('savedListings', stringifiedListings);
        console.log('Successfully saved to localStorage');
        
        // Verify the save
        const verification = localStorage.getItem('savedListings');
        console.log('Verification - localStorage content exists:', !!verification);
        console.log('Verification - content length:', verification?.length || 0);

        if (!verification) {
          throw new Error('Failed to verify save operation');
        }

      } catch (saveError) {
        console.error('Error saving to localStorage:', saveError);
        
        if (saveError.name === 'QuotaExceededError' || saveError.message.includes('quota')) {
          throw new Error('Storage quota exceeded. Please clear some saved listings and try again.');
        } else {
          throw new Error(`Save operation failed: ${saveError.message}`);
        }
      }

      toast({
        title: "Listing Saved Successfully! ✅",
        description: `Your ${listingData.title} listing has been saved with researched pricing ($${listingData.price}).`
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
        description: `${error?.message || 'Unknown error'}. Please try again.`,
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
