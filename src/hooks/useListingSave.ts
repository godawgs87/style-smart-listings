
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
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your listing.",
          variant: "destructive"
        });
        return false;
      }

      // Prepare listing data for Supabase
      const listingForDb = {
        user_id: user.id,
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        category: listingData.category,
        condition: listingData.condition,
        measurements: listingData.measurements || {},
        keywords: listingData.keywords || [],
        photos: listingData.photos || [],
        price_research: listingData.priceResearch,
        shipping_cost: Number(shippingCost) || 9.95,
        status: 'draft'
      };

      console.log('Saving listing to Supabase:', {
        title: listingForDb.title,
        price: listingForDb.price,
        shipping_cost: listingForDb.shipping_cost
      });

      // Save to Supabase
      const { data, error } = await supabase
        .from('listings')
        .insert([listingForDb])
        .select()
        .single();

      if (error) {
        console.error('Supabase save error:', error);
        toast({
          title: "Save Failed",
          description: `Failed to save listing: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      console.log('Successfully saved listing:', data);

      toast({
        title: "Listing Saved! ✅",
        description: `Your ${listingData.title} listing has been saved to your account.`
      });

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
