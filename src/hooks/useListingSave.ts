
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveListing = async (listingData: ListingData, shippingCost: number): Promise<boolean> => {
    console.log('=== SAVE LISTING START ===');
    console.log('Listing data:', {
      title: listingData.title,
      price: listingData.price,
      photos_count: listingData.photos?.length,
      shipping_cost: shippingCost
    });
    
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
      // Check authentication
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

      // Compress photos to reduce payload size
      const compressedPhotos = Array.isArray(listingData.photos) 
        ? listingData.photos.slice(0, 5).map(photo => {
            // If photo is very large, we'll skip it to prevent timeout
            if (typeof photo === 'string' && photo.length > 500000) {
              console.warn('Skipping large photo to prevent timeout');
              return null;
            }
            return photo;
          }).filter(Boolean)
        : [];

      console.log('Photos after compression:', compressedPhotos.length);

      // Prepare minimal listing data
      const listingForDb = {
        user_id: user.id,
        title: String(listingData.title || '').substring(0, 200),
        description: String(listingData.description || '').substring(0, 2000),
        price: Number(listingData.price) || 0,
        category: String(listingData.category || '').substring(0, 100),
        condition: String(listingData.condition || '').substring(0, 50),
        measurements: listingData.measurements || {},
        keywords: Array.isArray(listingData.keywords) ? listingData.keywords.slice(0, 10) : [],
        photos: compressedPhotos,
        price_research: String(listingData.priceResearch || '').substring(0, 1000) || null,
        shipping_cost: Number(shippingCost) || 9.95,
        status: 'draft'
      };

      console.log('Attempting to save listing to database...');
      console.log('Payload size estimate:', JSON.stringify(listingForDb).length, 'characters');

      // Single save attempt with shorter timeout expectation
      const { data, error } = await supabase
        .from('listings')
        .insert([listingForDb])
        .select()
        .single();

      if (error) {
        console.error('Save error:', error);
        throw error;
      }

      console.log('Successfully saved listing:', data);

      toast({
        title: "Listing Saved! ✅",
        description: `Your ${listingData.title} listing has been saved successfully.`
      });

      return true;

    } catch (error: any) {
      console.error('=== SAVE ERROR DETAILS ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Full error object:', error);

      let errorMessage = 'Failed to save listing.';
      
      // Handle specific Supabase errors
      if (error?.code === 'PGRST116') {
        errorMessage = 'Database timeout. Try uploading fewer or smaller photos.';
      } else if (error?.message?.includes('timeout')) {
        errorMessage = 'Save operation timed out. Please try again with smaller photos.';
      } else if (error?.message?.includes('JWT')) {
        errorMessage = 'Authentication expired. Please refresh and try again.';
      } else if (error?.message?.includes('permission') || error?.message?.includes('RLS')) {
        errorMessage = 'Permission denied. Please ensure you are signed in.';
      } else if (error?.code === '23505') {
        errorMessage = 'A listing with this information already exists.';
      } else if (error?.message?.includes('value too long')) {
        errorMessage = 'Some listing information is too long. Please shorten it.';
      }

      toast({
        title: "Save Failed",
        description: errorMessage,
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
