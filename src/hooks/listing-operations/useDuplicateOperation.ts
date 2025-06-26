
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDuplicateOperation = () => {
  const { toast } = useToast();

  const duplicateListing = async (originalItem: any) => {
    try {
      console.log('Attempting to duplicate listing:', originalItem.id, originalItem);
      
      // Check if user is authenticated
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
      
      console.log('User authenticated for duplication:', user.id);
      
      // Create a clean copy of the item with proper data sanitization
      const duplicateData = {
        title: `${originalItem.title} (Copy)`,
        description: originalItem.description || null,
        price: Number(originalItem.price) || 0,
        category: originalItem.category || null,
        condition: originalItem.condition || null,
        shipping_cost: originalItem.shipping_cost ? Number(originalItem.shipping_cost) : null,
        measurements: originalItem.measurements && typeof originalItem.measurements === 'object' 
          ? originalItem.measurements 
          : {},
        keywords: Array.isArray(originalItem.keywords) ? originalItem.keywords : [],
        photos: Array.isArray(originalItem.photos) ? originalItem.photos : [],
        price_research: originalItem.price_research || null,
        source_type: originalItem.source_type || null,
        source_location: originalItem.source_location || null,
        purchase_price: originalItem.purchase_price ? Number(originalItem.purchase_price) : null,
        purchase_date: originalItem.purchase_date || null,
        is_consignment: Boolean(originalItem.is_consignment),
        consignment_percentage: originalItem.consignment_percentage ? Number(originalItem.consignment_percentage) : null,
        consignor_name: originalItem.consignor_name || null,
        consignor_contact: originalItem.consignor_contact || null,
        cost_basis: originalItem.cost_basis ? Number(originalItem.cost_basis) : null,
        fees_paid: originalItem.fees_paid ? Number(originalItem.fees_paid) : null,
        performance_notes: originalItem.performance_notes || null,
        status: 'draft',
        user_id: user.id
      };

      console.log('Prepared duplicate data:', duplicateData);

      const { data, error } = await supabase
        .from('listings')
        .insert(duplicateData)
        .select()
        .single();

      if (error) {
        console.error('Supabase duplicate error:', error);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Error message:', error.message);
        
        // Provide more specific error messages based on the error type
        let errorMessage = 'Failed to duplicate listing';
        if (error.code === '23505') {
          errorMessage = 'Duplicate constraint violation - this may be a temporary issue, please try again';
        } else if (error.code === '42501') {
          errorMessage = 'Permission denied - please check your account permissions';
        } else if (error.message?.includes('JSON')) {
          errorMessage = 'Invalid data format - some fields may contain incompatible data';
        } else if (error.message?.includes('numeric')) {
          errorMessage = 'Invalid number format in price or measurement fields';
        } else {
          errorMessage = `Database error: ${error.message}`;
        }
        
        toast({
          title: "Duplication Failed",
          description: errorMessage,
          variant: "destructive"
        });
        return null;
      }

      if (!data) {
        console.error('No data returned from duplicate operation');
        toast({
          title: "Error",
          description: "No data returned from duplication operation",
          variant: "destructive"
        });
        return null;
      }

      console.log('Listing duplicated successfully:', data);
      toast({
        title: "Success",
        description: "Listing duplicated successfully"
      });
      return data;
    } catch (error: any) {
      console.error('Unexpected error during duplication:', error);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'An unexpected error occurred while duplicating the listing';
      if (error.message?.includes('JSON')) {
        errorMessage = 'Data format error - some fields may contain invalid characters';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error - please check your connection and try again';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast({
        title: "Duplication Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  return { duplicateListing };
};
