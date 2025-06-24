
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveListing = async (listingData: ListingData, shippingCost: number): Promise<boolean> => {
    console.log('Starting save process...');
    
    if (!listingData) {
      toast({
        title: "Error",
        description: "No listing data available to save.",
        variant: "destructive"
      });
      return false;
    }

    setIsSaving(true);
    
    try {
      // Quick auth check
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your listing.",
          variant: "destructive"
        });
        return false;
      }

      console.log('User authenticated, preparing data...');

      // Simple, clean data preparation
      const insertData = {
        user_id: user.id,
        title: listingData.title?.trim() || '',
        description: listingData.description?.trim() || null,
        price: Number(listingData.price) || 0,
        category: listingData.category?.trim() || null,
        condition: listingData.condition?.trim() || null,
        measurements: listingData.measurements || {},
        keywords: listingData.keywords || null,
        photos: listingData.photos || null,
        price_research: listingData.priceResearch?.trim() || null,
        shipping_cost: Number(shippingCost) || 0,
        status: 'draft'
      };

      console.log('Inserting data:', insertData);

      // Simple insert operation
      const { data, error } = await supabase
        .from('listings')
        .insert(insertData)
        .select('id')
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Save successful:', data);

      toast({
        title: "Success! ✅",
        description: `Your listing "${listingData.title}" has been saved.`
      });

      return true;

    } catch (error: any) {
      console.error('Save error:', error);
      
      let errorMessage = 'Failed to save listing. Please try again.';
      
      if (error?.message?.includes('timeout')) {
        errorMessage = 'Save timed out. Please check your connection and try again.';
      } else if (error?.code === 'PGRST116') {
        errorMessage = 'Permission denied. Please sign in again.';
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
