
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkReviewHandlers = (
  photoGroups: PhotoGroup[],
  setCurrentStep: (step: StepType) => void,
  setCurrentReviewIndex: (index: number) => void,
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void,
  onComplete: (results: any[]) => void
) => {
  // Review dashboard handlers
  const handleEditItem = (groupId: string) => {
    const groupIndex = photoGroups.findIndex(g => g.id === groupId);
    setCurrentReviewIndex(groupIndex);
    setCurrentStep('individual-review');
  };

  const handlePreviewItem = (groupId: string) => {
    console.log('Preview item:', groupId);
  };

  const handlePostItem = (groupId: string) => {
    console.log('Post item:', groupId);
  };

  const handlePostAll = () => {
    const readyItems = photoGroups.filter(g => g.status === 'completed' && g.selectedShipping);
    console.log('Posting all ready items:', readyItems);
    onComplete(readyItems);
  };

  const handleReviewAll = () => {
    setCurrentReviewIndex(0);
    setCurrentStep('individual-review');
  };

  const handleSaveDraft = () => {
    console.log('Saving draft...');
  };

  return {
    handleEditItem,
    handlePreviewItem,
    handlePostItem,
    handlePostAll,
    handleReviewAll,
    handleSaveDraft
  };
};
