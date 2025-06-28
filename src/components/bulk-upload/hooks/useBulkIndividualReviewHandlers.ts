
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkIndividualReviewHandlers = (
  photoGroups: PhotoGroup[],
  setCurrentStep: (step: StepType) => void,
  setCurrentReviewIndex: (index: number) => void,
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void,
  currentReviewIndex: number
) => {
  const handleIndividualReviewNext = () => {
    if (currentReviewIndex < photoGroups.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    } else {
      setCurrentStep('review');
    }
  };

  const handleIndividualReviewBack = () => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex(currentReviewIndex - 1);
    } else {
      setCurrentStep('review');
    }
  };

  const handleIndividualReviewSkip = () => {
    handleIndividualReviewNext();
  };

  const handleIndividualReviewApprove = (updatedGroup: PhotoGroup) => {
    if (!updatedGroup.listingData?.title || !updatedGroup.listingData?.price || !updatedGroup.selectedShipping) {
      alert('Please fill in all required fields: Title, Price, and Shipping option');
      return;
    }
    
    setPhotoGroups(prev => {
      return prev.map(g => 
        g.id === updatedGroup.id 
          ? { 
              ...g,
              ...updatedGroup,
              status: 'completed' as const,
              listingData: {
                ...g.listingData,
                ...updatedGroup.listingData
              },
              selectedShipping: updatedGroup.selectedShipping
            }
          : g
      );
    });
    
    handleIndividualReviewNext();
  };

  const handleIndividualReviewReject = () => {
    const currentGroup = photoGroups[currentReviewIndex];
    if (currentGroup) {
      setPhotoGroups(prev => prev.map(g => 
        g.id === currentGroup.id ? { ...g, status: 'error' as const } : g
      ));
    }
    handleIndividualReviewNext();
  };

  const handleIndividualSaveDraft = (updatedGroup: PhotoGroup) => {
    setPhotoGroups(prev => prev.map(g => 
      g.id === updatedGroup.id 
        ? {
            ...g,
            ...updatedGroup,
            listingData: {
              ...g.listingData,
              ...updatedGroup.listingData
            },
            selectedShipping: updatedGroup.selectedShipping || g.selectedShipping
          }
        : g
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
