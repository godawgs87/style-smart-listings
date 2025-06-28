
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import IndividualReviewHeader from './components/IndividualReviewHeader';
import IndividualReviewActions from './components/IndividualReviewActions';
import BulkConsignmentOptions from './components/BulkConsignmentOptions';
import BulkShippingOptions from './components/BulkShippingOptions';
import EditableListingForm from '../create-listing/EditableListingForm';
import type { PhotoGroup } from './BulkUploadManager';
import type { ListingData } from '@/types/CreateListing';

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

  // Update editedGroup when group changes
  useEffect(() => {
    setEditedGroup(group);
  }, [group]);

  const handleListingDataUpdate = (updates: Partial<ListingData>) => {
    console.log('📝 IndividualItemReview - Updating listing data:', updates);
    setEditedGroup(prev => ({
      ...prev,
      listingData: {
        ...prev.listingData,
        ...updates
      }
    }));
  };

  const handleConsignmentUpdate = (field: string, value: any) => {
    console.log('💼 IndividualItemReview - Updating consignment field:', field, 'with value:', value);
    setEditedGroup(prev => ({
      ...prev,
      listingData: {
        ...prev.listingData,
        [field]: value
      }
    }));
  };

  const handleShippingSelect = (option: any) => {
    console.log('🚚 IndividualItemReview - Shipping option selected:', option);
    setEditedGroup(prev => ({
      ...prev,
      selectedShipping: {
        id: option.id,
        name: option.name,
        cost: option.cost,
        estimatedDays: option.estimatedDays || option.days || '3-5 business days'
      }
    }));
  };

  const handleApprove = () => {
    console.log('✅ IndividualItemReview - Approving item with data:', editedGroup);
    onApprove(editedGroup);
  };

  const handleSaveDraft = () => {
    console.log('💾 IndividualItemReview - Saving draft with data:', editedGroup);
    onSaveDraft(editedGroup);
  };

  const getWeight = (): number => {
    const weight = editedGroup.listingData?.measurements?.weight;
    if (typeof weight === 'string') {
      const parsed = parseFloat(weight);
      return isNaN(parsed) ? 1 : parsed;
    }
    return typeof weight === 'number' ? weight : 1;
  };

  const getDimensions = (): { length: number; width: number; height: number } => {
    const measurements = editedGroup.listingData?.measurements;
    
    const parseValue = (value: string | number | undefined, defaultValue: number): number => {
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
      }
      return typeof value === 'number' ? value : defaultValue;
    };

    return {
      length: parseValue(measurements?.length, 12),
      width: parseValue(measurements?.width, 12),
      height: parseValue(measurements?.height, 6)
    };
  };

  // Ensure we have the required ListingData structure with proper type conversion
  const ensureListingData = (): ListingData => {
    const baseData = editedGroup.listingData || {};
    
    // Convert measurements to string format as required by ListingData
    const convertedMeasurements = {
      length: baseData.measurements?.length ? String(baseData.measurements.length) : '',
      width: baseData.measurements?.width ? String(baseData.measurements.width) : '',
      height: baseData.measurements?.height ? String(baseData.measurements.height) : '',
      weight: baseData.measurements?.weight ? String(baseData.measurements.weight) : ''
    };
    
    return {
      title: baseData.title || '',
      description: baseData.description || '',
      price: baseData.price || 0,
      category: baseData.category || '',
      condition: baseData.condition || '',
      measurements: convertedMeasurements,
      photos: baseData.photos || [],
      ...baseData
    };
  };

  console.log('🔍 IndividualItemReview - Current group:', editedGroup);

  return (
    <div className="space-y-4 md:space-y-6">
      <IndividualReviewHeader
        group={editedGroup}
        currentIndex={currentIndex}
        totalItems={totalItems}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Left Column - Main Listing Form */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <EditableListingForm
                listingData={ensureListingData()}
                onUpdate={handleListingDataUpdate}
                onEdit={() => {}} // Not used in bulk context
                onExport={() => {}} // Not used in bulk context
                onBack={() => {}} // Not used in bulk context
                backButtonText=""
                isSaving={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Consignment & Shipping */}
        <div className="space-y-4">
          {/* Consignment Options */}
          <BulkConsignmentOptions
            data={{
              purchase_price: editedGroup.listingData?.purchase_price,
              purchase_date: editedGroup.listingData?.purchase_date,
              source_location: editedGroup.listingData?.source_location,
              source_type: editedGroup.listingData?.source_type,
              is_consignment: editedGroup.listingData?.is_consignment,
              consignment_percentage: editedGroup.listingData?.consignment_percentage,
              consignor_name: editedGroup.listingData?.consignor_name,
              consignor_contact: editedGroup.listingData?.consignor_contact
            }}
            onChange={handleConsignmentUpdate}
            listingPrice={editedGroup.listingData?.price || 0}
          />

          <Separator />

          {/* Shipping Options */}
          <BulkShippingOptions
            itemWeight={getWeight()}
            itemDimensions={getDimensions()}
            onShippingSelect={handleShippingSelect}
            selectedOption={editedGroup.selectedShipping ? {
              id: editedGroup.selectedShipping.id,
              name: editedGroup.selectedShipping.name,
              cost: editedGroup.selectedShipping.cost,
              days: editedGroup.selectedShipping.estimatedDays,
              description: `${editedGroup.selectedShipping.name} shipping option`
            } : undefined}
          />
        </div>
      </div>
      
      <IndividualReviewActions
        onBack={onBack}
        onNext={onNext}
        onSkip={onSkip}
        onApprove={handleApprove}
        onReject={onReject}
        onSaveDraft={handleSaveDraft}
        currentIndex={currentIndex}
        totalItems={totalItems}
        canApprove={!!(editedGroup.listingData?.title && editedGroup.listingData?.price && editedGroup.selectedShipping)}
      />
    </div>
  );
};

export default IndividualItemReview;
