
import React from 'react';
import BulkUploadStep from './BulkUploadStep';
import PhotoGroupingInterface from '../PhotoGroupingInterface';
import BulkProcessingStatus from '../BulkProcessingStatus';
import BulkShippingReview from '../BulkShippingReview';
import BulkReviewDashboard from '../BulkReviewDashboard';
import IndividualItemReview from '../IndividualItemReview';
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

interface BulkUploadStepRendererProps {
  currentStep: StepType;
  photos: File[];
  photoGroups: PhotoGroup[];
  isGrouping: boolean;
  processingResults: any[];
  currentReviewIndex: number;
  onPhotosUploaded: (photos: File[]) => void;
  onStartGrouping: () => void;
  onGroupsConfirmed: (groups: PhotoGroup[]) => void;
  onShippingComplete: (groups: PhotoGroup[]) => void;
  onEditItem: (groupId: string) => void;
  onPreviewItem: (groupId: string) => void;
  onPostItem: (groupId: string) => void;
  onPostAll: () => void;
  onReviewAll: () => void;
  onSaveDraft: () => void;
  onUpdateGroup: (group: PhotoGroup) => void;
  onRetryAnalysis: (groupId: string) => void;
  onIndividualReviewNext: () => void;
  onIndividualReviewBack: () => void;
  onIndividualReviewSkip: () => void;
  onIndividualReviewApprove: (group: PhotoGroup) => void;
  onIndividualReviewReject: () => void;
  onIndividualSaveDraft: (group: PhotoGroup) => void;
  onBack: () => void;
  setCurrentStep: (step: StepType) => void;
}

const BulkUploadStepRenderer = ({
  currentStep,
  photos,
  photoGroups,
  isGrouping,
  processingResults,
  currentReviewIndex,
  onPhotosUploaded,
  onStartGrouping,
  onGroupsConfirmed,
  onShippingComplete,
  onEditItem,
  onPreviewItem,
  onPostItem,
  onPostAll,
  onReviewAll,
  onSaveDraft,
  onUpdateGroup,
  onRetryAnalysis,
  onIndividualReviewNext,
  onIndividualReviewBack,
  onIndividualReviewSkip,
  onIndividualReviewApprove,
  onIndividualReviewReject,
  onIndividualSaveDraft,
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

    case 'processing':
      return (
        <BulkProcessingStatus
          photoGroups={photoGroups}
          results={processingResults}
          onComplete={() => setCurrentStep('review')}
          onBack={() => setCurrentStep('grouping')}
        />
      );

    case 'shipping':
      return (
        <BulkShippingReview
          photoGroups={photoGroups}
          onComplete={onShippingComplete}
          onBack={() => setCurrentStep('processing')}
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
          onReviewAll={onReviewAll}
          onSaveDraft={onSaveDraft}
          onUpdateGroup={onUpdateGroup}
          onRetryAnalysis={onRetryAnalysis}
        />
      );

    case 'individual-review':
      return photoGroups[currentReviewIndex] ? (
        <IndividualItemReview
          group={photoGroups[currentReviewIndex]}
          currentIndex={currentReviewIndex}
          totalItems={photoGroups.length}
          onBack={onIndividualReviewBack}
          onNext={onIndividualReviewNext}
          onSkip={onIndividualReviewSkip}
          onApprove={onIndividualReviewApprove}
          onReject={onIndividualReviewReject}
          onSaveDraft={onIndividualSaveDraft}
        />
      ) : null;

    default:
      return null;
  }
};

export default BulkUploadStepRenderer;
