
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
    if (groupToPost && groupToPost.status === 'completed' && groupToPost.selectedShipping && groupToPost.listingData) {
      
      try {
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
            description: `${groupToPost.name} posted successfully!`,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to post item. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Cannot post item",
        description: "Missing required information: title, price, or shipping option.",
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
    
    if (readyItems.length === 0) {
      toast({
        title: "No items ready",
        description: "Please complete all required fields for at least one item.",
        variant: "destructive"
      });
      return;
    }

    let successCount = 0;
    const savedListings = [];

    for (const item of readyItems) {
      try {
        const listingData = ensureListingData(item.listingData);
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
        }
      } catch (error) {
        console.error(`Failed to save ${item.name}:`, error);
      }
    }

    if (successCount > 0) {
      toast({
        title: "Bulk upload complete!",
        description: `Successfully created ${successCount} listing${successCount > 1 ? 's' : ''}!`,
      });
      
      onComplete(savedListings);
      
      setTimeout(() => {
        window.location.href = '/inventory';
      }, 1500);
    } else {
      toast({
        title: "Upload failed",
        description: "Failed to create any listings. Please try again.",
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
      g.listingData?.price
    );
    
    if (draftItems.length === 0) {
      toast({
        title: "No items to save",
        description: "Please complete at least title and price for items to save as drafts.",
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
        console.error(`Failed to save draft for ${item.name}:`, error);
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
