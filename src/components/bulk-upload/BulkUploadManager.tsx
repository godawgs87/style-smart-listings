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

type StepType = 'upload' | 'grouping' | 'review' | 'shipping';

interface BulkUploadManagerProps {
  onComplete: (results: any[]) => void;
  onBack: () => void;
  onViewInventory?: () => void;
}

const BulkUploadManager = ({ onComplete, onBack, onViewInventory }: BulkUploadManagerProps) => {
  const { toast } = useToast();
  const {
    currentStep,
    setCurrentStep,
    photos,
    setPhotos,
    photoGroups,
    setPhotoGroups,
    isGrouping,
    setIsGrouping
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
    isAnalyzing
  } = useBulkUploadHandlers(
    photos,
    photoGroups,
    setIsGrouping,
    setCurrentStep,
    setPhotoGroups,
    onComplete
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

  const handleShippingComplete = (groupsWithShipping: PhotoGroup[]) => {
    setPhotoGroups(groupsWithShipping);
    setCurrentStep('review'); // Go back to review with shipping configured
    
    toast({
      title: "Shipping configured!",
      description: "Items are now ready for posting to marketplace.",
    });
  };

  const handleViewInventory = () => {
    if (onViewInventory) {
      onViewInventory();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <BulkUploadHeader />
      
      <BulkUploadStepIndicator
        currentStep={currentStep}
        photos={photos}
        photoGroups={photoGroups}
        processingResults={[]}
      />

      <BulkUploadStepRenderer
        currentStep={currentStep}
        photos={photos}
        photoGroups={photoGroups}
        isGrouping={isGrouping}
        isAnalyzing={isAnalyzing}
        onPhotosUploaded={handlePhotosUploaded}
        onStartGrouping={handleStartGrouping}
        onGroupsConfirmed={handleGroupsConfirmed}
        onEditItem={handleEditItem}
        onPreviewItem={handlePreviewItem}
        onPostItem={handlePostItem}
        onPostAll={handlePostAll}
        onUpdateGroup={handleUpdateGroup}
        onRetryAnalysis={handleRetryAnalysis}
        onShippingComplete={handleShippingComplete}
        onViewInventory={handleViewInventory}
        onBack={onBack}
        setCurrentStep={setCurrentStep}
      />
    </div>
  );
};

export default BulkUploadManager;
