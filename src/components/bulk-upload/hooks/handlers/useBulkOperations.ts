
import { useListingSave } from '@/hooks/useListingSave';
import { useToast } from '@/hooks/use-toast';
import type { PhotoGroup } from '../../BulkUploadManager';
import type { ListingData } from '@/types/CreateListing';

export const useBulkOperations = () => {
  const { saveListing } = useListingSave();
  const { toast } = useToast();

  const convertMeasurements = (measurements: any) => {
    if (!measurements || typeof measurements !== 'object') {
      return {};
    }
    
    // Convert all measurement values to strings as required by ListingData interface
    const converted: { length?: string; width?: string; height?: string; weight?: string } = {};
    
    if (measurements.length !== undefined) {
      converted.length = String(measurements.length);
    }
    if (measurements.width !== undefined) {
      converted.width = String(measurements.width);
    }
    if (measurements.height !== undefined) {
      converted.height = String(measurements.height);
    }
    if (measurements.weight !== undefined) {
      converted.weight = String(measurements.weight);
    }
    
    return converted;
  };

  const postSingleItem = async (group: PhotoGroup): Promise<{ success: boolean; listingId?: string }> => {
    try {
      console.log('📝 Posting single item:', group.id, group.listingData?.title);
      
      if (!group.listingData) {
        throw new Error('No listing data available');
      }

      if (!group.selectedShipping) {
        throw new Error('No shipping option selected');
      }

      // Validate required fields
      if (!group.listingData.title?.trim()) {
        throw new Error('Title is required');
      }

      if (!group.listingData.price || group.listingData.price <= 0) {
        throw new Error('Valid price is required');
      }

      const shippingCost = group.selectedShipping.cost;
      console.log('💰 Using shipping cost:', shippingCost);

      // Convert to proper ListingData format with proper measurements conversion
      const listingData: ListingData = {
        title: group.listingData.title,
        description: group.listingData.description || 'No description available',
        price: group.listingData.price,
        category: group.listingData.category || 'Uncategorized',
        condition: group.listingData.condition || 'Used',
        measurements: convertMeasurements(group.listingData.measurements),
        keywords: group.listingData.keywords || [],
        photos: group.listingData.photos || [],
        purchase_price: group.listingData.purchase_price,
        purchase_date: group.listingData.purchase_date,
        source_location: group.listingData.source_location,
        source_type: group.listingData.source_type,
        is_consignment: group.listingData.is_consignment,
        consignment_percentage: group.listingData.consignment_percentage,
        consignor_name: group.listingData.consignor_name,
        consignor_contact: group.listingData.consignor_contact,
        clothing_size: group.listingData.clothing_size,
        shoe_size: group.listingData.shoe_size,
        gender: group.listingData.gender,
        age_group: group.listingData.age_group,
        features: group.listingData.features,
        includes: group.listingData.includes,
        defects: group.listingData.defects,
        priceResearch: group.listingData.priceResearch
      };

      const result = await saveListing(
        listingData,
        shippingCost,
        'active' // Post as active listing
      );

      if (result.success) {
        console.log('✅ Successfully posted item:', result.listingId);
        toast({
          title: "Item Posted",
          description: `"${group.listingData.title}" has been posted successfully!`
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
      
      if (!group.listingData) {
        throw new Error('No listing data available');
      }

      // For drafts, only require title
      if (!group.listingData.title?.trim()) {
        throw new Error('Title is required');
      }

      // Use default shipping cost if none selected
      const shippingCost = group.selectedShipping?.cost ?? 9.95;

      // Convert to proper ListingData format with proper measurements conversion
      const listingData: ListingData = {
        title: group.listingData.title,
        description: group.listingData.description || 'No description available',
        price: group.listingData.price || 0,
        category: group.listingData.category || 'Uncategorized',
        condition: group.listingData.condition || 'Used',
        measurements: convertMeasurements(group.listingData.measurements),
        keywords: group.listingData.keywords || [],
        photos: group.listingData.photos || [],
        purchase_price: group.listingData.purchase_price,
        purchase_date: group.listingData.purchase_date,
        source_location: group.listingData.source_location,
        source_type: group.listingData.source_type,
        is_consignment: group.listingData.is_consignment,
        consignment_percentage: group.listingData.consignment_percentage,
        consignor_name: group.listingData.consignor_name,
        consignor_contact: group.listingData.consignor_contact,
        clothing_size: group.listingData.clothing_size,
        shoe_size: group.listingData.shoe_size,
        gender: group.listingData.gender,
        age_group: group.listingData.age_group,
        features: group.listingData.features,
        includes: group.listingData.includes,
        defects: group.listingData.defects,
        priceResearch: group.listingData.priceResearch
      };

      const result = await saveListing(
        listingData,
        shippingCost,
        'draft' // Save as draft
      );

      if (result.success) {
        console.log('✅ Successfully saved draft:', result.listingId);
        toast({
          title: "Draft Saved",
          description: `"${group.listingData.title}" has been saved as draft!`
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
