import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveListing = async (listingData: ListingData, shippingCost: number): Promise<boolean> => {
    console.log('=== SAVE LISTING TO SUPABASE ===');
    
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
      // Check if user is authenticated first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your listing.",
          variant: "destructive"
        });
        return false;
      }

      console.log('User authenticated:', user.id);

      // Optimize photos array - limit size and compress if needed
      const optimizedPhotos = Array.isArray(listingData.photos) 
        ? listingData.photos.slice(0, 8).map(photo => {
            // Keep photos but ensure they're not too large
            if (typeof photo === 'string' && photo.length > 1000000) {
              console.warn('Large photo detected, may cause timeout');
            }
            return photo;
          })
        : [];

      // Prepare optimized listing data for Supabase
      const listingForDb = {
        user_id: user.id,
        title: String(listingData.title || '').substring(0, 255),
        description: String(listingData.description || '').substring(0, 3000), // Reduced from 5000
        price: Number(listingData.price) || 0,
        category: String(listingData.category || '').substring(0, 100),
        condition: String(listingData.condition || '').substring(0, 50),
        measurements: listingData.measurements || {},
        keywords: Array.isArray(listingData.keywords) ? listingData.keywords.slice(0, 15) : [], // Reduced from 20
        photos: optimizedPhotos,
        price_research: String(listingData.priceResearch || '').substring(0, 1500) || null, // Reduced from 2000
        shipping_cost: Number(shippingCost) || 9.95,
        status: 'draft'
      };

      console.log('Prepared optimized listing data:', {
        title: listingForDb.title,
        price: listingForDb.price,
        shipping_cost: listingForDb.shipping_cost,
        user_id: listingForDb.user_id,
        photos_count: listingForDb.photos.length,
        keywords_count: listingForDb.keywords.length,
        description_length: listingForDb.description.length
      });

      // Save to Supabase with retry logic
      let attempt = 0;
      const maxAttempts = 2;
      
      while (attempt < maxAttempts) {
        attempt++;
        console.log(`Save attempt ${attempt}/${maxAttempts}`);
        
        try {
          const { data, error } = await supabase
            .from('listings')
            .insert([listingForDb])
            .select()
            .single();

          if (error) {
            throw error;
          }

          console.log('Successfully saved listing on attempt', attempt, ':', data);

          toast({
            title: "Listing Saved! ✅",
            description: `Your ${listingData.title} listing has been saved to your account.`
          });

          return true;

        } catch (attemptError: any) {
          console.error(`Save attempt ${attempt} failed:`, attemptError);
          
          if (attempt === maxAttempts) {
            throw attemptError; // Throw on final attempt
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return false;

    } catch (error: any) {
      console.error('=== SAVE ERROR ===');
      console.error('Error:', error);

      let errorMessage = 'Failed to save listing.';
      
      if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
        errorMessage = 'Save operation timed out. This may be due to large photos. Please try again with smaller images.';
      } else if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = 'A listing with this information already exists.';
      } else if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        errorMessage = 'You do not have permission to save listings. Please sign in again.';
      } else if (error.message?.includes('value too long')) {
        errorMessage = 'Some of your listing information is too long. Please shorten it and try again.';
      } else if (error.message?.includes('auth')) {
        errorMessage = 'Authentication error. Please sign in again.';
      }

      toast({
        title: "Save Failed",
        description: `${errorMessage} ${error?.message ? `(${error.message})` : ''}`,
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
