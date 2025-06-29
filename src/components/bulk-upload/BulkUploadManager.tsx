
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import BulkUploadHeader from './components/BulkUploadHeader';
import BulkUploadStepIndicator from './components/BulkUploadStepIndicator';
import BulkUploadStepRenderer from './components/BulkUploadStepRenderer';
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
    category_id?: string | null;
    condition?: string;
    measurements?: {
      length?: string | number;
      width?: string | number;
      height?: string | number;
      weight?: string | number;
    };
    keywords?: string[];
    photos?: string[];
    priceResearch?: string;
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
  listingId?: string;
}

interface BulkUploadManagerProps {
  onComplete: (results: any[]) => void;
  onBack: () => void;
}

const BulkUploadManager = ({ onComplete, onBack }: BulkUploadManagerProps) => {
  const { toast } = useToast();
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
    handleUpdateGroup,
    handleRetryAnalysis,
    handleSaveDraft
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

  useEffect(() => {
    const clearToasts = () => {
      const toastElements = document.querySelectorAll('[data-sonner-toast]');
      toastElements.forEach(el => el.remove());
    };
    clearToasts();
  }, [currentStep]);

  const handlePhotosUploaded = (uploadedPhotos: File[]) => {
    console.log('📸 Photos uploaded for bulk processing:', uploadedPhotos.length);
    setPhotos(uploadedPhotos);
  };

  const handleEnhancedComplete = (results: any[]) => {
    console.log('🎉 Bulk upload completed successfully with results:', results);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    toast({
      title: "Bulk Upload Complete!",
      description: `Successfully processed ${successCount} items${failureCount > 0 ? `, ${failureCount} failed` : ''}. Items have been saved to your inventory.`,
    });

    setTimeout(() => {
      onComplete(results);
    }, 1500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <BulkUploadHeader />
      
      <BulkUploadStepIndicator
        currentStep={currentStep}
        photos={photos}
        photoGroups={photoGroups}
        processingResults={processingResults}
      />

      <BulkUploadStepRenderer
        currentStep={currentStep}
        photos={photos}
        photoGroups={photoGroups}
        isGrouping={isGrouping}
        processingResults={processingResults}
        currentReviewIndex={currentReviewIndex}
        onPhotosUploaded={handlePhotosUploaded}
        onStartGrouping={handleStartGrouping}
        onGroupsConfirmed={handleGroupsConfirmed}
        onEditItem={handleEditItem}
        onPreviewItem={handlePreviewItem}
        onPostItem={handlePostItem}
        onPostAll={handlePostAll}
        onUpdateGroup={handleUpdateGroup}
        onRetryAnalysis={handleRetryAnalysis}
        onBack={onBack}
        setCurrentStep={setCurrentStep}
      />
    </div>
  );
};

export default BulkUploadManager;
