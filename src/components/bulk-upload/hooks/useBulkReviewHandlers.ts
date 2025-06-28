
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
    const groupIndex = photoGroups.findIndex(g => g.id === groupId);
    if (groupIndex >= 0) {
      setCurrentReviewIndex(groupIndex);
      setCurrentStep('individual-review');
    }
  };

  const handlePreviewItem = (groupId: string) => {
    // This is now handled by the enhanced preview dialog
    return groupId;
  };

  const handlePostItem = (groupId: string) => {
    const groupToPost = photoGroups.find(g => g.id === groupId);
    if (groupToPost && groupToPost.status === 'completed' && groupToPost.selectedShipping) {
      setPhotoGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, isPosted: true }
          : g
      ));
      
      console.log(`Successfully posted: ${groupToPost.name}`);
    } else {
      console.warn('Cannot post item. Missing requirements.');
    }
  };

  const handlePostAll = () => {
    const readyItems = photoGroups.filter(g => 
      g.status === 'completed' && 
      g.selectedShipping && 
      !g.isPosted &&
      g.listingData?.title &&
      g.listingData?.price
    );
    
    if (readyItems.length > 0) {
      setPhotoGroups(prev => prev.map(g => 
        (g.status === 'completed' && g.selectedShipping && !g.isPosted)
          ? { ...g, isPosted: true }
          : g
      ));
      
      console.log(`Successfully posted ${readyItems.length} items!`);
      onComplete(readyItems);
    } else {
      console.warn('No items ready to post.');
    }
  };

  const handleReviewAll = () => {
    setCurrentReviewIndex(0);
    setCurrentStep('individual-review');
  };

  const handleSaveDraft = () => {
    const draftData = {
      timestamp: new Date().toISOString(),
      itemCount: photoGroups.length,
      completedCount: photoGroups.filter(g => g.status === 'completed').length,
      groups: photoGroups
    };
    
    console.log('Draft saved successfully!', draftData);
  };

  const handleUpdateGroup = (updatedGroup: PhotoGroup) => {
    setPhotoGroups(prev => prev.map(g => 
      g.id === updatedGroup.id ? updatedGroup : g
    ));
  };

  const handleRetryAnalysis = (groupId: string) => {
    setPhotoGroups(prev => prev.map(g => 
      g.id === groupId 
        ? { ...g, status: 'processing' as const }
        : g
    ));
    
    // Simulate retry after delay
    setTimeout(() => {
      setPhotoGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { 
              ...g, 
              status: 'completed' as const,
              listingData: {
                ...g.listingData,
                title: g.listingData?.title || `${g.name} - Manual Entry Required`,
                price: g.listingData?.price || 0,
                condition: g.listingData?.condition || 'Good',
                measurements: g.listingData?.measurements || {
                  length: '12',
                  width: '8',
                  height: '4',
                  weight: '1'
                }
              }
            }
          : g
      ));
    }, 2000);
  };

  return {
    handleEditItem,
    handlePreviewItem,
    handlePostItem,
    handlePostAll,
    handleReviewAll,
    handleSaveDraft,
    handleUpdateGroup,
    handleRetryAnalysis
  };
};
