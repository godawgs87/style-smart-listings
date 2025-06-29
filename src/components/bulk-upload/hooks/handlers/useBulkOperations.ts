
import { useListingSave } from '@/hooks/useListingSave';
import { useToast } from '@/hooks/use-toast';
import type { PhotoGroup } from '../../BulkUploadManager';
import type { ListingData } from '@/types/CreateListing';

export const useBulkOperations = () => {
  const { saveListing } = useListingSave();
  const { toast } = useToast();

  const convertPhotoGroupToListingData = (group: PhotoGroup): ListingData | null => {
    if (!group.listingData) {
      console.error('No listing data available for group:', group.id);
      return null;
    }

    // Convert measurements to ensure string types (matching ListingData interface)
    const convertedMeasurements: { length?: string; width?: string; height?: string; weight?: string } = {};
    
    if (group.listingData.measurements) {
      const measurements = group.listingData.measurements;
      if (measurements.length !== undefined) {
        convertedMeasurements.length = String(measurements.length);
      }
      if (measurements.width !== undefined) {
        convertedMeasurements.width = String(measurements.width);
      }
      if (measurements.height !== undefined) {
        convertedMeasurements.height = String(measurements.height);
      }
      if (measurements.weight !== undefined) {
        convertedMeasurements.weight = String(measurements.weight);
      }
    }

    // Convert PhotoGroup.listingData to ListingData format
    const listingData: ListingData = {
      title: group.listingData.title || 'Untitled Item',
      description: group.listingData.description || 'No description available',
      price: group.listingData.price || 0,
      category: group.listingData.category || 'Uncategorized',
      condition: group.listingData.condition || 'Used',
      measurements: convertedMeasurements,
      keywords: Array.isArray(group.listingData.keywords) ? group.listingData.keywords : [],
      photos: Array.isArray(group.listingData.photos) ? group.listingData.photos : [],
      purchase_price: group.listingData.purchase_price,
      purchase_date: group.listingData.purchase_date,
      source_location: group.listingData.source_location,
      source_type: group.listingData.source_type,
      is_consignment: group.listingData.is_consignment || false,
      consignment_percentage: group.listingData.consignment_percentage,
      consignor_name: group.listingData.consignor_name,
      consignor_contact: group.listingData.consignor_contact,
      clothing_size: group.listingData.clothing_size,
      shoe_size: group.listingData.shoe_size,
      gender: group.listingData.gender,
      age_group: group.listingData.age_group,
      priceResearch: group.listingData.priceResearch
    };

    return listingData;
  };

  const postSingleItem = async (group: PhotoGroup): Promise<{ success: boolean; listingId?: string }> => {
    try {
      console.log('📝 Posting single item:', group.id, group.listingData?.title);
      
      const listingData = convertPhotoGroupToListingData(group);
      if (!listingData) {
        throw new Error('Failed to convert group data to listing format');
      }

      if (!group.selectedShipping) {
        throw new Error('No shipping option selected');
      }

      // Validate required fields
      if (!listingData.title?.trim()) {
        throw new Error('Title is required');
      }

      if (!listingData.price || listingData.price <= 0) {
        throw new Error('Valid price is required');
      }

      const shippingCost = group.selectedShipping.cost;
      console.log('💰 Using shipping cost:', shippingCost);

      // Use the same save logic as single item creation
      const result = await saveListing(
        listingData,
        shippingCost,
        'active' // Post as active listing
      );

      if (result.success) {
        console.log('✅ Successfully posted item:', result.listingId);
        toast({
          title: "Item Posted",
          description: `"${listingData.title}" has been posted successfully!`
        });
        return { success: true, listingId: result.listingId };
      } else {
        throw new Error('Failed to save listing');
      }
    } catch (error: any) {
      console.error('❌ Failed to post item:', error);
      toast({
        title: "Failed to Post Item",
        description: error.message || 'An error occurred while posting the item',
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const saveSingleDraft = async (group: PhotoGroup): Promise<{ success: boolean; listingId?: string }> => {
    try {
      console.log('💾 Saving single draft:', group.id, group.listingData?.title);
      
      const listingData = convertPhotoGroupToListingData(group);
      if (!listingData) {
        throw new Error('Failed to convert group data to listing format');
      }

      // For drafts, only require title
      if (!listingData.title?.trim()) {
        throw new Error('Title is required');
      }

      // Use default shipping cost if none selected
      const shippingCost = group.selectedShipping?.cost ?? 9.95;

      // Use the same save logic as single item creation  
      const result = await saveListing(
        listingData,
        shippingCost,
        'draft' // Save as draft
      );

      if (result.success) {
        console.log('✅ Successfully saved draft:', result.listingId);
        toast({
          title: "Draft Saved",
          description: `"${listingData.title}" has been saved as draft!`
        });
        return { success: true, listingId: result.listingId };
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (error: any) {
      console.error('❌ Failed to save draft:', error);
      toast({
        title: "Failed to Save Draft",
        description: error.message || 'An error occurred while saving the draft',
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const postAllItems = async (groups: PhotoGroup[]): Promise<{ successes: number; failures: number }> => {
    let successes = 0;
    let failures = 0;

    console.log('🚀 Starting bulk post operation for', groups.length, 'items');

    for (const group of groups) {
      const result = await postSingleItem(group);
      if (result.success) {
        successes++;
      } else {
        failures++;
      }
    }

    console.log(`📊 Bulk post complete: ${successes} successes, ${failures} failures`);

    if (successes > 0) {
      toast({
        title: "Bulk Post Complete",
        description: `Successfully posted ${successes} items${failures > 0 ? `, ${failures} failed` : ''}`,
        variant: successes === groups.length ? "default" : "destructive"
      });
    }

    return { successes, failures };
  };

  const handlePostAll = async (groups: PhotoGroup[]) => {
    return await postAllItems(groups);
  };

  const handleSaveDraft = async (group: PhotoGroup) => {
    return await saveSingleDraft(group);
  };

  return {
    postSingleItem,
    saveSingleDraft,
    postAllItems,
    handlePostAll,
    handleSaveDraft
  };
};
