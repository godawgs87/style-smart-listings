
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import PurchaseConsignmentSection from './PurchaseConsignmentSection';
import { ListingData } from '@/types/CreateListing';

interface EditableListingFormProps {
  listingData: ListingData;
  onUpdate: (updates: Partial<ListingData>) => void;
  onSave: () => void;
  isEditing: boolean;
  onToggleEdit: () => void;
}

const EditableListingForm = ({ 
  listingData, 
  onUpdate, 
  onSave, 
  isEditing, 
  onToggleEdit 
}: EditableListingFormProps) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [newFeature, setNewFeature] = useState('');

  const addKeyword = () => {
    if (newKeyword.trim()) {
      const currentKeywords = listingData.keywords || [];
      onUpdate({ keywords: [...currentKeywords, newKeyword.trim()] });
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    const currentKeywords = listingData.keywords || [];
    onUpdate({ keywords: currentKeywords.filter((_, i) => i !== index) });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      const currentFeatures = listingData.features || [];
      onUpdate({ features: [...currentFeatures, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = listingData.features || [];
    onUpdate({ features: currentFeatures.filter((_, i) => i !== index) });
  };

  const handleMeasurementChange = (field: string, value: string) => {
    onUpdate({
      measurements: {
        ...listingData.measurements,
        [field]: value
      }
    });
  };

  const handlePurchaseConsignmentChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Review & Edit Listing Details</h2>
        <p className="text-gray-600 mt-2">All fields are optional - customize your listing as needed</p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={listingData.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={listingData.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={listingData.price}
                onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={listingData.category}
                onChange={(e) => onUpdate({ category: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select 
              value={listingData.condition} 
              onValueChange={(value) => onUpdate({ condition: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Like New">Like New</SelectItem>
                <SelectItem value="Used">Used</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Measurements */}
      <Card>
        <CardHeader>
          <CardTitle>Measurements (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="length">Length</Label>
              <Input
                id="length"
                value={listingData.measurements?.length || ''}
                onChange={(e) => handleMeasurementChange('length', e.target.value)}
                placeholder="e.g., 12 inches"
              />
            </div>
            <div>
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                value={listingData.measurements?.width || ''}
                onChange={(e) => handleMeasurementChange('width', e.target.value)}
                placeholder="e.g., 8 inches"
              />
            </div>
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                value={listingData.measurements?.height || ''}
                onChange={(e) => handleMeasurementChange('height', e.target.value)}
                placeholder="e.g., 6 inches"
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                value={listingData.measurements?.weight || ''}
                onChange={(e) => handleMeasurementChange('weight', e.target.value)}
                placeholder="e.g., 2 lbs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase & Consignment Information */}
      <PurchaseConsignmentSection
        data={{
          purchase_price: listingData.purchase_price,
          purchase_date: listingData.purchase_date,
          source_location: listingData.source_location,
          source_type: listingData.source_type,
          is_consignment: listingData.is_consignment,
          consignment_percentage: listingData.consignment_percentage,
          consignor_name: listingData.consignor_name,
          consignor_contact: listingData.consignor_contact
        }}
        onChange={handlePurchaseConsignmentChange}
        listingPrice={listingData.price}
      />

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Keywords (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(listingData.keywords || []).map((keyword, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {keyword}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => removeKeyword(index)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add keyword..."
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            />
            <Button type="button" onClick={addKeyword} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {(listingData.features || []).map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm">{feature}</span>
                <X 
                  className="w-4 h-4 cursor-pointer hover:text-red-500" 
                  onClick={() => removeFeature(index)}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add feature..."
              onKeyPress={(e) => e.key === 'Enter' && addFeature()}
            />
            <Button type="button" onClick={addFeature} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditableListingForm;
