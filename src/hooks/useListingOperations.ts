
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Listing } from '@/types/Listing';

export const useListingOperations = () => {
  const { toast } = useToast();

  const deleteListing = async (id: string) => {
    try {
      console.log('Attempting to delete listing:', id);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to delete listings",
          variant: "destructive"
        });
        return false;
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Delete operation timeout')), 8000)
      );

      const deletePromise = supabase
        .from('listings')
        .delete()
        .eq('id', id);

      const { error } = await Promise.race([deletePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Supabase delete error:', error);
        toast({
          title: "Error",
          description: `Failed to delete listing: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      console.log('Listing deleted successfully from database');
      toast({
        title: "Success",
        description: "Listing deleted successfully"
      });
      return true;
      
    } catch (error: any) {
      console.error('Delete operation failed:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the listing",
        variant: "destructive"
      });
      return false;
    }
  };

  const duplicateListing = async (item: Listing): Promise<Listing | null> => {
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
  };

  const updateListing = async (id: string, updates: Partial<Listing>) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to update listings",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Update error:', error);
        toast({
          title: "Error",
          description: "Failed to update listing",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Listing updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Update operation failed:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the listing",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateListingStatus = async (id: string, status: string) => {
    return updateListing(id, { status });
  };

  return {
    deleteListing,
    duplicateListing,
    updateListing,
    updateListingStatus
  };
};
