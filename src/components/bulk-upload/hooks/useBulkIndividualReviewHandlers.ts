
import { useToast } from '@/hooks/use-toast';
import { validateListingData, sanitizeListingData } from '@/utils/listingDataValidator';
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkIndividualReviewHandlers = (
  photoGroups: PhotoGroup[],
  setCurrentStep: (step: StepType) => void,
  setCurrentReviewIndex: (index: number) => void,
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void,
  currentReviewIndex: number
) => {
  const { toast } = useToast();

  const validateGroupForApproval = (group: PhotoGroup): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!group.listingData?.title?.trim()) {
      errors.push('Title is required');
    }
    
    if (!group.listingData?.price || group.listingData.price <= 0) {
      errors.push('Valid price is required');
    }
    
    if (!group.selectedShipping) {
      errors.push('Shipping option is required');
    }
    
    if (!group.listingData?.category?.trim()) {
      errors.push('Category is required');
    }
    
    if (!group.listingData?.condition?.trim()) {
      errors.push('Condition is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleIndividualReviewNext = () => {
    if (currentReviewIndex < photoGroups.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    } else {
      // Go back to review dashboard when finished
      setCurrentStep('review');
      toast({
        title: "Review Complete!",
        description: "All items have been reviewed. You can now post your listings.",
      });
    }
  };

  const handleIndividualReviewBack = () => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex(currentReviewIndex - 1);
    } else {
      setCurrentStep('review');
    }
  };

  const handleIndividualReviewSkip = () => {
    handleIndividualReviewNext();
  };

  const handleIndividualReviewApprove = (updatedGroup: PhotoGroup) => {
    const validation = validateGroupForApproval(updatedGroup);
    
    if (!validation.isValid) {
      toast({
        title: "Missing required fields",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }
    
    console.log('Approving group with data:', updatedGroup);
    
    setPhotoGroups(prev => {
      return prev.map(g => 
        g.id === updatedGroup.id 
          ? { 
              ...updatedGroup,
              status: 'completed' as const
            }
          : g
      );
    });
    
    // Check if this is the last item
    const isLastItem = currentReviewIndex === photoGroups.length - 1;
    
    if (isLastItem) {
      toast({
        title: "All items reviewed!",
        description: "Ready to post your listings.",
      });
      setCurrentStep('review');
    } else {
      handleIndividualReviewNext();
    }
  };

  const handleIndividualReviewReject = () => {
    const currentGroup = photoGroups[currentReviewIndex];
    if (currentGroup) {
      setPhotoGroups(prev => prev.map(g => 
        g.id === currentGroup.id ? { ...g, status: 'error' as const } : g
      ));
    }
    handleIndividualReviewNext();
  };

  const handleIndividualSaveDraft = (updatedGroup: PhotoGroup) => {
    if (!updatedGroup.listingData?.title?.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title before saving as draft.",
        variant: "destructive"
      });
      return;
    }

    console.log('Saving draft with data:', updatedGroup);

    setPhotoGroups(prev => prev.map(g => 
      g.id === updatedGroup.id 
        ? {
            ...updatedGroup,
            status: 'completed' as const
          }
        : g
    ));

    toast({
      title: "Draft saved!",
      description: "Item saved as draft successfully.",
    });

    // CRITICAL FIX: Return to review dashboard after saving draft
    setTimeout(() => {
      setCurrentStep('review');
    }, 1000);
  };

  return {
    handleIndividualReviewNext,
    handleIndividualReviewBack,
    handleIndividualReviewSkip,
    handleIndividualReviewApprove,
    handleIndividualReviewReject,
    handleIndividualSaveDraft
  };
};
