
import { useToast } from '@/hooks/use-toast';
import type { PhotoGroup } from '../BulkUploadManager';
import { useBulkItemActions } from './handlers/useBulkItemActions';
import { useBulkOperations } from './handlers/useBulkOperations';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkReviewHandlers = (
  photoGroups: PhotoGroup[],
  setCurrentStep: (step: StepType) => void,
  setCurrentReviewIndex: (index: number) => void,
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void,
  onComplete: (results: any[]) => void
) => {
  const { toast } = useToast();

  const {
    handleEditItem,
    handlePreviewItem,
    handlePostItem
  } = useBulkItemActions(photoGroups, setCurrentStep, setCurrentReviewIndex, setPhotoGroups);

  const {
    handlePostAll,
    handleSaveDraft: saveSingleDraft
  } = useBulkOperations();

  const handleReviewAll = () => {
    setCurrentReviewIndex(0);
    setCurrentStep('individual-review');
  };

  const handleUpdateGroup = (updatedGroup: PhotoGroup) => {
    console.log('Updating group:', updatedGroup.id, updatedGroup);
    setPhotoGroups(prev => prev.map(g => 
      g.id === updatedGroup.id ? updatedGroup : g
    ));
  };

  const handleRetryAnalysis = (groupId: string) => {
    setPhotoGroups(prev => prev.map(g => 
      g.id === groupId 
        ? { ...g, status: 'processing' as const }
        : g
    ));
    
    setTimeout(() => {
      setPhotoGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { 
              ...g, 
              status: 'completed' as const,
              listingData: {
                ...g.listingData,
                title: g.listingData?.title || `${g.name} - Analysis Complete`,
                price: g.listingData?.price || 25,
                condition: g.listingData?.condition || 'Good',
                category: g.listingData?.category || 'Miscellaneous',
                measurements: g.listingData?.measurements || {
                  length: '12',
                  width: '8',
                  height: '4',
                  weight: '1'
                }
              }
            }
          : g
      ));

      toast({
        title: "Analysis complete!",
        description: "Item analysis has been completed successfully.",
      });
    }, 2000);
  };

  // Generic save draft function that saves all items as drafts
  const handleSaveDraft = async () => {
    console.log('Saving all items as drafts...');
    let successes = 0;
    let failures = 0;

    for (const group of photoGroups) {
      try {
        const result = await saveSingleDraft(group);
        if (result.success) {
          successes++;
        } else {
          failures++;
        }
      } catch (error) {
        console.error('Failed to save draft for group:', group.id, error);
        failures++;
      }
    }

    toast({
      title: "Draft Save Complete",
      description: `Saved ${successes} drafts${failures > 0 ? `, ${failures} failed` : ''}`,
      variant: successes === photoGroups.length ? "default" : "destructive"
    });
  };

  return {
    handleEditItem,
    handlePreviewItem,
    handlePostItem,
    handlePostAll: () => handlePostAll(photoGroups),
    handleReviewAll,
    handleSaveDraft,
    handleUpdateGroup,
    handleRetryAnalysis
  };
};
