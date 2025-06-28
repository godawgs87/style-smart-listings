
import React, { useEffect } from 'react';
import BulkUploadStep from './components/BulkUploadStep';
import BulkUploadStepIndicator from './components/BulkUploadStepIndicator';
import PhotoGroupingInterface from './PhotoGroupingInterface';
import BulkProcessingStatus from './BulkProcessingStatus';
import BulkShippingReview from './BulkShippingReview';
import BulkReviewDashboard from './BulkReviewDashboard';
import IndividualItemReview from './IndividualItemReview';
import { useBulkUploadState } from './hooks/useBulkUploadState';
import { useBulkUploadHandlers } from './hooks/useBulkUploadHandlers';

export interface PhotoGroup {
  id: string;
  photos: File[];
  name: string;
  confidence: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'error';
  aiSuggestion?: string;
  listingData?: {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    condition?: string;
    measurements?: {
      length?: string | number;
      width?: string | number;
      height?: string | number;
      weight?: string | number;
    };
    keywords?: string[];
    photos?: string[];
    purchase_price?: number;
    purchase_date?: string;
    source_location?: string;
    source_type?: string;
    is_consignment?: boolean;
    consignment_percentage?: number;
    consignor_name?: string;
    consignor_contact?: string;
    clothing_size?: string;
    shoe_size?: string;
    gender?: 'Men' | 'Women' | 'Kids' | 'Unisex';
    age_group?: 'Adult' | 'Youth' | 'Toddler' | 'Baby';
    features?: string[];
    includes?: string[];
    defects?: string[];
  };
  shippingOptions?: any[];
  selectedShipping?: {
    id: string;
    name: string;
    cost: number;
    estimatedDays: string;
  };
  isPosted?: boolean;
}

interface BulkUploadManagerProps {
  onComplete: (results: any[]) => void;
  onBack: () => void;
}

const BulkUploadManager = ({ onComplete, onBack }: BulkUploadManagerProps) => {
  const {
    currentStep,
    setCurrentStep,
    photos,
    setPhotos,
    photoGroups,
    setPhotoGroups,
    isGrouping,
    setIsGrouping,
    processingResults,
    setProcessingResults,
    currentReviewIndex,
    setCurrentReviewIndex
  } = useBulkUploadState();

  const {
    handleStartGrouping,
    handleGroupsConfirmed,
    handleEditItem,
    handlePreviewItem,
    handlePostItem,
    handlePostAll,
    handleReviewAll,
    handleSaveDraft,
    handleIndividualReviewNext,
    handleIndividualReviewBack,
    handleIndividualReviewSkip,
    handleIndividualReviewApprove,
    handleIndividualReviewReject,
    handleIndividualSaveDraft,
    handleShippingComplete
  } = useBulkUploadHandlers(
    photos,
    photoGroups,
    setIsGrouping,
    setCurrentStep,
    setPhotoGroups,
    setProcessingResults,
    setCurrentReviewIndex,
    onComplete,
    currentReviewIndex
  );

  const handlePhotosUploaded = (uploadedPhotos: File[]) => {
    setPhotos(uploadedPhotos);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Bulk Upload Manager</h1>
        <p className="text-gray-600 text-sm md:text-base">Upload multiple items at once for efficient listing creation</p>
      </div>

      <BulkUploadStepIndicator
        currentStep={currentStep}
        photos={photos}
        photoGroups={photoGroups}
        processingResults={processingResults}
      />

      {currentStep === 'upload' && (
        <BulkUploadStep
          photos={photos}
          isGrouping={isGrouping}
          onPhotosUploaded={handlePhotosUploaded}
          onStartGrouping={handleStartGrouping}
          onBack={onBack}
        />
      )}

      {currentStep === 'grouping' && (
        <PhotoGroupingInterface
          photoGroups={photoGroups}
          onGroupsConfirmed={handleGroupsConfirmed}
          onBack={() => setCurrentStep('upload')}
        />
      )}

      {currentStep === 'processing' && (
        <BulkProcessingStatus
          photoGroups={photoGroups}
          results={processingResults}
          onComplete={() => setCurrentStep('review')}
          onBack={() => setCurrentStep('grouping')}
        />
      )}

      {currentStep === 'shipping' && (
        <BulkShippingReview
          photoGroups={photoGroups}
          onComplete={handleShippingComplete}
          onBack={() => setCurrentStep('processing')}
        />
      )}

      {currentStep === 'review' && (
        <BulkReviewDashboard
          photoGroups={photoGroups}
          onEditItem={handleEditItem}
          onPreviewItem={handlePreviewItem}
          onPostItem={handlePostItem}
          onPostAll={handlePostAll}
          onReviewAll={handleReviewAll}
          onSaveDraft={handleSaveDraft}
        />
      )}

      {currentStep === 'individual-review' && photoGroups[currentReviewIndex] && (
        <IndividualItemReview
          group={photoGroups[currentReviewIndex]}
          currentIndex={currentReviewIndex}
          totalItems={photoGroups.length}
          onBack={handleIndividualReviewBack}
          onNext={handleIndividualReviewNext}
          onSkip={handleIndividualReviewSkip}
          onApprove={handleIndividualReviewApprove}
          onReject={handleIndividualReviewReject}
          onSaveDraft={handleIndividualSaveDraft}
        />
      )}
    </div>
  );
};

export default BulkUploadManager;
