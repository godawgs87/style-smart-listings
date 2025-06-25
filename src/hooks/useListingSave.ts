
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveListing = async (
    listingData: ListingData, 
    shippingCost: number, 
    status: string = 'active',
    existingListingId?: string
  ) => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save listings",
          variant: "destructive"
        });
        return { success: false, listingId: null };
      }

      const listingToSave = {
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        category: listingData.category,
        condition: listingData.condition,
        measurements: listingData.measurements,
        keywords: listingData.keywords || [],
        photos: listingData.photos || [],
        price_research: listingData.priceResearch || '',
        shipping_cost: shippingCost,
        status: status,
        user_id: user.id
      };

      let result;
      let listingId;

      if (existingListingId) {
        // Update existing listing
        result = await supabase
          .from('listings')
          .update(listingToSave)
          .eq('id', existingListingId)
          .eq('user_id', user.id)
          .select('id')
          .single();
        
        if (result.error) {
          console.error('Error updating listing:', result.error);
          toast({
            title: "Error",
            description: "Failed to update listing. Please try again.",
            variant: "destructive"
          });
          return { success: false, listingId: null };
        }
        listingId = result.data.id;
      } else {
        // Create new listing
        result = await supabase
          .from('listings')
          .insert([listingToSave])
          .select('id')
          .single();

        if (result.error) {
          console.error('Error creating listing:', result.error);
          toast({
            title: "Error",
            description: "Failed to save listing. Please try again.",
            variant: "destructive"
          });
          return { success: false, listingId: null };
        }
        listingId = result.data.id;
      }

      const statusText = status === 'draft' ? 'draft saved' : 'listing saved';
      
      if (status !== 'draft') {
        toast({
          title: "Success!",
          description: `Your ${statusText} successfully!`
        });
      }
      
      return { success: true, listingId };
    } catch (error) {
      console.error('Error saving listing:', error);
      toast({
        title: "Error",
        description: "Failed to save listing. Please try again.",
        variant: "destructive"
      });
      return { success: false, listingId: null };
    } finally {
      setIsSaving(false);
    }
  };

  return { saveListing, isSaving };
};
