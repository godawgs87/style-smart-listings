
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

      // Prepare listing data exactly matching the existing successful listings format
      const listingForDb = {
        user_id: user.id,
        title: listingData.title || '',
        description: listingData.description || null,
        price: listingData.price || 0,
        category: listingData.category || null,
        condition: listingData.condition || null,
        measurements: listingData.measurements || {},
        keywords: listingData.keywords || null,
        photos: listingData.photos || null,
        price_research: listingData.priceResearch || null,
        shipping_cost: shippingCost || 9.95,
        status: 'draft'
      };

      console.log('Attempting to save listing to database...');
      console.log('Final payload:', listingForDb);

      // Use the same insert pattern as existing successful listings
      const { data, error } = await supabase
        .from('listings')
        .insert(listingForDb)
        .select()
        .single();

      if (error) {
        console.error('Database save error:', error);
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
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error details:', error?.details);
      console.error('Full error object:', error);

      let errorMessage = 'Failed to save listing.';
      
      if (error?.message?.includes('JWT') || error?.message?.includes('token')) {
        errorMessage = 'Authentication expired. Please refresh and try again.';
      } else if (error?.message?.includes('permission') || error?.code === 'PGRST116') {
        errorMessage = 'Permission denied. Please ensure you are signed in properly.';
      } else if (error?.code === '23505') {
        errorMessage = 'A listing with this information already exists.';
      } else if (error?.message?.includes('timeout') || error?.code === '57014') {
        errorMessage = 'Database operation timed out. Please try again.';
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
