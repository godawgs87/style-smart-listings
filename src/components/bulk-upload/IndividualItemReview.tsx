
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, SkipForward, CheckCircle, X, Save, Image, FileText, Truck, AlertCircle } from 'lucide-react';
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
    console.log('🚚 Shipping option selected:', shippingOption);
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

  const handleApprove = () => {
    console.log('✅ Approving item:', editedGroup);
    onApprove(editedGroup);
  };

  const handleSaveDraft = () => {
    console.log('💾 Saving draft:', editedGroup);
    onSaveDraft(editedGroup);
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
    <div className="w-full max-w-4xl mx-auto p-3 md:p-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" onClick={onBack} size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="text-center flex-1">
              <span className="text-xs text-gray-600 block">
                ({currentIndex + 1} of {totalItems})
              </span>
              <h1 className="text-lg md:text-xl font-bold truncate">{editedGroup.name}</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={onSkip}
              size="sm"
              className="flex items-center gap-1"
            >
              <span className="hidden sm:inline">Skip</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="photos" className="flex items-center gap-1 text-xs md:text-sm">
                <Image className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Photos</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-1 text-xs md:text-sm">
                <FileText className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Details</span>
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center gap-1 text-xs md:text-sm">
                <Truck className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Shipping</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photos" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

            <TabsContent value="details" className="mt-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold">📏 MEASUREMENTS</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="length" className="text-sm">Length</Label>
                      <Input
                        id="length"
                        value={editedGroup.listingData?.measurements?.length || ''}
                        onChange={(e) => handleMeasurementUpdate('length', e.target.value)}
                        placeholder="22&quot;"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="width" className="text-sm">Width</Label>
                      <Input
                        id="width"
                        value={editedGroup.listingData?.measurements?.width || ''}
                        onChange={(e) => handleMeasurementUpdate('width', e.target.value)}
                        placeholder="28&quot;"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight" className="text-sm">Weight</Label>
                      <Input
                        id="weight"
                        value={editedGroup.listingData?.measurements?.weight || ''}
                        onChange={(e) => handleMeasurementUpdate('weight', e.target.value)}
                        placeholder="6oz"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold">💰 PRICING & DETAILS</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="title" className="text-sm">Title</Label>
                      <Input
                        id="title"
                        value={editedGroup.listingData?.title || ''}
                        onChange={(e) => handleFieldUpdate('title', e.target.value)}
                        className="font-medium text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="price" className="text-sm">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          value={editedGroup.listingData?.price || ''}
                          onChange={(e) => handleFieldUpdate('price', Number(e.target.value))}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="condition" className="text-sm">Condition</Label>
                        <Select 
                          value={editedGroup.listingData?.condition || ''} 
                          onValueChange={(value) => handleFieldUpdate('condition', value)}
                        >
                          <SelectTrigger className="text-sm">
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
                      <Label htmlFor="category" className="text-sm">Category</Label>
                      <Input
                        id="category"
                        value={editedGroup.listingData?.category || ''}
                        onChange={(e) => handleFieldUpdate('category', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-semibold">🚚 SHIPPING OPTIONS</h3>
                
                {editedGroup.shippingOptions && editedGroup.shippingOptions.length > 0 ? (
                  <ShippingOptionsCalculator
                    shippingOptions={editedGroup.shippingOptions}
                    selectedOption={editedGroup.selectedShipping}
                    onSelectShipping={handleShippingSelect}
                    itemPrice={editedGroup.listingData?.price || 0}
                  />
                ) : (
                  <Card className="p-4 text-center border-dashed">
                    <AlertCircle className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 text-sm">No shipping options calculated yet</p>
                    <Button variant="outline" className="mt-2 text-sm">
                      Calculate Shipping
                    </Button>
                  </Card>
                )}

                {getRecommendationBadge()}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-6 pt-4 border-t gap-3">
            <Button 
              variant="destructive" 
              onClick={onReject}
              className="w-full sm:w-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={!hasRequiredData()}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Approve & Next</span>
                <span className="sm:hidden">Approve</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndividualItemReview;
