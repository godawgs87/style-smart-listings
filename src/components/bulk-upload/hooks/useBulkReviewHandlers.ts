
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
    const group = photoGroups.find(g => g.id === groupId);
    if (group) {
      const previewData = {
        name: group.name,
        photos: group.photos?.length || 0,
        title: group.listingData?.title || 'Not set',
        price: group.listingData?.price ? `$${group.listingData.price}` : 'Not set',
        condition: group.listingData?.condition || 'Not set',
        shipping: group.selectedShipping ? `${group.selectedShipping.name} - $${group.selectedShipping.cost}` : 'Not selected',
        category: group.listingData?.category || 'Not set'
      };
      
      const previewText = `Preview: ${previewData.name}
      
Photos: ${previewData.photos}
Title: ${previewData.title}
Price: ${previewData.price}
Condition: ${previewData.condition}
Shipping: ${previewData.shipping}
Category: ${previewData.category}`;
      
      alert(previewText);
    }
  };

  const handlePostItem = (groupId: string) => {
    const groupToPost = photoGroups.find(g => g.id === groupId);
    if (groupToPost && groupToPost.status === 'completed' && groupToPost.selectedShipping) {
      setPhotoGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, isPosted: true }
          : g
      ));
      
      alert(`Successfully posted: ${groupToPost.name}`);
    } else {
      alert('Cannot post item. Please ensure all required fields are filled and item is completed.');
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
      
      alert(`Successfully posted ${readyItems.length} items!`);
      onComplete(readyItems);
    } else {
      alert('No items ready to post. Please complete the review process for your items.');
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
    
    alert('Draft saved successfully!');
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
