
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const getStorageInfo = () => {
    let totalSize = 0;
    const items: { key: string; size: number }[] = [];
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage[key].length + key.length;
        totalSize += size;
        items.push({ key, size });
      }
    }
    
    return { totalSize, items: items.sort((a, b) => b.size - a.size) };
  };

  const clearAllStorage = () => {
    console.log('=== CLEARING ALL STORAGE ===');
    const beforeInfo = getStorageInfo();
    console.log('Storage before clear:', beforeInfo);
    
    try {
      localStorage.clear();
      console.log('Successfully cleared all localStorage');
      
      const afterInfo = getStorageInfo();
      console.log('Storage after clear:', afterInfo);
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  };

  const testStorageCapacity = () => {
    console.log('=== TESTING STORAGE CAPACITY ===');
    const testData = 'x'.repeat(1000); // 1KB chunks
    let testCount = 0;
    
    try {
      while (testCount < 5000) { // Test up to 5MB
        const testKey = `test-${testCount}`;
        localStorage.setItem(testKey, testData);
        testCount++;
      }
    } catch (error) {
      console.log(`Storage capacity test: Failed after ${testCount}KB`);
    }
    
    // Clean up test data
    for (let i = 0; i < testCount; i++) {
      try {
        localStorage.removeItem(`test-${i}`);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    return testCount;
  };

  const saveListing = async (listingData: ListingData, shippingCost: number): Promise<boolean> => {
    console.log('=== SAVE LISTING ATTEMPT ===');
    console.log('Starting save process...');
    
    if (!listingData) {
      console.error('No listing data provided');
      toast({
        title: "Error",
        description: "No listing data available to save.",
        variant: "destructive"
      });
      return false;
    }

    setIsSaving(true);
    
    try {
      // Get initial storage info
      const initialInfo = getStorageInfo();
      console.log('Initial storage info:', initialInfo);
      
      // Test basic localStorage functionality
      try {
        const testKey = 'test-' + Date.now();
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        console.log('localStorage basic test: PASSED');
      } catch (testError) {
        console.error('localStorage basic test: FAILED', testError);
        throw new Error('Browser storage is not available');
      }

      // Create the new listing object
      const newListing = {
        id: `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...listingData,
        shippingCost: Number(shippingCost) || 9.95,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('New listing created:', {
        id: newListing.id,
        title: newListing.title,
        price: newListing.price
      });

      // Calculate the size of what we're trying to save
      const newListingStr = JSON.stringify([newListing]);
      const newListingSize = newListingStr.length;
      console.log('New listing data size:', newListingSize, 'characters');

      // Aggressive approach: Start fresh
      console.log('=== STARTING WITH CLEAN SLATE ===');
      
      // Clear everything and start over
      const cleared = clearAllStorage();
      if (!cleared) {
        throw new Error('Failed to clear storage');
      }

      // Test storage capacity after clearing
      const capacity = testStorageCapacity();
      console.log('Available storage capacity:', capacity, 'KB');

      if (capacity < 10) {
        throw new Error('Insufficient storage capacity available. Please try a different browser or clear your browser data.');
      }

      // Try to save the new listing
      console.log('Attempting to save new listing...');
      localStorage.setItem('savedListings', newListingStr);
      
      // Verify the save
      const verification = localStorage.getItem('savedListings');
      if (!verification) {
        throw new Error('Failed to verify save - data not found after save');
      }

      const parsedVerification = JSON.parse(verification);
      if (!Array.isArray(parsedVerification) || parsedVerification.length === 0) {
        throw new Error('Failed to verify save - invalid data structure');
      }

      console.log('Save verification successful:', parsedVerification.length, 'listings saved');

      // Final storage info
      const finalInfo = getStorageInfo();
      console.log('Final storage info:', finalInfo);

      toast({
        title: "Listing Saved! ✅",
        description: `Your ${listingData.title} listing has been saved successfully.`
      });

      return true;

    } catch (error) {
      console.error('=== SAVE ERROR DETAILS ===');
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Get final storage state for debugging
      const errorInfo = getStorageInfo();
      console.error('Storage state at error:', errorInfo);

      let errorMessage = 'Unknown error occurred';
      
      if (error?.name === 'QuotaExceededError' || error?.message?.includes('quota')) {
        errorMessage = 'Browser storage is full. All data has been cleared but storage is still insufficient. Please try using a different browser or contact support.';
      } else if (error?.message?.includes('storage')) {
        errorMessage = error.message;
      } else {
        errorMessage = `Save failed: ${error?.message || 'Unknown error'}`;
      }

      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return false;
    } finally {
      setIsSaving(false);
      console.log('Save process completed');
    }
  };

  return {
    isSaving,
    saveListing
  };
};
