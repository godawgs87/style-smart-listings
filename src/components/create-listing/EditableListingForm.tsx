
import React from 'react';
import BasicInformationSection from './sections/BasicInformationSection';
import MeasurementsSection from './sections/MeasurementsSection';
import KeywordsSection from './sections/KeywordsSection';
import FeaturesSection from './sections/FeaturesSection';
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
  const handlePurchaseConsignmentChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Review & Edit Listing Details</h2>
        <p className="text-gray-600 mt-2">All fields are optional - customize your listing as needed</p>
      </div>

      <BasicInformationSection 
        listingData={listingData}
        onUpdate={onUpdate}
      />

      <MeasurementsSection 
        listingData={listingData}
        onUpdate={onUpdate}
      />

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

      <KeywordsSection 
        listingData={listingData}
        onUpdate={onUpdate}
      />

      <FeaturesSection 
        listingData={listingData}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default EditableListingForm;
