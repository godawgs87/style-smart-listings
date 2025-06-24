
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import PhotoUpload from '@/components/PhotoUpload';
import ShippingCalculator from '@/components/ShippingCalculator';
import ListingPreview from '@/components/ListingPreview';
import PhotoAnalysisLoading from './PhotoAnalysisLoading';
import PriceAlert from './PriceAlert';
import PricingTip from './PricingTip';
import { Step, ListingData } from '@/types/CreateListing';
import { validateListingData } from '@/utils/listingDataValidator';

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
  getDimensions
}: CreateListingContentProps) => {
  if (currentStep === 'photos') {
    return (
      <ScrollArea className="h-[calc(100vh-200px)]">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Upload Item Photos</h2>
          <PhotoUpload onPhotosChange={onPhotosChange} />
          
          {photos.length > 0 && (
            <div className="mt-6">
              <Button onClick={onAnalyze} className="w-full" disabled={isAnalyzing}>
                {isAnalyzing ? 'Analyzing...' : `Analyze Photos (${photos.length} uploaded)`}
              </Button>
            </div>
          )}
        </Card>
      </ScrollArea>
    );
  }

  if (isAnalyzing) {
    return <PhotoAnalysisLoading />;
  }

  if (currentStep === 'preview' && listingData) {
    return (
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6 pr-4">
          <PriceAlert listingData={listingData} />
          <ListingPreview
            listing={{
              ...listingData,
              shippingCost: undefined
            }}
            onEdit={onEdit}
            onExport={() => onExport()}
          />
        </div>
      </ScrollArea>
    );
  }

  if (currentStep === 'shipping' && listingData) {
    const validation = validateListingData(listingData);
    const canSave = validation.isValid && shippingCost > 0 && !isSaving;
    
    return (
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6 pr-4">
          {!validation.isValid && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Please fix these issues:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Choose Shipping</h2>
            <ShippingCalculator
              weight={getWeight()}
              dimensions={getDimensions()}
              onShippingSelect={onShippingSelect}
            />
          </Card>
          
          <PricingTip />
          
          <Button 
            onClick={onExport} 
            className="w-full gradient-bg text-white text-lg py-6"
            disabled={!canSave}
          >
            {isSaving ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                Saving...
              </>
            ) : !validation.isValid ? (
              <>
                <AlertTriangle className="w-5 h-5 mr-3" />
                Fix Issues Above
              </>
            ) : shippingCost <= 0 ? (
              'Select Shipping Option'
            ) : (
              <>
                <Save className="w-5 h-5 mr-3" />
                Save Listing (${shippingCost.toFixed(2)} shipping)
              </>
            )}
          </Button>
        </div>
      </ScrollArea>
    );
  }

  return null;
};

export default CreateListingContent;
