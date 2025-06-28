
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkGroupingHandlers = (
  photos: File[],
  setIsGrouping: (loading: boolean) => void,
  setCurrentStep: (step: StepType) => void,
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void
) => {
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
  };

  return {
    handleStartGrouping,
    handleGroupsConfirmed
  };
};
