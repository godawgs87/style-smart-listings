
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveListing = async (listingData: ListingData, shippingCost: number): Promise<boolean> => {
    console.log('=== SAVE LISTING DEBUG ===');
    console.log('saveListing called');
    console.log('listingData exists:', !!listingData);
    console.log('listingData:', listingData);
    console.log('shippingCost:', shippingCost);
    
    if (!listingData) {
      console.error('No listing data available');
      toast({
        title: "Error",
        description: "No listing data available to save. Please go back and analyze your photos first.",
        variant: "destructive"
      });
      return false;
    }

    setIsSaving(true);
    
    try {
      console.log('Starting save process...');
      
      // Enhanced error handling for localStorage
      try {
        // Test localStorage access
        const testKey = 'test-access-' + Date.now();
        localStorage.setItem(testKey, 'test');
        const testResult = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        if (testResult !== 'test') {
          throw new Error('localStorage not functioning properly');
        }
        
        console.log('localStorage access test passed');
      } catch (storageError) {
        console.error('localStorage test failed:', storageError);
        throw new Error('Browser storage not available. Please check your browser settings.');
      }
      
      // Get existing listings with better error handling
      let savedListings = [];
      try {
        const savedListingsStr = localStorage.getItem('savedListings');
        console.log('Existing savedListings string length:', savedListingsStr?.length || 0);
        
        if (savedListingsStr) {
          savedListings = JSON.parse(savedListingsStr);
          if (!Array.isArray(savedListings)) {
            console.warn('savedListings is not an array, resetting');
            savedListings = [];
          }
        }
        console.log('Parsed savedListings array length:', savedListings.length);
      } catch (parseError) {
        console.error('Error parsing saved listings:', parseError);
        savedListings = [];
      }
      
      const newListing = {
        id: `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...listingData,
        shippingCost: Number(shippingCost) || 9.95,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('New listing object created:', newListing);
      
      savedListings.push(newListing);
      console.log('Updated savedListings array length:', savedListings.length);
      
      try {
        const stringifiedListings = JSON.stringify(savedListings);
        console.log('Stringified listings length:', stringifiedListings.length);
        
        // Check if we're approaching localStorage limits (usually ~5MB)
        if (stringifiedListings.length > 4000000) { // 4MB warning threshold
          console.warn('Approaching localStorage size limit');
          toast({
            title: "Storage Warning",
            description: "Your saved listings are taking up significant storage. Consider exporting older listings.",
            variant: "destructive"
          });
        }
        
        localStorage.setItem('savedListings', stringifiedListings);
        console.log('Successfully saved to localStorage');
        
        // Verify the save
        const verification = localStorage.getItem('savedListings');
        console.log('Verification - localStorage content exists:', !!verification);
        console.log('Verification - content length:', verification?.length || 0);

        if (!verification) {
          throw new Error('Failed to verify save operation');
        }

      } catch (saveError) {
        console.error('Error saving to localStorage:', saveError);
        
        if (saveError.name === 'QuotaExceededError' || saveError.message.includes('quota')) {
          throw new Error('Storage quota exceeded. Please clear some saved listings and try again.');
        } else {
          throw new Error(`Save operation failed: ${saveError.message}`);
        }
      }

      toast({
        title: "Listing Saved Successfully! ✅",
        description: `Your ${listingData.title} listing has been saved with researched pricing ($${listingData.price}).`
      });

      return true;

    } catch (error) {
      console.error('=== SAVE ERROR ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Full error object:', error);
      
      toast({
        title: "Save Failed",
        description: `${error?.message || 'Unknown error'}. Please try again.`,
        variant: "destructive"
      });

      return false;
    } finally {
      setIsSaving(false);
      console.log('Save process completed, isSaving set to false');
    }
  };

  return {
    isSaving,
    saveListing
  };
};
