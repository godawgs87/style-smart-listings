
import { useToast } from '@/hooks/use-toast';
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'review';

export const useBulkGroupingHandlers = (
  photos: File[],
  setIsGrouping: (loading: boolean) => void,
  setCurrentStep: (step: StepType) => void,
  setPhotoGroups: (groups: PhotoGroup[]) => void
) => {
  const { toast } = useToast();

  const handleStartGrouping = async () => {
    if (photos.length === 0) {
      toast({
        title: "No photos uploaded",
        description: "Please upload photos first.",
        variant: "destructive"
      });
      return;
    }

    setIsGrouping(true);
    
    // Create groups from photos (simplified AI grouping simulation)
    const groups: PhotoGroup[] = photos.map((photo, index) => ({
      id: `group-${index}`,
      photos: [photo],
      name: `Item ${index + 1}`,
      confidence: 'medium' as const,
      status: 'pending' as const,
      aiSuggestion: `Detected item from photo ${index + 1}`
    }));

    // Simulate grouping delay
    setTimeout(() => {
      setPhotoGroups(groups);
      setIsGrouping(false);
      // Go directly to review step which will show table view by default
      setCurrentStep('review');
      
      toast({
        title: "Photos grouped!",
        description: `Created ${groups.length} item groups. Ready for AI analysis.`,
      });
    }, 2000);
  };

  const handleGroupsConfirmed = (confirmedGroups: PhotoGroup[]) => {
    setPhotoGroups(confirmedGroups);
    // Go directly to review step instead of processing
    setCurrentStep('review');
  };

  return {
    handleStartGrouping,
    handleGroupsConfirmed
  };
};
