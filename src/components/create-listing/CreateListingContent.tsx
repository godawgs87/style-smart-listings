import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PhotoUpload from '@/components/PhotoUpload';
import ShippingCalculator from '@/components/ShippingCalculator';
import ListingPreview from '@/components/ListingPreview';
import PhotoAnalysisLoading from './PhotoAnalysisLoading';
import PriceAlert from './PriceAlert';
import PricingTip from './PricingTip';
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
  console.log('=== CreateListingContent DEBUG ===');
  console.log('Current step:', currentStep);
  console.log('Shipping cost:', shippingCost);
  console.log('Shipping cost type:', typeof shippingCost);
  console.log('Is saving:', isSaving);
  console.log('Is saving type:', typeof isSaving);
  console.log('Button should be disabled:', isSaving || shippingCost <= 0);
  console.log('shippingCost <= 0:', shippingCost <= 0);

  if (currentStep === 'photos') {
    return (
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
    );
  }

  if (isAnalyzing) {
    return <PhotoAnalysisLoading />;
  }

  if (currentStep === 'preview' && listingData) {
    return (
      <div className="space-y-6">
        <PriceAlert listingData={listingData} />
        <ListingPreview
          listing={{
            ...listingData,
            // Don't show shipping cost in preview until it's selected
            shippingCost: undefined
          }}
          onEdit={onEdit}
          onExport={() => onExport()}
        />
      </div>
    );
  }

  if (currentStep === 'shipping' && listingData) {
    const buttonDisabled = isSaving || shippingCost <= 0;
    console.log('=== BUTTON STATE DEBUG ===');
    console.log('Button disabled calculated:', buttonDisabled);
    console.log('isSaving:', isSaving);
    console.log('shippingCost:', shippingCost);
    console.log('shippingCost <= 0:', shippingCost <= 0);
    
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            <strong>Shipping Rates:</strong> These are calculated estimates based on package dimensions and weight using standard carrier pricing formulas. 
            Actual rates may vary. For exact pricing, use carrier websites or shipping software.
          </AlertDescription>
        </Alert>
        
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Shipping Calculator</h2>
          <ShippingCalculator
            weight={getWeight()}
            dimensions={getDimensions()}
            onShippingSelect={onShippingSelect}
          />
        </Card>
        
        <PricingTip />
        
        {/* Debug info for troubleshooting */}
        <div className="bg-yellow-100 p-4 rounded text-sm">
          <strong>Debug Info:</strong><br/>
          Shipping Cost: {shippingCost} (type: {typeof shippingCost})<br/>
          Is Saving: {isSaving ? 'true' : 'false'}<br/>
          Button Disabled: {buttonDisabled ? 'true' : 'false'}
        </div>
        
        <Button 
          onClick={() => {
            console.log('=== BUTTON CLICKED ===');
            console.log('Calling onExport...');
            onExport();
          }} 
          className="w-full gradient-bg text-white text-lg py-6"
          disabled={buttonDisabled}
        >
          {isSaving ? (
            <>
              <div className="animate-spin w-5 h-5 border-3 border-white border-t-transparent rounded-full mr-3"></div>
              Saving Listing...
            </>
          ) : shippingCost <= 0 ? (
            <>
              <Save className="w-5 h-5 mr-3" />
              Select Shipping Option First
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-3" />
              Save Listing (${shippingCost.toFixed(2)} shipping)
            </>
          )}
        </Button>
        
        {isSaving && (
          <p className="text-center text-sm text-gray-600">
            Please wait while we save your listing...
          </p>
        )}
      </div>
    );
  }

  return null;
};

export default CreateListingContent;
