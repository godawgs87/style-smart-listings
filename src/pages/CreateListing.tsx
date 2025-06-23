import React, { useState } from 'react';
import MobileHeader from '@/components/MobileHeader';
import PhotoUpload from '@/components/PhotoUpload';
import ShippingCalculator from '@/components/ShippingCalculator';
import ListingPreview from '@/components/ListingPreview';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateListingProps {
  onBack: () => void;
  onViewListings?: () => void;
}

type Step = 'photos' | 'analysis' | 'preview' | 'shipping';

interface ListingData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  measurements: {
    length?: string;
    width?: string;
    height?: string;
    weight?: string;
  };
  keywords?: string[];
  photos: string[];
}

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
      // Convert photos to base64
      const base64Photos = await convertFilesToBase64(photos);
      
      console.log('Calling analyze-photos function...');
      
      const { data, error } = await supabase.functions.invoke('analyze-photos', {
        body: { photos: base64Photos }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Analysis result:', data);

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
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your photos. Please try again.",
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
    console.log('handleExport called');
    console.log('listingData:', listingData);
    
    if (!listingData) {
      console.error('No listing data available');
      toast({
        title: "Error",
        description: "No listing data available to save.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Save listing to localStorage
      const savedListings = JSON.parse(localStorage.getItem('savedListings') || '[]');
      const newListing = {
        id: `listing-${Date.now()}`,
        ...listingData,
        shippingCost,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };

      console.log('Saving listing:', newListing);
      savedListings.push(newListing);
      localStorage.setItem('savedListings', JSON.stringify(savedListings));

      console.log('Listing saved successfully');
      toast({
        title: "Listing Saved!",
        description: "Your listing has been saved and is ready for export."
      });

      // Navigate to listings manager if available, otherwise go back
      if (onViewListings) {
        console.log('Navigating to listings manager');
        onViewListings();
      } else {
        console.log('Going back to previous screen');
        onBack();
      }
    } catch (error) {
      console.error('Error saving listing:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { id: 'photos', title: 'Photos', completed: photos.length > 0 },
    { id: 'analysis', title: 'Analysis', completed: listingData !== null },
    { id: 'preview', title: 'Preview', completed: currentStep === 'shipping' },
    { id: 'shipping', title: 'Shipping', completed: false }
  ];

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

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.completed 
                  ? 'bg-green-500 text-white' 
                  : currentStep === step.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step.completed ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">{step.title}</span>
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        {currentStep === 'photos' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Upload Item Photos</h2>
            <PhotoUpload onPhotosChange={handlePhotosChange} />
            
            {photos.length > 0 && (
              <div className="mt-6">
                <Button onClick={handleAnalyze} className="w-full">
                  Analyze Photos ({photos.length} uploaded)
                </Button>
              </div>
            )}
          </Card>
        )}

        {isAnalyzing && (
          <Card className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Analyzing Your Photos...</h3>
            <p className="text-gray-600 text-sm">
              Our AI is identifying the item, extracting measurements, and generating your listing.
            </p>
          </Card>
        )}

        {currentStep === 'preview' && !isAnalyzing && listingData && (
          <div className="space-y-6">
            <ListingPreview
              listing={{
                ...listingData,
                shippingCost
              }}
              onEdit={() => setCurrentStep('photos')}
              onExport={() => setCurrentStep('shipping')}
            />
          </div>
        )}

        {currentStep === 'shipping' && listingData && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Shipping Calculator</h2>
              <ShippingCalculator
                weight={getWeight()}
                dimensions={getDimensions()}
                onShippingSelect={handleShippingSelect}
              />
            </Card>
            
            <Button 
              onClick={handleExport} 
              className="w-full gradient-bg text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Listing
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
