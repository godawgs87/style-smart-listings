
import type { PhotoGroup } from '../../BulkUploadManager';

export const useBulkValidation = () => {
  const validateGroupForSave = (group: PhotoGroup): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!group.listingData?.title?.trim()) {
      errors.push('Title is required');
    }
    
    if (!group.listingData?.price || group.listingData.price <= 0) {
      errors.push('Valid price is required');
    }
    
    if (!group.selectedShipping && group.listingData?.price) {
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

  return {
    validateGroupForSave
  };
};
