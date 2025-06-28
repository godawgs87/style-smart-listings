
import { useToast } from '@/hooks/use-toast';
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

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
      setCurrentStep('grouping');
      
      toast({
        title: "Photos grouped!",
        description: `Created ${groups.length} item groups.`,
      });
    }, 2000);
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
