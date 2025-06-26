
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useListingOperations = () => {
  const { toast } = useToast();

  const deleteListing = async (id: string) => {
    try {
      console.log('Attempting to delete listing:', id);
      
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        toast({
          title: "Error",
          description: `Failed to delete listing: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      console.log('Listing deleted successfully');
      toast({
        title: "Success",
        description: "Listing deleted successfully"
      });
      return true;
    } catch (error) {
      console.error('Unexpected error during deletion:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the listing",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateListing = async (id: string, updateData: any) => {
    try {
      console.log('Updating listing:', id, updateData);
      
      const { error } = await supabase
        .from('listings')
        .update({ 
          ...updateData, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase update error:', error);
        toast({
          title: "Error",
          description: `Failed to update listing: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }
      
      console.log('Listing updated successfully');
      toast({
        title: "Success",
        description: "Listing updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Unexpected error during update:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the listing",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateListingStatus = async (id: string, status: string, additionalData?: any) => {
    try {
      console.log('Updating listing status:', id, status, additionalData);
      
      const updateData = { status, updated_at: new Date().toISOString(), ...additionalData };
      
      const { error } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Supabase status update error:', error);
        return false;
      }

      console.log('Listing status updated successfully');
      return true;
    } catch (error) {
      console.error('Unexpected error during status update:', error);
      return false;
    }
  };

  return {
    deleteListing,
    updateListing,
    updateListingStatus
  };
};
