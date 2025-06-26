
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import PhotoUpload from '@/components/PhotoUpload';
import ShippingCalculator from '@/components/ShippingCalculator';
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

  if (currentStep === 'preview' && listingData) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Listing Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <p className="text-lg font-medium">{listingData.title}</p>
            </div>
            <div>
              <Label>Description</Label>
              <p className="text-gray-700">{listingData.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price</Label>
                <p className="text-xl font-bold text-green-600">${listingData.price}</p>
              </div>
              <div>
                <Label>Category</Label>
                <p>{listingData.category}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Condition</Label>
                <p>{listingData.condition}</p>
              </div>
              <div>
                <Label>Measurements</Label>
                <p>
                  {listingData.measurements?.length}" × {listingData.measurements?.width}" × {listingData.measurements?.height}"
                  {listingData.measurements?.weight && ` (${listingData.measurements.weight} lbs)`}
                </p>
              </div>
            </div>
            {listingData.features && listingData.features.length > 0 && (
              <div>
                <Label>Features</Label>
                <ul className="list-disc list-inside text-gray-700">
                  {listingData.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            {listingData.photos && listingData.photos.length > 0 && (
              <div>
                <Label>Photos</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {listingData.photos.slice(0, 6).map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={onEdit}>
                Edit Listing
              </Button>
              <Button onClick={onExport} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Continue to Shipping'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'shipping') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Options</CardTitle>
          </CardHeader>
          <CardContent>
            <ShippingCalculator
              itemWeight={getWeight()}
              itemDimensions={getDimensions()}
              onShippingSelect={onShippingSelect}
            />
            <div className="mt-6">
              <Button 
                onClick={onExport} 
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? 'Publishing...' : 'Publish Listing'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default CreateListingContent;
