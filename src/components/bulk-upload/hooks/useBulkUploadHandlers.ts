
import { usePhotoAnalysis } from '@/hooks/usePhotoAnalysis';
import { generateShippingOptions } from '../utils/shippingCalculator';
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
  onComplete: (results: any[]) => void
) => {
  const { analyzePhotos } = usePhotoAnalysis();

  const handleStartGrouping = async () => {
    if (photos.length === 0) return;
    
    setIsGrouping(true);
    setCurrentStep('grouping');
    
    try {
      // Create groups of 3-5 photos each for analysis
      const groups: PhotoGroup[] = [];
      let currentIndex = 0;
      
      while (currentIndex < photos.length) {
        const groupSize = Math.min(3 + Math.floor(Math.random() * 3), photos.length - currentIndex);
        const groupPhotos = photos.slice(currentIndex, currentIndex + groupSize);
        
        groups.push({
          id: `group-${groups.length + 1}`,
          photos: groupPhotos,
          name: `Item ${groups.length + 1}`,
          confidence: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          status: 'pending',
          aiSuggestion: `Analyzing ${groupPhotos.length} photos...`
        });
        
        currentIndex += groupSize;
      }
      
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
    processAllGroupsWithAI(confirmedGroups);
  };

  const processAllGroupsWithAI = async (groups: PhotoGroup[]) => {
    const results: any[] = [];
    
    for (const group of groups) {
      setPhotoGroups(prev => prev.map(g => 
        g.id === group.id ? { ...g, status: 'processing', aiSuggestion: 'Analyzing with AI...' } : g
      ));
      
      try {
        console.log(`Analyzing group ${group.id} with ${group.photos.length} photos`);
        
        // Use real AI analysis for each group
        const listingData = await analyzePhotos(group.photos);
        
        if (listingData) {
          const weight = listingData.measurements?.weight || 1;
          const shippingOptions = generateShippingOptions(weight);
          
          const result = {
            groupId: group.id,
            title: listingData.title || group.name,
            status: 'completed',
            listingData,
            shippingOptions
          };
          
          results.push(result);
          
          setPhotoGroups(prev => prev.map(g => 
            g.id === group.id ? { 
              ...g, 
              status: 'completed',
              name: listingData.title || group.name,
              listingData,
              shippingOptions,
              aiSuggestion: `✅ AI Analysis Complete: ${listingData.title}`
            } : g
          ));
        } else {
          // Handle analysis failure
          setPhotoGroups(prev => prev.map(g => 
            g.id === group.id ? { 
              ...g, 
              status: 'error',
              aiSuggestion: '❌ AI Analysis Failed'
            } : g
          ));
        }
        
      } catch (error) {
        console.error(`Analysis failed for group ${group.id}:`, error);
        setPhotoGroups(prev => prev.map(g => 
          g.id === group.id ? { 
            ...g, 
            status: 'error',
            aiSuggestion: '❌ Analysis Error'
          } : g
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
