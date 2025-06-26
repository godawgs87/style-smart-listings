
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteOperation = () => {
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

  return { deleteListing };
};
