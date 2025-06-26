
import React from 'react';
import InlineEditableField from './InlineEditableField';
import { ListingData } from '@/types/CreateListing';

interface BasicInformationSectionProps {
  listingData: ListingData;
  onUpdate: (updates: Partial<ListingData>) => void;
}

const BasicInformationSection = ({ listingData, onUpdate }: BasicInformationSectionProps) => {
  const conditionOptions = ['New', 'Like New', 'Used', 'Fair', 'Poor'];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
      
      <div className="space-y-4">
        <InlineEditableField
          label="Title"
          value={listingData.title}
          onSave={(value) => onUpdate({ title: value as string })}
          displayClassName="text-lg font-semibold text-gray-900"
        />
        
        <InlineEditableField
          label="Description"
          value={listingData.description}
          type="textarea"
          onSave={(value) => onUpdate({ description: value as string })}
          displayClassName="text-gray-700 leading-relaxed"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InlineEditableField
            label="Price"
            value={listingData.price}
            type="number"
            onSave={(value) => onUpdate({ price: value as number })}
            displayClassName="text-xl font-bold text-green-600"
          />
          
          <InlineEditableField
            label="Condition"
            value={listingData.condition}
            type="select"
            options={conditionOptions}
            onSave={(value) => onUpdate({ condition: value as string })}
            displayClassName="text-lg font-medium text-gray-900"
          />
        </div>
        
        <InlineEditableField
          label="Category"
          value={listingData.category}
          onSave={(value) => onUpdate({ category: value as string })}
          displayClassName="text-base font-medium text-gray-800"
        />
        
        {listingData.priceResearch && (
          <InlineEditableField
            label="Price Research Notes"
            value={listingData.priceResearch}
            type="textarea"
            onSave={(value) => onUpdate({ priceResearch: value as string })}
            displayClassName="text-sm text-gray-600 italic"
          />
        )}
      </div>
    </div>
  );
};

export default BasicInformationSection;
