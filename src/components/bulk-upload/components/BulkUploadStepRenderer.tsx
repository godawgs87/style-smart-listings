
import React from 'react';
import BulkUploadStep from './BulkUploadStep';
import PhotoGroupingInterface from '../PhotoGroupingInterface';
import BulkReviewDashboard from '../BulkReviewDashboard';
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'review';

interface BulkUploadStepRendererProps {
  currentStep: StepType;
  photos: File[];
  photoGroups: PhotoGroup[];
  isGrouping: boolean;
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
  setCurrentStep: (step: StepType) => void;
}

const BulkUploadStepRenderer = ({
  currentStep,
  photos,
  photoGroups,
  isGrouping,
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
  setCurrentStep
}: BulkUploadStepRendererProps) => {
  
  switch (currentStep) {
    case 'upload':
      return (
        <BulkUploadStep
          photos={photos}
          isGrouping={isGrouping}
          onPhotosUploaded={onPhotosUploaded}
          onStartGrouping={onStartGrouping}
          onBack={onBack}
        />
      );

    case 'grouping':
      return (
        <PhotoGroupingInterface
          photoGroups={photoGroups}
          onGroupsConfirmed={onGroupsConfirmed}
          onBack={() => setCurrentStep('upload')}
        />
      );

    case 'review':
      return (
        <BulkReviewDashboard
          photoGroups={photoGroups}
          onEditItem={onEditItem}
          onPreviewItem={onPreviewItem}
          onPostItem={onPostItem}
          onPostAll={onPostAll}
          onUpdateGroup={onUpdateGroup}
          onRetryAnalysis={onRetryAnalysis}
        />
      );

    default:
      return null;
  }
};

export default BulkUploadStepRenderer;
