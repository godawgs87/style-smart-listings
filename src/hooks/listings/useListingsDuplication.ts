
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Listing } from '@/types/Listing';

export const useListingsDuplication = () => {
  const { toast } = useToast();

  const duplicateListing = useCallback(async (item: Listing): Promise<Listing | null> => {
    try {
      console.log('📋 Duplicating listing:', item.id);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error during duplicate:', authError);
        toast({
          title: "Authentication Required",
          description: "Please log in to duplicate listings",
          variant: "destructive"
        });
        return null;
      }

      const { data, error } = await supabase
        .from('listings')
        .insert({
          title: `${item.title} (Copy)`,
          description: item.description,
          price: item.price,
          category: item.category,
          condition: item.condition,
          measurements: item.measurements,
          keywords: item.keywords,
          photos: item.photos,
          shipping_cost: item.shipping_cost,
          status: 'draft',
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error duplicating listing:', error);
        toast({
          title: "Error",
          description: "Failed to duplicate listing",
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Listing duplicated successfully",
        variant: "default"
      });
      
      return data as Listing;
    } catch (error) {
      console.error('💥 Exception duplicating listing:', error);
      return null;
    }
  }, [toast]);

  return { duplicateListing };
};
