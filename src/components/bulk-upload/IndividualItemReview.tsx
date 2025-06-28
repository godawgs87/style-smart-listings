
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Skip, CheckCircle, X, Save, Image, FileText, Truck, AlertCircle } from 'lucide-react';
import ShippingOptionsCalculator from './ShippingOptionsCalculator';
import type { PhotoGroup } from './BulkUploadManager';

interface IndividualItemReviewProps {
  group: PhotoGroup;
  currentIndex: number;
  totalItems: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onApprove: (updatedGroup: PhotoGroup) => void;
  onReject: () => void;
  onSaveDraft: (updatedGroup: PhotoGroup) => void;
}

const IndividualItemReview = ({
  group,
  currentIndex,
  totalItems,
  onBack,
  onNext,
  onSkip,
  onApprove,
  onReject,
  onSaveDraft
}: IndividualItemReviewProps) => {
  const [editedGroup, setEditedGroup] = useState<PhotoGroup>(group);
  const [activeTab, setActiveTab] = useState('details');

  const handleFieldUpdate = (field: string, value: any) => {
    setEditedGroup(prev => ({
      ...prev,
      listingData: {
        ...prev.listingData,
        [field]: value
      }
    }));
  };

  const handleMeasurementUpdate = (field: string, value: string) => {
    setEditedGroup(prev => ({
      ...prev,
      listingData: {
        ...prev.listingData,
        measurements: {
          ...prev.listingData?.measurements,
          [field]: value
        }
      }
    }));
  };

  const handleShippingSelect = (shippingOption: any) => {
    setEditedGroup(prev => ({
      ...prev,
      selectedShipping: shippingOption
    }));
  };

  const hasRequiredData = () => {
    return editedGroup.listingData?.title && 
           editedGroup.listingData?.price && 
           editedGroup.selectedShipping;
  };

  const getRecommendationBadge = () => {
    if (!editedGroup.shippingOptions || editedGroup.shippingOptions.length === 0) {
      return null;
    }

    const recommended = editedGroup.shippingOptions.find(opt => opt.recommended);
    if (!recommended) return null;

    const savings = Math.max(...editedGroup.shippingOptions.map(opt => opt.cost)) - recommended.cost;
    if (savings > 0) {
      return (
        <Badge className="bg-blue-100 text-blue-800 mt-2">
          💡 AI Recommendation: {recommended.name} saves ${savings.toFixed(2)}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-center">
              <span className="text-sm text-gray-600">
                ({currentIndex + 1} of {totalItems})
              </span>
              <h1 className="text-xl font-bold">{editedGroup.name}</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={onSkip}
              className="flex items-center gap-2"
            >
              Skip Item
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Photos
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Shipping
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photos" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {editedGroup.photos.map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`${editedGroup.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">📏 MEASUREMENTS</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="length">Length</Label>
                      <Input
                        id="length"
                        value={editedGroup.listingData?.measurements?.length || ''}
                        onChange={(e) => handleMeasurementUpdate('length', e.target.value)}
                        placeholder="22\""
                      />
                    </div>
                    <div>
                      <Label htmlFor="width">Width</Label>
                      <Input
                        id="width"
                        value={editedGroup.listingData?.measurements?.width || ''}
                        onChange={(e) => handleMeasurementUpdate('width', e.target.value)}
                        placeholder="28\""
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        value={editedGroup.listingData?.measurements?.weight || ''}
                        onChange={(e) => handleMeasurementUpdate('weight', e.target.value)}
                        placeholder="6oz"
                      />
                      {editedGroup.listingData?.measurements?.weight?.includes('AI est.') && (
                        <span className="text-xs text-gray-500">✅ AI Estimated</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">💰 PRICING & CATEGORY</h3>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editedGroup.listingData?.title || ''}
                      onChange={(e) => handleFieldUpdate('title', e.target.value)}
                      className="font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={editedGroup.listingData?.price || ''}
                        onChange={(e) => handleFieldUpdate('price', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select 
                        value={editedGroup.listingData?.condition || ''} 
                        onValueChange={(value) => handleFieldUpdate('condition', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Like New">Like New</SelectItem>
                          <SelectItem value="Very Good">Very Good</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={editedGroup.listingData?.category || ''}
                      onChange={(e) => handleFieldUpdate('category', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">🚚 SHIPPING OPTIONS</h3>
                
                {editedGroup.shippingOptions && editedGroup.shippingOptions.length > 0 ? (
                  <ShippingOptionsCalculator
                    shippingOptions={editedGroup.shippingOptions}
                    selectedOption={editedGroup.selectedShipping}
                    onSelectShipping={handleShippingSelect}
                    itemPrice={editedGroup.listingData?.price || 0}
                  />
                ) : (
                  <Card className="p-6 text-center border-dashed">
                    <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">No shipping options calculated yet</p>
                    <Button variant="outline" className="mt-2">
                      Calculate Shipping
                    </Button>
                  </Card>
                )}

                {getRecommendationBadge()}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button variant="destructive" onClick={onReject}>
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onSaveDraft(editedGroup)}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                onClick={() => onApprove(editedGroup)}
                disabled={!hasRequiredData()}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndividualItemReview;
