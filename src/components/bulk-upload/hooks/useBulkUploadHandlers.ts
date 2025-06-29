
import { useBulkGroupingHandlers } from './useBulkGroupingHandlers';
import { useBulkProcessingHandlers } from './useBulkProcessingHandlers';
import { useBulkOperations } from './handlers/useBulkOperations';
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
  onComplete: (results: any[]) => void,
  currentReviewIndex: number
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

  // Bulk operations
  const { postSingleItem, handleSaveDraft } = useBulkOperations();

  // Simplified handlers for the table view
  const handleEditItem = (groupId: string) => {
    console.log('Edit item:', groupId);
    // Navigate to individual edit - simplified
  };

  const handlePreviewItem = (groupId: string) => {
    console.log('Preview item:', groupId);
    // Open preview dialog - handled by parent component
  };

  const handlePostItem = async (groupId: string) => {
    const group = photoGroups.find(g => g.id === groupId);
    if (group) {
      const result = await postSingleItem(group);
      if (result.success) {
        setPhotoGroups(prev => prev.map(g => 
          g.id === groupId ? { ...g, isPosted: true, listingId: result.listingId } : g
        ));
      }
    }
  };

  const handlePostAll = async () => {
    const readyGroups = photoGroups.filter(g => g.status === 'completed' && g.selectedShipping && !g.isPosted);
    for (const group of readyGroups) {
      await handlePostItem(group.id);
    }
  };

  const handleUpdateGroup = (updatedGroup: PhotoGroup) => {
    setPhotoGroups(prev => prev.map(g => 
      g.id === updatedGroup.id ? updatedGroup : g
    ));
  };

  const handleRetryAnalysis = (groupId: string) => {
    setPhotoGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, status: 'processing' as const } : g
    ));
    
    // Simulate AI retry
    setTimeout(() => {
      setPhotoGroups(prev => prev.map(g => 
        g.id === groupId ? { ...g, status: 'completed' as const } : g
      ));
    }, 3000);
  };

  return {
    handleStartGrouping,
    handleGroupsConfirmed,
    handleEditItem,
    handlePreviewItem,
    handlePostItem,
    handlePostAll,
    handleUpdateGroup,
    handleRetryAnalysis,
    handleSaveDraft
  };
};
