
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUpdateOperation = () => {
  const { toast } = useToast();

  const updateListing = async (id: string, updateData: any) => {
    try {
      console.log('Updating listing:', id, updateData);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to update listings",
          variant: "destructive"
        });
        return false;
      }

      // Add timeout to detect connection issues
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Update operation timeout')), 8000)
      );

      const updatePromise = supabase
        .from('listings')
        .update({ 
          ...updateData, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Supabase update error:', error);
        
        if (error.message.includes('timeout') || error.message.includes('network')) {
          toast({
            title: "Connection Issue",
            description: "Cannot update items while offline. Changes will not be saved.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to update listing: ${error.message}`,
            variant: "destructive"
          });
        }
        return false;
      }
      
      console.log('Listing updated successfully');
      toast({
        title: "Success",
        description: "Listing updated successfully"
      });
      return true;
      
    } catch (error: any) {
      console.error('Update operation failed:', error);
      
      if (error.message.includes('timeout') || error.message.includes('network')) {
        toast({
          title: "Offline Mode",
          description: "Cannot update items while offline. Changes will not be saved.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred while updating the listing",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const updateListingStatus = async (id: string, status: string, additionalData?: any) => {
    try {
      console.log('Updating listing status:', id, status, additionalData);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to update listings",
          variant: "destructive"
        });
        return false;
      }

      // Add timeout to detect connection issues
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Status update timeout')), 8000)
      );

      const updateData = { status, updated_at: new Date().toISOString(), ...additionalData };
      
      const updatePromise = supabase
        .from('listings')
        .update(updateData)
        .eq('id', id);

      const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Supabase status update error:', error);
        
        if (error.message.includes('timeout') || error.message.includes('network')) {
          toast({
            title: "Connection Issue",
            description: "Cannot update status while offline. Changes will not be saved.",
            variant: "destructive"
          });
        }
        return false;
      }

      console.log('Listing status updated successfully');
      return true;
      
    } catch (error: any) {
      console.error('Status update failed:', error);
      
      if (error.message.includes('timeout') || error.message.includes('network')) {
        toast({
          title: "Offline Mode",
          description: "Cannot update status while offline. Changes will not be saved.",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  return {
    updateListing,
    updateListingStatus
  };
};
