
import React from 'react';
import BulkUploadStep from './BulkUploadStep';
import PhotoGroupingInterface from '../PhotoGroupingInterface';
import BulkReviewDashboard from '../BulkReviewDashboard';
import BulkShippingConfiguration from '../BulkShippingConfiguration';
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'review' | 'shipping';

interface BulkUploadStepRendererProps {
  currentStep: StepType;
  photos: File[];
  photoGroups: PhotoGroup[];
  isGrouping: boolean;
  isAnalyzing?: boolean;
  onPhotosUploaded: (photos: File[]) => void;
  onStartGrouping: () => void;
  onGroupsConfirmed: (groups: PhotoGroup[]) => void;
  onEditItem: (groupId: string) => void;
  onPreviewItem: (groupId: string) => void;
  onPostItem: (groupId: string) => void;
  onPostAll: () => void;
  onUpdateGroup: (group: PhotoGroup) => void;
  onRetryAnalysis: (groupId: string) => void;
  onBack: () => void;
  onShippingComplete: (groupsWithShipping: PhotoGroup[]) => void;
  onViewInventory?: () => void;
  onStepChange: (step: StepType) => void;
}

const stepComponents = {
  upload: BulkUploadStep,
  grouping: PhotoGroupingInterface,
  review: BulkReviewDashboard,
  shipping: BulkShippingConfiguration
};

const BulkUploadStepRenderer = (props: BulkUploadStepRendererProps) => {
  const {
    currentStep,
    photos,
    photoGroups,
    isGrouping,
    isAnalyzing,
    onPhotosUploaded,
    onStartGrouping,
    onGroupsConfirmed,
    onEditItem,
    onPreviewItem,
    onPostItem,
    onPostAll,
    onUpdateGroup,
    onRetryAnalysis,
    onBack,
    onShippingComplete,
    onViewInventory,
    onStepChange
  } = props;

  const stepProps = {
    upload: {
      photos,
      isGrouping,
      onPhotosUploaded,
      onStartGrouping,
      onBack
    },
    grouping: {
      photoGroups,
      onGroupsConfirmed,
      onBack: () => onStepChange('upload')
    },
    review: {
      photoGroups,
      onEditItem,
      onPreviewItem,
      onPostItem,
      onPostAll,
      onUpdateGroup,
      onRetryAnalysis,
      onProceedToShipping: () => onStepChange('shipping'),
      onViewInventory,
      isAnalyzing
    },
    shipping: {
      photoGroups,
      onComplete: onShippingComplete,
      onBack: () => onStepChange('review'),
      onUpdateGroup
    }
  };

  const StepComponent = stepComponents[currentStep];
  const currentStepProps = stepProps[currentStep];

  return StepComponent ? <StepComponent {...currentStepProps} /> : null;
};

export default BulkUploadStepRenderer;
