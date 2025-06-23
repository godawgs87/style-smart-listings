import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveListing = async (listingData: ListingData, shippingCost: number): Promise<boolean> => {
    console.log('=== SAVE LISTING ===');
    
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

      // Try to save to localStorage with aggressive cleanup if needed
      let storageSaved = false;
      try {
        const existingListings = JSON.parse(localStorage.getItem('savedListings') || '[]');
        
        // Add new listing to the beginning
        const updatedListings = [newListing, ...existingListings];
        
        // Try to save all listings first
        try {
          localStorage.setItem('savedListings', JSON.stringify(updatedListings));
          console.log('Successfully saved to localStorage with all listings');
          storageSaved = true;
        } catch (storageError) {
          console.log('Failed to save all listings, trying with cleanup...');
          
          // If that fails, keep only the new listing and most recent one
          const minimalListings = updatedListings.slice(0, 2);
          try {
            localStorage.setItem('savedListings', JSON.stringify(minimalListings));
            console.log('Successfully saved to localStorage with minimal listings');
            storageSaved = true;
          } catch (minimalError) {
            console.log('Failed minimal save, trying with just new listing...');
            
            // If that still fails, save only the new listing
            try {
              localStorage.setItem('savedListings', JSON.stringify([newListing]));
              console.log('Successfully saved only new listing to localStorage');
              storageSaved = true;
            } catch (singleError) {
              console.warn('All localStorage save attempts failed:', singleError);
              storageSaved = false;
            }
          }
        }
      } catch (parseError) {
        console.log('localStorage data was corrupted, creating fresh with new listing');
        try {
          localStorage.setItem('savedListings', JSON.stringify([newListing]));
          storageSaved = true;
        } catch (freshError) {
          console.warn('Even fresh localStorage save failed:', freshError);
          storageSaved = false;
        }
      }

      // Always offer download as backup, but make it optional for user
      const downloadData = {
        listing: newListing,
        exportedAt: new Date().toISOString(),
        note: storageSaved ? 'Backup export of saved listing' : 'Primary export - browser storage unavailable'
      };

      const dataStr = JSON.stringify(downloadData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create download link but don't auto-click if localStorage worked
      const link = document.createElement('a');
      link.href = url;
      link.download = `listing-${newListing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.json`;
      
      if (!storageSaved) {
        // Only auto-download if localStorage failed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      URL.revokeObjectURL(url);

      // Show appropriate success message
      if (storageSaved) {
        toast({
          title: "Listing Saved! ✅",
          description: `Your ${listingData.title} listing has been saved to your Listings Manager.`
        });
      } else {
        toast({
          title: "Listing Exported! 📁",
          description: `Your ${listingData.title} listing has been downloaded. Browser storage is full.`
        });
      }

      return true;

    } catch (error) {
      console.error('=== SAVE ERROR ===');
      console.error('Error:', error);

      toast({
        title: "Save Failed",
        description: `Failed to save listing: ${error?.message || 'Unknown error'}`,
        variant: "destructive"
      });

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveListing
  };
};
