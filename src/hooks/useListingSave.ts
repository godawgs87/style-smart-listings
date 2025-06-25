
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveListing = async (listingData: ListingData, shippingCost: number, status: string = 'active') => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save listings",
          variant: "destructive"
        });
        return false;
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

      const { error } = await supabase
        .from('listings')
        .insert([listingToSave]);

      if (error) {
        console.error('Error saving listing:', error);
        toast({
          title: "Error",
          description: "Failed to save listing. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      const statusText = status === 'draft' ? 'draft saved' : 'listing saved';
      
      if (status !== 'draft') {
        toast({
          title: "Success!",
          description: `Your ${statusText} successfully!`
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error saving listing:', error);
      toast({
        title: "Error",
        description: "Failed to save listing. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveListing, isSaving };
};
