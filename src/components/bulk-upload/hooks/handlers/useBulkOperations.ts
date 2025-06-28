
import { useToast } from '@/hooks/use-toast';
import { useListingSave } from '@/hooks/useListingSave';
import type { PhotoGroup } from '../../BulkUploadManager';
import { sanitizeListingData } from '@/utils/listingDataValidator';
import { useBulkValidation } from '../validation/useBulkValidation';
import { useBulkItemActions } from './useBulkItemActions';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkOperations = (
  photoGroups: PhotoGroup[],
  setCurrentStep: (step: StepType) => void,
  setCurrentReviewIndex: (index: number) => void,
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void,
  onComplete: (results: any[]) => void
) => {
  const { toast } = useToast();
  const { saveListing } = useListingSave();
  const { validateGroupForSave, validateGroupForDraft } = useBulkValidation();
  const { ensureListingData } = useBulkItemActions(photoGroups, setCurrentStep, setCurrentReviewIndex, setPhotoGroups);

  const handlePostAll = async () => {
    const readyItems = photoGroups.filter(g => {
      const validation = validateGroupForSave(g);
      return validation.isValid && !g.isPosted && g.status === 'completed';
    });
    
    console.log('Ready items for posting:', readyItems.length);
    
    if (readyItems.length === 0) {
      const incompleteItems = photoGroups.filter(g => !g.isPosted);
      const validationErrors = incompleteItems.map(g => {
        const validation = validateGroupForSave(g);
        return validation.errors;
      }).flat();
      
      toast({
        title: "No items ready to post",
        description: `Please complete: ${[...new Set(validationErrors)].join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Creating listings...",
      description: `Processing ${readyItems.length} item${readyItems.length > 1 ? 's' : ''}...`,
    });

    let successCount = 0;
    const savedListings = [];

    for (const item of readyItems) {
      try {
        // Ensure all required data is present
        const completeListingData = ensureListingData(item.listingData);
        
        // Make sure weight is properly set (required for shipping)
        if (!completeListingData.measurements.weight) {
          completeListingData.measurements.weight = '1'; // Default weight if missing
        }
        
        const listingData = sanitizeListingData(completeListingData);
        const shippingCost = item.selectedShipping?.cost || 0;
        
        console.log('Saving listing:', listingData.title, 'with shipping cost:', shippingCost);
        
        const result = await saveListing(
          listingData,
          shippingCost,
          'active'
        );

        if (result.success) {
          successCount++;
          savedListings.push({ ...item, listingId: result.listingId });
          
          setPhotoGroups(prev => prev.map(g => 
            g.id === item.id
              ? { ...g, isPosted: true, listingId: result.listingId, status: 'completed' as const }
              : g
          ));
        } else {
          console.error('Failed to save listing (no success):', item.listingData?.title);
        }
      } catch (error) {
        console.error(`Failed to save ${item.listingData?.title || item.name}:`, error);
        toast({
          title: "Error saving item",
          description: `Failed to save "${item.listingData?.title || item.name}": ${error.message}`,
          variant: "destructive"
        });
      }
    }

    console.log('Bulk save complete. Success count:', successCount);

    if (successCount > 0) {
      toast({
        title: "Bulk upload complete!",
        description: `Successfully created ${successCount} listing${successCount > 1 ? 's' : ''}!`,
      });
      
      // Complete the process
      onComplete(savedListings);
      
      setTimeout(() => {
        window.location.href = '/inventory';
      }, 1500);
    } else {
      toast({
        title: "Upload failed",
        description: "Failed to create any listings. Please check your data and try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveDraft = async () => {
    const draftItems = photoGroups.filter(g => {
      const validation = validateGroupForDraft(g);
      return validation.isValid && !g.isPosted;
    });
    
    console.log('Draft items:', draftItems.length);
    
    if (draftItems.length === 0) {
      toast({
        title: "No items to save",
        description: "Please complete at least the title for items to save as drafts.",
        variant: "destructive"
      });
      return;
    }

    let successCount = 0;

    for (const item of draftItems) {
      try {
        const completeListingData = ensureListingData(item.listingData);
        const listingData = sanitizeListingData(completeListingData);
        const result = await saveListing(
          listingData,
          item.selectedShipping?.cost || 0,
          'draft'
        );

        if (result.success) {
          successCount++;
          setPhotoGroups(prev => prev.map(g => 
            g.id === item.id
              ? { ...g, listingId: result.listingId, status: 'completed' as const }
              : g
          ));
        }
      } catch (error) {
        console.error(`Failed to save draft for ${item.listingData?.title || item.name}:`, error);
      }
    }

    toast({
      title: successCount > 0 ? "Drafts saved!" : "Save failed",
      description: successCount > 0 
        ? `Saved ${successCount} item${successCount > 1 ? 's' : ''} as draft${successCount > 1 ? 's' : ''}`
        : "Failed to save drafts. Please try again.",
      variant: successCount > 0 ? "default" : "destructive"
    });
  };

  return {
    handlePostAll,
    handleSaveDraft
  };
};
