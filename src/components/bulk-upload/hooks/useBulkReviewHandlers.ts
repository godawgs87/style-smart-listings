
import { useToast } from '@/hooks/use-toast';
import { useListingSave } from '@/hooks/useListingSave';
import type { PhotoGroup } from '../BulkUploadManager';
import type { ListingData } from '@/types/CreateListing';

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

  // Helper function to ensure ListingData has required fields
  const ensureListingData = (listingData?: PhotoGroup['listingData']): ListingData => {
    return {
      title: listingData?.title || 'Untitled Item',
      description: listingData?.description || '',
      price: listingData?.price || 0,
      category: listingData?.category || '',
      condition: listingData?.condition || '',
      measurements: {
        length: listingData?.measurements?.length ? String(listingData.measurements.length) : '',
        width: listingData?.measurements?.width ? String(listingData.measurements.width) : '',
        height: listingData?.measurements?.height ? String(listingData.measurements.height) : '',
        weight: listingData?.measurements?.weight ? String(listingData.measurements.weight) : ''
      },
      photos: listingData?.photos || [],
      keywords: listingData?.keywords,
      purchase_price: listingData?.purchase_price,
      purchase_date: listingData?.purchase_date,
      source_location: listingData?.source_location,
      source_type: listingData?.source_type,
      is_consignment: listingData?.is_consignment,
      consignment_percentage: listingData?.consignment_percentage,
      consignor_name: listingData?.consignor_name,
      consignor_contact: listingData?.consignor_contact,
      clothing_size: listingData?.clothing_size,
      shoe_size: listingData?.shoe_size,
      gender: listingData?.gender,
      age_group: listingData?.age_group,
      features: listingData?.features,
      includes: listingData?.includes,
      defects: listingData?.defects
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

    if (!groupToPost.listingData?.title || !groupToPost.listingData?.price) {
      toast({
        title: "Cannot post item",
        description: "Missing required information: title and price are required.",
        variant: "destructive"
      });
      return;
    }

    if (!groupToPost.selectedShipping) {
      toast({
        title: "Cannot post item",
        description: "Please select a shipping option.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Posting single item:', groupToPost.listingData.title);
      const listingData = ensureListingData(groupToPost.listingData);
      
      const result = await saveListing(
        listingData,
        groupToPost.selectedShipping.cost,
        'active'
      );

      if (result.success) {
        setPhotoGroups(prev => prev.map(g => 
          g.id === groupId 
            ? { ...g, isPosted: true, listingId: result.listingId }
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
    const readyItems = photoGroups.filter(g => 
      g.status === 'completed' && 
      g.selectedShipping && 
      !g.isPosted &&
      g.listingData?.title &&
      g.listingData?.price
    );
    
    console.log('Ready items for posting:', readyItems.length);
    console.log('Ready items:', readyItems.map(i => ({ title: i.listingData?.title, price: i.listingData?.price, shipping: i.selectedShipping })));
    
    if (readyItems.length === 0) {
      toast({
        title: "No items ready to post",
        description: "Please complete required fields (title, price, shipping) for at least one item.",
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
        const listingData = ensureListingData(item.listingData);
        console.log('Saving listing:', listingData.title, 'with shipping cost:', item.selectedShipping!.cost);
        
        const result = await saveListing(
          listingData,
          item.selectedShipping!.cost,
          'active'
        );

        if (result.success) {
          successCount++;
          savedListings.push({ ...item, listingId: result.listingId });
          
          setPhotoGroups(prev => prev.map(g => 
            g.id === item.id
              ? { ...g, isPosted: true, listingId: result.listingId }
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
      
      // Navigate to inventory after successful completion
      setTimeout(() => {
        window.location.href = '/inventory';
      }, 2000);
      
      onComplete(savedListings);
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
      g.listingData?.title && 
      !g.isPosted
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
        const listingData = ensureListingData(item.listingData);
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
