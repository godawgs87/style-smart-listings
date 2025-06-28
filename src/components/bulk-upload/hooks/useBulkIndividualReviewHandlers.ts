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
    console.log('⏭️ Individual review next clicked, current index:', currentReviewIndex);
    if (currentReviewIndex < photoGroups.length - 1) {
      const nextIndex = currentReviewIndex + 1;
      console.log('Moving to next item:', nextIndex);
      setCurrentReviewIndex(nextIndex);
    } else {
      console.log('Reached end, returning to review dashboard');
      setCurrentStep('review');
    }
  };

  const handleIndividualReviewBack = () => {
    console.log('⏮️ Individual review back clicked, current index:', currentReviewIndex);
    if (currentReviewIndex > 0) {
      const prevIndex = currentReviewIndex - 1;
      console.log('Moving to previous item:', prevIndex);
      setCurrentReviewIndex(prevIndex);
    } else {
      console.log('At beginning, returning to review dashboard');
      setCurrentStep('review');
    }
  };

  const handleIndividualReviewSkip = () => {
    console.log('⏭️ Individual review skip clicked');
    handleIndividualReviewNext();
  };

  const handleIndividualReviewApprove = (updatedGroup: PhotoGroup) => {
    console.log('✅ Individual review approve clicked for group:', updatedGroup.id);
    console.log('Updated group data:', updatedGroup);
    
    // Update the specific group in the array with completed status
    setPhotoGroups(prev => {
      const updated = prev.map(g => 
        g.id === updatedGroup.id 
          ? { 
              ...updatedGroup, 
              status: 'completed' as const,
              // Ensure all data is preserved
              listingData: {
                ...g.listingData,
                ...updatedGroup.listingData
              },
              selectedShipping: updatedGroup.selectedShipping || g.selectedShipping
            }
          : g
      );
      console.log('Updated photo groups after approve:', updated);
      return updated;
    });
    
    // Move to next item
    handleIndividualReviewNext();
  };

  const handleIndividualReviewReject = () => {
    console.log('❌ Individual review reject clicked');
    const currentGroup = photoGroups[currentReviewIndex];
    if (currentGroup) {
      console.log('Rejecting group:', currentGroup.id);
      setPhotoGroups(prev => prev.map(g => 
        g.id === currentGroup.id ? { ...g, status: 'error' as const } : g
      ));
    }
    handleIndividualReviewNext();
  };

  const handleIndividualSaveDraft = (updatedGroup: PhotoGroup) => {
    console.log('💾 Individual review save draft clicked for group:', updatedGroup.id);
    console.log('Saving draft data:', updatedGroup);
    
    // Update the group with all the edited data but keep status as is
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
