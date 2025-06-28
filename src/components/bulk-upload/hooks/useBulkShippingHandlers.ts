
import { useToast } from '@/hooks/use-toast';
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkShippingHandlers = (
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void,
  setCurrentStep: (step: StepType) => void
) => {
  const { toast } = useToast();

  const handleShippingComplete = (groupsWithShipping: PhotoGroup[]) => {
    console.log('Completing shipping for', groupsWithShipping.length, 'groups');
    
    setPhotoGroups(groupsWithShipping);
    setCurrentStep('review');
    
    toast({
      title: "Shipping configured!",
      description: `Ready to review ${groupsWithShipping.length} listings.`,
    });
  };

  return {
    handleShippingComplete
  };
};
