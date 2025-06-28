
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkShippingHandlers = (
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void,
  setCurrentStep: (step: StepType) => void
) => {
  const handleShippingComplete = (groupsWithShipping: PhotoGroup[]) => {
    setPhotoGroups(groupsWithShipping);
    setCurrentStep('review');
  };

  return {
    handleShippingComplete
  };
};
