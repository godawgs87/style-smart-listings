import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const clearAllListings = () => {
    try {
      localStorage.removeItem('savedListings');
      console.log('Cleared all saved listings');
      return true;
    } catch (error) {
      console.error('Error clearing all listings:', error);
      return false;
    }
  };

  const clearOldListings = () => {
    try {
      const savedListingsStr = localStorage.getItem('savedListings');
      if (savedListingsStr) {
        const savedListings = JSON.parse(savedListingsStr);
        if (Array.isArray(savedListings) && savedListings.length > 0) {
          // Keep only the 2 most recent listings for more aggressive cleanup
          const sortedListings = savedListings.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          const recentListings = sortedListings.slice(0, 2);
          localStorage.setItem('savedListings', JSON.stringify(recentListings));
          console.log(`Cleared old listings, kept ${recentListings.length} most recent`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error clearing old listings:', error);
      return false;
    }
  };

  const getStorageSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  };

  const saveListing = async (listingData: ListingData, shippingCost: number): Promise<boolean> => {
    console.log('=== SAVE LISTING DEBUG ===');
    console.log('saveListing called');
    console.log('listingData exists:', !!listingData);
    console.log('shippingCost:', shippingCost);
    console.log('Storage size before save:', getStorageSize());
    
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
      
      // Try to save with more aggressive quota handling
      let saveAttempt = 0;
      const maxAttempts = 5;
      
      while (saveAttempt < maxAttempts) {
        try {
          const stringifiedListings = JSON.stringify(savedListings);
          console.log(`Save attempt ${saveAttempt + 1}, stringified listings length:`, stringifiedListings.length);
          console.log('Storage size before attempt:', getStorageSize());
          
          localStorage.setItem('savedListings', stringifiedListings);
          console.log('Successfully saved to localStorage');
          
          // Verify the save
          const verification = localStorage.getItem('savedListings');
          console.log('Verification - localStorage content exists:', !!verification);

          if (!verification) {
            throw new Error('Failed to verify save operation');
          }

          break; // Success, exit the retry loop

        } catch (saveError) {
          console.error(`Save attempt ${saveAttempt + 1} failed:`, saveError);
          
          if (saveError.name === 'QuotaExceededError' || saveError.message.includes('quota')) {
            console.log('Storage quota exceeded, attempting cleanup...');
            
            if (saveAttempt === 0) {
              // First attempt: clear old listings
              const clearedSpace = clearOldListings();
              if (clearedSpace) {
                toast({
                  title: "Storage Cleaned",
                  description: "Cleared old listings to make space. Retrying save...",
                });
              }
            } else if (saveAttempt === 1) {
              // Second attempt: clear all listings except the current one
              const clearedAll = clearAllListings();
              if (clearedAll) {
                savedListings = [newListing]; // Only keep the new listing
                toast({
                  title: "Storage Reset",
                  description: "Cleared all old listings to make space. Retrying save...",
                });
              }
            } else {
              // Final attempts: try to clear other localStorage items
              try {
                const keysToDelete = [];
                for (let key in localStorage) {
                  if (key !== 'savedListings' && localStorage.hasOwnProperty(key)) {
                    keysToDelete.push(key);
                  }
                }
                
                keysToDelete.forEach(key => {
                  try {
                    localStorage.removeItem(key);
                    console.log('Removed localStorage key:', key);
                  } catch (e) {
                    console.warn('Could not remove key:', key);
                  }
                });
                
                if (keysToDelete.length > 0) {
                  toast({
                    title: "Storage Cleared",
                    description: "Cleared browser storage to make space. Retrying save...",
                  });
                }
              } catch (e) {
                console.error('Error clearing storage:', e);
              }
            }
            
            saveAttempt++;
            continue; // Retry the save
          } else {
            throw new Error(`Save operation failed: ${saveError.message}`);
          }
        }
      }
      
      if (saveAttempt >= maxAttempts) {
        throw new Error('Storage quota exceeded. Your browser storage is full. Please try clearing your browser data or use a different browser.');
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
