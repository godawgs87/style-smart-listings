
import { simulateAIGrouping, generateListingData } from '../utils/aiSimulation';
import { generateShippingOptions } from '../utils/shippingCalculator';
import type { PhotoGroup } from '../BulkUploadManager';

export const useBulkUploadHandlers = (
  photos: File[],
  photoGroups: PhotoGroup[],
  setIsGrouping: (loading: boolean) => void,
  setCurrentStep: (step: string) => void,
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void,
  setProcessingResults: (results: any[]) => void,
  setCurrentReviewIndex: (index: number) => void,
  onComplete: (results: any[]) => void
) => {
  const handleStartGrouping = async () => {
    if (photos.length === 0) return;
    
    setIsGrouping(true);
    setCurrentStep('grouping');
    
    try {
      const groups = await simulateAIGrouping(photos);
      setPhotoGroups(groups);
    } catch (error) {
      console.error('Grouping failed:', error);
    } finally {
      setIsGrouping(false);
    }
  };

  const handleGroupsConfirmed = (confirmedGroups: PhotoGroup[]) => {
    setPhotoGroups(confirmedGroups);
    setCurrentStep('processing');
    processAllGroups(confirmedGroups);
  };

  const processAllGroups = async (groups: PhotoGroup[]) => {
    const results: any[] = [];
    
    for (const group of groups) {
      setPhotoGroups(prev => prev.map(g => 
        g.id === group.id ? { ...g, status: 'processing' } : g
      ));
      
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const listingData = generateListingData(group);
        const weight = listingData.measurements.weight;
        const shippingOptions = generateShippingOptions(weight);
        
        const result = {
          groupId: group.id,
          title: group.name,
          status: 'completed',
          listingData,
          shippingOptions
        };
        
        results.push(result);
        
        setPhotoGroups(prev => prev.map(g => 
          g.id === group.id ? { 
            ...g, 
            status: 'completed',
            listingData,
            shippingOptions
          } : g
        ));
        
      } catch (error) {
        setPhotoGroups(prev => prev.map(g => 
          g.id === group.id ? { ...g, status: 'error' } : g
        ));
      }
    }
    
    setProcessingResults(results);
    setTimeout(() => setCurrentStep('review'), 1000);
  };

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
    const currentGroup = photoGroups[0]; // This should be currentReviewIndex
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

  const handleShippingComplete = (groupsWithShipping: PhotoGroup[]) => {
    setPhotoGroups(groupsWithShipping);
    setCurrentStep('review');
  };

  return {
    handleStartGrouping,
    handleGroupsConfirmed,
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
