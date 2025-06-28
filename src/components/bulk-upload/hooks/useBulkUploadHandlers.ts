
import { useBulkGroupingHandlers } from './useBulkGroupingHandlers';
import { useBulkProcessingHandlers } from './useBulkProcessingHandlers';
import { useBulkReviewHandlers } from './useBulkReviewHandlers';
import { useBulkIndividualReviewHandlers } from './useBulkIndividualReviewHandlers';
import { useBulkShippingHandlers } from './useBulkShippingHandlers';
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkUploadHandlers = (
  photos: File[],
  photoGroups: PhotoGroup[],
  setIsGrouping: (loading: boolean) => void,
  setCurrentStep: (step: StepType) => void,
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void,
  setProcessingResults: (results: any[]) => void,
  setCurrentReviewIndex: (index: number) => void,
  onComplete: (results: any[]) => void
) => {
  // Grouping handlers
  const { handleStartGrouping, handleGroupsConfirmed } = useBulkGroupingHandlers(
    photos,
    setIsGrouping,
    setCurrentStep,
    setPhotoGroups
  );

  // Processing handlers
  const { processAllGroupsWithAI } = useBulkProcessingHandlers(
    setPhotoGroups,
    setProcessingResults,
    setCurrentStep
  );

  // Review handlers
  const {
    handleEditItem,
    handlePreviewItem,
    handlePostItem,
    handlePostAll,
    handleReviewAll,
    handleSaveDraft
  } = useBulkReviewHandlers(
    photoGroups,
    setCurrentStep,
    setCurrentReviewIndex,
    setPhotoGroups,
    onComplete
  );

  // Individual review handlers
  const {
    handleIndividualReviewNext,
    handleIndividualReviewBack,
    handleIndividualReviewSkip,
    handleIndividualReviewApprove,
    handleIndividualReviewReject,
    handleIndividualSaveDraft
  } = useBulkIndividualReviewHandlers(
    photoGroups,
    setCurrentStep,
    setCurrentReviewIndex,
    setPhotoGroups
  );

  // Shipping handlers
  const { handleShippingComplete } = useBulkShippingHandlers(
    setPhotoGroups,
    setCurrentStep
  );

  // Enhanced groups confirmed handler that triggers processing
  const handleGroupsConfirmedWithProcessing = (confirmedGroups: PhotoGroup[]) => {
    handleGroupsConfirmed(confirmedGroups);
    processAllGroupsWithAI(confirmedGroups);
  };

  return {
    handleStartGrouping,
    handleGroupsConfirmed: handleGroupsConfirmedWithProcessing,
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
  };
};
