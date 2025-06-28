
import React from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import InlineEditableField from './InlineEditableField';
import CategorySelector from '@/components/CategorySelector';
import { ListingData } from '@/types/CreateListing';

interface BasicInformationSectionProps {
  listingData: ListingData;
  onUpdate: (updates: Partial<ListingData>) => void;
}

const BasicInformationSection = ({ listingData, onUpdate }: BasicInformationSectionProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
      
      <div className="space-y-6">
        <div>
          <InlineEditableField
            label="Title"
            value={listingData.title}
            onSave={(value) => onUpdate({ title: value as string })}
            className="text-lg font-medium"
          />
        </div>

        <div>
          <InlineEditableField
            label="Description"
            value={listingData.description}
            onSave={(value) => onUpdate({ description: value as string })}
            type="textarea"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <CategorySelector
              value={listingData.category_id || null}
              onChange={(categoryId) => onUpdate({ category_id: categoryId })}
              placeholder="Select a category"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
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
                <SelectItem value="For Parts">For Parts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <InlineEditableField
            label="Price ($)"
            value={listingData.price || 0}
            onSave={(value) => onUpdate({ price: parseFloat(value.toString()) || 0 })}
            type="number"
            displayClassName="text-xl font-bold text-green-600"
          />
        </div>
      </div>
    </Card>
  );
};

export default BasicInformationSection;
