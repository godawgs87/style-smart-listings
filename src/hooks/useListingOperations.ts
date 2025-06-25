
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useListingOperations = () => {
  const { toast } = useToast();

  const deleteListing = async (id: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting listing:', error);
        toast({
          title: "Error",
          description: "Failed to delete listing",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Listing Deleted",
        description: "The listing has been removed."
      });
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateListing = async (id: string, updateData: any) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          ...updateData, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating listing:', error);
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
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateListingStatus = async (id: string, status: string, additionalData?: any) => {
    try {
      const updateData = { status, updated_at: new Date().toISOString(), ...additionalData };
      
      const { error } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating listing:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  return {
    deleteListing,
    updateListing,
    updateListingStatus
  };
};
