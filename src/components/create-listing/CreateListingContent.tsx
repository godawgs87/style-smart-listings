import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PhotoUpload from '@/components/PhotoUpload';
import ShippingCalculator from '@/components/ShippingCalculator';
import PreviewHeader from './sections/PreviewHeader';
import { Step, ListingData } from '@/types/CreateListing';

interface CreateListingContentProps {
  currentStep: Step;
  photos: File[];
  isAnalyzing: boolean;
  listingData: ListingData | null;
  shippingCost: number;
  isSaving: boolean;
  onPhotosChange: (photos: File[]) => void;
  onAnalyze: () => void;
  onEdit: () => void;
  onExport: () => void;
  onShippingSelect: (option: any) => void;
  getWeight: () => number;
  getDimensions: () => { length: number; width: number; height: number };
  onBack: () => void;
  backButtonText: string;
}

const CreateListingContent = ({
  currentStep,
  photos,
  isAnalyzing,
  listingData,
  shippingCost,
  isSaving,
  onPhotosChange,
  onAnalyze,
  onEdit,
  onExport,
  onShippingSelect,
  getWeight,
  getDimensions,
  onBack,
  backButtonText
}: CreateListingContentProps) => {
  const { toast } = useToast();
  const [updatedListingData, setUpdatedListingData] = useState<ListingData | null>(null);

  const handleListingUpdate = (updates: Partial<ListingData>) => {
    console.log('Updating listing data:', updates);
    if (listingData) {
      const updated = { ...listingData, ...updates };
      setUpdatedListingData(updated);
      
      // Show feedback for updates
      toast({
        title: "Updated",
        description: "Changes saved automatically"
      });
    }
  };

  const currentListingData = updatedListingData || listingData;

  // Render different content based on the current step
  if (currentStep === 'photos') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUpload onPhotosChange={onPhotosChange} />
            {photos.length > 0 && (
              <div className="mt-6">
                <Button 
                  onClick={onAnalyze} 
                  disabled={isAnalyzing || photos.length === 0}
                  className="w-full"
                >
                  {isAnalyzing ? 'Analyzing Photos...' : 'Analyze Photos'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'preview' && currentListingData) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Main Preview Card with Editable Header */}
        <Card>
          <PreviewHeader
            listingData={currentListingData}
            onUpdate={handleListingUpdate}
          />
        </Card>

        {/* Photos Section */}
        {currentListingData.photos && currentListingData.photos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {currentListingData.photos.slice(0, 6).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 pt-4">
          <Button variant="outline" onClick={onBack}>
            Back to Photos
          </Button>
          <Button onClick={onExport} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Continue to Shipping'}
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 'shipping') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Configure Shipping</h1>
              <p className="text-gray-600 mt-2">Set up shipping options for your listing</p>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Shipping Calculator</span>
                  <span className="text-sm font-normal text-gray-500">
                    Item: {currentListingData?.title}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ShippingCalculator
                  itemWeight={getWeight()}
                  itemDimensions={getDimensions()}
                  onShippingSelect={onShippingSelect}
                />
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-4 pt-6">
              <Button 
                variant="outline" 
                onClick={onBack}
                className="min-w-[120px]"
              >
                Back to Preview
              </Button>
              <Button 
                onClick={onExport} 
                disabled={isSaving}
                className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? 'Publishing...' : 'Publish Listing'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CreateListingContent;
