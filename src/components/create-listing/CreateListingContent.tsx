
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PhotoUpload from '@/components/PhotoUpload';
import ShippingCalculator from '@/components/ShippingCalculator';
import EditableListingForm from './EditableListingForm';
import PreviewHeader from './sections/PreviewHeader';
import ProgressIndicator from './ProgressIndicator';
import PhotoAnalysisProgress from './PhotoAnalysisProgress';
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
      
      // Show feedback for updates with animation
      toast({
        title: "✅ Updated",
        description: "Changes saved automatically",
        duration: 2000
      });
    }
  };

  const currentListingData = updatedListingData || listingData;

  // Render different content based on the current step
  if (currentStep === 'photos') {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        <ProgressIndicator currentStep={currentStep} />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Upload Photos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
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
            
            {/* Show analysis progress */}
            {isAnalyzing && (
              <div className="mt-6">
                <PhotoAnalysisProgress />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'preview' && currentListingData) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <ProgressIndicator currentStep={currentStep} />
        
        {/* Main Preview Card with Editable Header */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <PreviewHeader
            listingData={currentListingData}
            onUpdate={handleListingUpdate}
          />
          
          {/* Optional/Advanced Fields Section */}
          <CardContent className="p-4 md:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Additional Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                These optional fields help improve your listing's searchability and provide more context to buyers.
              </p>
            </div>
            
            <EditableListingForm
              listingData={currentListingData}
              onUpdate={handleListingUpdate}
              onSave={() => {}}
              isEditing={true}
              onToggleEdit={() => {}}
            />
          </CardContent>
        </Card>

        {/* Photos Section */}
        {currentListingData.photos && currentListingData.photos.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Photos</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {currentListingData.photos.slice(0, 6).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Product ${index + 1}`}
                    className="w-full h-20 md:h-24 object-cover rounded border hover:scale-105 transition-transform duration-200"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center space-y-3 md:space-y-0 md:space-x-4 pt-4">
          <Button variant="outline" onClick={onBack} className="w-full md:w-auto md:min-w-[120px]">
            Back to Photos
          </Button>
          <Button 
            onClick={onExport} 
            disabled={isSaving}
            className="w-full md:w-auto md:min-w-[120px] bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            {isSaving ? 'Saving...' : 'Continue to Shipping'}
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 'shipping') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
          <div className="space-y-6">
            <ProgressIndicator currentStep={currentStep} />
            
            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Configure Shipping</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Set up shipping options for your listing</p>
            </div>

            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                  <span className="text-lg">Shipping Calculator</span>
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    Item: {currentListingData?.title}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <ShippingCalculator
                  itemWeight={getWeight()}
                  itemDimensions={getDimensions()}
                  onShippingSelect={onShippingSelect}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row justify-center space-y-3 md:space-y-0 md:space-x-4 pt-6">
              <Button 
                variant="outline" 
                onClick={onBack}
                className="w-full md:w-auto md:min-w-[120px]"
              >
                Back to Preview
              </Button>
              <Button 
                onClick={onExport} 
                disabled={isSaving}
                className="w-full md:w-auto md:min-w-[120px] bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
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
