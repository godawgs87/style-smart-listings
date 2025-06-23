
import React, { useState } from 'react';
import MobileHeader from '@/components/MobileHeader';
import PhotoUpload from '@/components/PhotoUpload';
import ShippingCalculator from '@/components/ShippingCalculator';
import ListingPreview from '@/components/ListingPreview';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface CreateListingProps {
  onBack: () => void;
}

type Step = 'photos' | 'analysis' | 'preview' | 'shipping';

const CreateListing = ({ onBack }: CreateListingProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('photos');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Simulated AI-generated listing data
  const [listingData] = useState({
    title: "Vintage Nike Air Max 90 White/Black Size 10.5 Excellent Condition",
    description: "Classic Nike Air Max 90 in excellent pre-owned condition. White leather upper with black accents and signature Air Max sole. Minor wear on outsole, no major flaws. From smoke-free home. Fast shipping with tracking!",
    price: 85,
    category: "Athletic Shoes",
    condition: "Pre-owned - Excellent",
    measurements: {
      length: "12.5 inches",
      width: "4.5 inches", 
      height: "5 inches",
      weight: "2.1 lbs"
    },
    shippingCost: 9.95,
    photos: photos.map(photo => URL.createObjectURL(photo))
  });

  const handlePhotosChange = (newPhotos: File[]) => {
    setPhotos(newPhotos);
  };

  const handleAnalyze = async () => {
    if (photos.length === 0) return;
    
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
    setCurrentStep('preview');
  };

  const handleShippingSelect = (option: any) => {
    console.log('Selected shipping:', option);
    // Update listing data with shipping info
  };

  const handleExport = () => {
    console.log('Exporting to eBay...');
    // Simulate export process
    alert('Listing exported to eBay successfully!');
    onBack();
  };

  const steps = [
    { id: 'photos', title: 'Photos', completed: photos.length > 0 },
    { id: 'analysis', title: 'Analysis', completed: currentStep !== 'photos' },
    { id: 'preview', title: 'Preview', completed: currentStep === 'shipping' || currentStep === 'preview' },
    { id: 'shipping', title: 'Shipping', completed: false }
  ];

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
              Our AI is extracting measurements, identifying the item, and generating your listing.
            </p>
          </Card>
        )}

        {currentStep === 'preview' && !isAnalyzing && (
          <div className="space-y-6">
            <ListingPreview
              listing={listingData}
              onEdit={() => {/* Handle edit */}}
              onExport={() => setCurrentStep('shipping')}
            />
          </div>
        )}

        {currentStep === 'shipping' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Shipping Calculator</h2>
              <ShippingCalculator
                weight={2.1}
                dimensions={{ length: 12.5, width: 4.5, height: 5 }}
                onShippingSelect={handleShippingSelect}
              />
            </Card>
            
            <Button onClick={handleExport} className="w-full gradient-bg text-white">
              Export to eBay
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
