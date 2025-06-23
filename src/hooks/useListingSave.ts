import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveListing = async (listingData: ListingData, shippingCost: number): Promise<boolean> => {
    console.log('=== SAVE LISTING WITH FALLBACK STRATEGY ===');
    
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

      // Try localStorage first, but don't fail if it doesn't work
      let storageSaved = false;
      try {
        // Test if localStorage is available and has space
        const testKey = 'storage-test';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        
        // Try to save to localStorage
        const existingListings = localStorage.getItem('savedListings');
        const listings = existingListings ? JSON.parse(existingListings) : [];
        listings.unshift(newListing);
        
        // Keep only the last 3 listings to minimize storage usage
        const trimmedListings = listings.slice(0, 3);
        localStorage.setItem('savedListings', JSON.stringify(trimmedListings));
        
        console.log('Successfully saved to localStorage');
        storageSaved = true;
      } catch (storageError) {
        console.warn('localStorage not available, using fallback:', storageError);
        storageSaved = false;
      }

      // Always offer download as backup
      const downloadData = {
        listing: newListing,
        exportedAt: new Date().toISOString(),
        note: storageSaved ? 'Also saved to browser storage' : 'Browser storage unavailable - data exported only'
      };

      const dataStr = JSON.stringify(downloadData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `listing-${newListing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (storageSaved) {
        toast({
          title: "Listing Saved! ✅",
          description: `Your ${listingData.title} listing has been saved and downloaded as backup.`
        });
      } else {
        toast({
          title: "Listing Exported! 📁",
          description: `Your ${listingData.title} listing has been downloaded. Browser storage unavailable.`
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
