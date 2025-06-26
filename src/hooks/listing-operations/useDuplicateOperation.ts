
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDuplicateOperation = () => {
  const { toast } = useToast();

  const duplicateListing = async (originalItem: any) => {
    try {
      console.log('Attempting to duplicate listing:', originalItem.id);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to duplicate listings",
          variant: "destructive"
        });
        return null;
      }
      
      // Create a copy of the item without the id and with updated title
      const duplicateData = {
        ...originalItem,
        title: `${originalItem.title} (Copy)`,
        status: 'draft',
        created_at: undefined, // Let the database set this
        updated_at: undefined, // Let the database set this
        id: undefined, // Let the database generate a new ID
        sold_date: null,
        sold_price: null,
        net_profit: null,
        days_to_sell: null,
        listed_date: null,
        user_id: user.id // Ensure the correct user_id is set
      };

      // Remove undefined fields
      Object.keys(duplicateData).forEach(key => {
        if (duplicateData[key] === undefined) {
          delete duplicateData[key];
        }
      });

      const { data, error } = await supabase
        .from('listings')
        .insert(duplicateData)
        .select()
        .single();

      if (error) {
        console.error('Supabase duplicate error:', error);
        toast({
          title: "Error",
          description: `Failed to duplicate listing: ${error.message}`,
          variant: "destructive"
        });
        return null;
      }

      console.log('Listing duplicated successfully');
      toast({
        title: "Success",
        description: "Listing duplicated successfully"
      });
      return data;
    } catch (error) {
      console.error('Unexpected error during duplication:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while duplicating the listing",
        variant: "destructive"
      });
      return null;
    }
  };

  return { duplicateListing };
};
