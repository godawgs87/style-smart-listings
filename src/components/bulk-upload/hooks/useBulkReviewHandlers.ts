import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkReviewHandlers = (
  photoGroups: PhotoGroup[],
  setCurrentStep: (step: StepType) => void,
  setCurrentReviewIndex: (index: number) => void,
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void,
  onComplete: (results: any[]) => void
) => {
  const handleEditItem = (groupId: string) => {
    console.log('🔧 useBulkReviewHandlers - Edit item:', groupId);
    const groupIndex = photoGroups.findIndex(g => g.id === groupId);
    console.log('Found group at index:', groupIndex);
    if (groupIndex >= 0) {
      setCurrentReviewIndex(groupIndex);
      setCurrentStep('individual-review');
    }
  };

  const handlePreviewItem = (groupId: string) => {
    console.log('👁️ useBulkReviewHandlers - Preview item:', groupId);
    // TODO: Implement preview functionality
  };

  const handlePostItem = (groupId: string) => {
    console.log('📤 useBulkReviewHandlers - Post item:', groupId);
    const groupToPost = photoGroups.find(g => g.id === groupId);
    if (groupToPost) {
      console.log('Posting single item:', groupToPost);
      
      // Mark as posted but keep in the array for tracking
      setPhotoGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, status: 'completed' as const, isPosted: true }
          : g
      ));
      
      // Don't remove from array - just mark as posted
      console.log('Item marked as posted:', groupId);
    }
  };

  const handlePostAll = () => {
    console.log('📤📤 useBulkReviewHandlers - Post all clicked');
    const readyItems = photoGroups.filter(g => g.status === 'completed' && g.selectedShipping);
    console.log('Ready items to post:', readyItems);
    
    if (readyItems.length > 0) {
      // Mark all ready items as posted
      setPhotoGroups(prev => prev.map(g => 
        (g.status === 'completed' && g.selectedShipping)
          ? { ...g, isPosted: true }
          : g
      ));
      
      console.log('All ready items marked as posted');
      
      // Call completion callback with results
      onComplete(readyItems);
    }
  };

  const handleReviewAll = () => {
    console.log('👁️👁️ useBulkReviewHandlers - Review all clicked');
    setCurrentReviewIndex(0);
    setCurrentStep('individual-review');
  };

  const handleSaveDraft = () => {
    console.log('💾 useBulkReviewHandlers - Save draft clicked');
    // TODO: Implement draft saving functionality
    console.log('Draft saved for all items');
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
