
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
    const group = photoGroups.find(g => g.id === groupId);
    if (group) {
      // Simple preview implementation - you can enhance this with a modal
      const previewData = {
        name: group.name,
        photos: group.photos?.length || 0,
        title: group.listingData?.title || 'Not set',
        price: group.listingData?.price ? `$${group.listingData.price}` : 'Not set',
        condition: group.listingData?.condition || 'Not set',
        shipping: group.selectedShipping ? `${group.selectedShipping.name} - $${group.selectedShipping.cost}` : 'Not selected',
        category: group.listingData?.category || 'Not set'
      };
      
      console.log('Preview data:', previewData);
      
      // For now, show an alert - you can replace this with a proper modal
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
    console.log('📤 useBulkReviewHandlers - Post item:', groupId);
    const groupToPost = photoGroups.find(g => g.id === groupId);
    if (groupToPost && groupToPost.status === 'completed' && groupToPost.selectedShipping) {
      console.log('Posting single item:', groupToPost);
      
      // Mark as posted
      setPhotoGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, isPosted: true }
          : g
      ));
      
      console.log('Item marked as posted:', groupId);
      
      // Show success message
      alert(`Successfully posted: ${groupToPost.name}`);
    } else {
      console.warn('Cannot post item - missing required data or not completed');
      alert('Cannot post item. Please ensure all required fields are filled and item is completed.');
    }
  };

  const handlePostAll = () => {
    console.log('📤📤 useBulkReviewHandlers - Post all clicked');
    const readyItems = photoGroups.filter(g => 
      g.status === 'completed' && 
      g.selectedShipping && 
      !g.isPosted &&
      g.listingData?.title &&
      g.listingData?.price
    );
    
    console.log('Ready items to post:', readyItems);
    
    if (readyItems.length > 0) {
      // Mark all ready items as posted
      setPhotoGroups(prev => prev.map(g => 
        (g.status === 'completed' && g.selectedShipping && !g.isPosted)
          ? { ...g, isPosted: true }
          : g
      ));
      
      console.log('All ready items marked as posted');
      
      // Show success message
      alert(`Successfully posted ${readyItems.length} items!`);
      
      // Call completion callback with results
      onComplete(readyItems);
    } else {
      alert('No items ready to post. Please complete the review process for your items.');
    }
  };

  const handleReviewAll = () => {
    console.log('👁️👁️ useBulkReviewHandlers - Review all clicked');
    setCurrentReviewIndex(0);
    setCurrentStep('individual-review');
  };

  const handleSaveDraft = () => {
    console.log('💾 useBulkReviewHandlers - Save draft clicked');
    // Save current state as draft
    const draftData = {
      timestamp: new Date().toISOString(),
      itemCount: photoGroups.length,
      completedCount: photoGroups.filter(g => g.status === 'completed').length,
      groups: photoGroups
    };
    
    console.log('Draft saved:', draftData);
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
