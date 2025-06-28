
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkIndividualReviewHandlers = (
  photoGroups: PhotoGroup[],
  setCurrentStep: (step: StepType) => void,
  setCurrentReviewIndex: (index: number) => void,
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void
) => {
  // Individual review handlers
  const handleIndividualReviewNext = () => {
    const currentIndex = photoGroups.findIndex(g => g.id === photoGroups[0]?.id);
    if (currentIndex < photoGroups.length - 1) {
      setCurrentReviewIndex(currentIndex + 1);
    } else {
      setCurrentStep('review');
    }
  };

  const handleIndividualReviewBack = () => {
    const currentIndex = photoGroups.findIndex(g => g.id === photoGroups[0]?.id);
    if (currentIndex > 0) {
      setCurrentReviewIndex(currentIndex - 1);
    } else {
      setCurrentStep('review');
    }
  };

  const handleIndividualReviewSkip = () => {
    handleIndividualReviewNext();
  };

  const handleIndividualReviewApprove = (updatedGroup: PhotoGroup) => {
    setPhotoGroups(prev => prev.map(g => 
      g.id === updatedGroup.id ? updatedGroup : g
    ));
    handleIndividualReviewNext();
  };

  const handleIndividualReviewReject = () => {
    const currentGroup = photoGroups[0];
    setPhotoGroups(prev => prev.map(g => 
      g.id === currentGroup?.id ? { ...g, status: 'error' } : g
    ));
    handleIndividualReviewNext();
  };

  const handleIndividualSaveDraft = (updatedGroup: PhotoGroup) => {
    setPhotoGroups(prev => prev.map(g => 
      g.id === updatedGroup.id ? updatedGroup : g
    ));
  };

  return {
    handleIndividualReviewNext,
    handleIndividualReviewBack,
    handleIndividualReviewSkip,
    handleIndividualReviewApprove,
    handleIndividualReviewReject,
    handleIndividualSaveDraft
  };
};
