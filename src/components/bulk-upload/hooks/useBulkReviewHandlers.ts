
import { useToast } from '@/hooks/use-toast';
import { useListingSave } from '@/hooks/useListingSave';
import type { PhotoGroup } from '../BulkUploadManager';
import type { ListingData } from '@/types/CreateListing';
import { validateListingData, sanitizeListingData } from '@/utils/listingDataValidator';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkReviewHandlers = (
  photoGroups: PhotoGroup[],
  setCurrentStep: (step: StepType) => void,
  setCurrentReviewIndex: (index: number) => void,
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void,
  onComplete: (results: any[]) => void
) => {
  const { toast } = useToast();
  const { saveListing } = useListingSave();

  // Helper function to ensure ListingData matches single item format exactly
  const ensureListingData = (listingData?: PhotoGroup['listingData']): ListingData => {
    const baseData = listingData || {};
    
    return {
      title: baseData.title || '',
      description: baseData.description || '',
      price: baseData.price || 0,
      category: baseData.category || '',
      category_id: baseData.category_id || null,
      condition: baseData.condition || '',
      measurements: {
        length: baseData.measurements?.length ? String(baseData.measurements.length) : '',
        width: baseData.measurements?.width ? String(baseData.measurements.width) : '',
        height: baseData.measurements?.height ? String(baseData.measurements.height) : '',
        weight: baseData.measurements?.weight ? String(baseData.measurements.weight) : ''
      },
      photos: baseData.photos || [],
      keywords: baseData.keywords || [],
      priceResearch: baseData.priceResearch || '',
      purchase_price: baseData.purchase_price,
      purchase_date: baseData.purchase_date,
      source_location: baseData.source_location,
      source_type: baseData.source_type,
      is_consignment: baseData.is_consignment || false,
      consignment_percentage: baseData.consignment_percentage,
      consignor_name: baseData.consignor_name,
      consignor_contact: baseData.consignor_contact,
      clothing_size: baseData.clothing_size,
      shoe_size: baseData.shoe_size,
      gender: baseData.gender,
      age_group: baseData.age_group,
      features: baseData.features || [],
      includes: baseData.includes || [],
      defects: baseData.defects || []
    };
  };

  const validateGroupForSave = (group: PhotoGroup): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Title validation
    if (!group.listingData?.title?.trim()) {
      errors.push('Title is required');
    }
    
    // Price validation
    if (!group.listingData?.price || group.listingData.price <= 0) {
      errors.push('Valid price is required');
    }
    
    // Shipping validation - allow local pickup (cost = 0) or paid shipping
    if (!group.selectedShipping && group.listingData?.price) {
      errors.push('Shipping option is required');
    }
    
    // Category validation
    if (!group.listingData?.category?.trim()) {
      errors.push('Category is required');
    }
    
    // Condition validation
    if (!group.listingData?.condition?.trim()) {
      errors.push('Condition is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleEditItem = (groupId: string) => {
    const groupIndex = photoGroups.findIndex(g => g.id === groupId);
    if (groupIndex >= 0) {
      setCurrentReviewIndex(groupIndex);
      setCurrentStep('individual-review');
    }
  };

  const handlePreviewItem = (groupId: string) => {
    return groupId;
  };

  const handlePostItem = async (groupId: string) => {
    const groupToPost = photoGroups.find(g => g.id === groupId);
    if (!groupToPost) {
      toast({
        title: "Error",
        description: "Item not found.",
        variant: "destructive"
      });
      return;
    }

    const validation = validateGroupForSave(groupToPost);
    if (!validation.isValid) {
      toast({
        title: "Cannot post item",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Posting single item:', groupToPost.listingData?.title);
      const listingData = sanitizeListingData(ensureListingData(groupToPost.listingData));
      
      const result = await saveListing(
        listingData,
        groupToPost.selectedShipping?.cost || 0,
        'active'
      );

      if (result.success) {
        setPhotoGroups(prev => prev.map(g => 
          g.id === groupId 
            ? { ...g, isPosted: true, listingId: result.listingId, status: 'completed' as const }
            : g
        ));
        
        toast({
          title: "Success!",
          description: `${groupToPost.listingData?.title || groupToPost.name} posted successfully!`,
        });
      }
    } catch (error) {
      console.error('Failed to post item:', error);
      toast({
        title: "Error",
        description: "Failed to post item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePostAll = async () => {
    // Filter items that are ready to post
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

    // Show progress toast
    toast({
      title: "Creating listings...",
      description: `Processing ${readyItems.length} item${readyItems.length > 1 ? 's' : ''}...`,
    });

    let successCount = 0;
    const savedListings = [];

    for (const item of readyItems) {
      try {
        const listingData = sanitizeListingData(ensureListingData(item.listingData));
        console.log('Saving listing:', listingData.title, 'with shipping cost:', item.selectedShipping?.cost || 0);
        
        const result = await saveListing(
          listingData,
          item.selectedShipping?.cost || 0,
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
      }
    }

    console.log('Bulk save complete. Success count:', successCount);

    if (successCount > 0) {
      toast({
        title: "Bulk upload complete!",
        description: `Successfully created ${successCount} listing${successCount > 1 ? 's' : ''}!`,
      });
      
      // Call completion callback first
      onComplete(savedListings);
      
      // Navigate to inventory after a short delay
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

  const handleReviewAll = () => {
    setCurrentReviewIndex(0);
    setCurrentStep('individual-review');
  };

  const handleSaveDraft = async () => {
    const draftItems = photoGroups.filter(g => 
      g.listingData?.title?.trim() && !g.isPosted
    );
    
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
        const listingData = sanitizeListingData(ensureListingData(item.listingData));
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

  return {
    handleEditItem,
    handlePreviewItem,
    handlePostItem,
    handlePostAll,
    handleReviewAll,
    handleSaveDraft,
    handleUpdateGroup,
    handleRetryAnalysis
  };
};
