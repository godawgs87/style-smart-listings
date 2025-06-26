import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useListingOperations = () => {
  const { toast } = useToast();

  const deleteListing = async (id: string) => {
    try {
      console.log('Attempting to delete listing:', id);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to delete listings",
          variant: "destructive"
        });
        return false;
      }

      // Add timeout to detect connection issues
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
        
        if (error.message.includes('timeout') || error.message.includes('network')) {
          toast({
            title: "Connection Issue",
            description: "Cannot delete items while offline. Changes will not be saved.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to delete listing: ${error.message}`,
            variant: "destructive"
          });
        }
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
      
      if (error.message.includes('timeout') || error.message.includes('network')) {
        toast({
          title: "Offline Mode",
          description: "Cannot delete items while offline. Items will reappear when connection is restored.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred while deleting the listing",
          variant: "destructive"
        });
      }
      return false;
    }
  };

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
    deleteListing,
    duplicateListing,
    updateListing,
    updateListingStatus
  };
};
