
import { useToast } from '@/hooks/use-toast';
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
    // Validate required fields
    if (!updatedGroup.listingData?.title || !updatedGroup.listingData?.price) {
      toast({
        title: "Missing required fields",
        description: "Please fill in Title and Price before approving.",
        variant: "destructive"
      });
      return;
    }

    // Validate shipping selection (unless local pickup)
    if (!updatedGroup.selectedShipping) {
      toast({
        title: "Missing shipping option",
        description: "Please select a shipping option before approving.",
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
    if (!updatedGroup.listingData?.title) {
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
            status: 'completed' as const  // Mark as completed even for drafts
          }
        : g
    ));

    toast({
      title: "Draft saved!",
      description: "Item saved as draft successfully.",
    });
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
