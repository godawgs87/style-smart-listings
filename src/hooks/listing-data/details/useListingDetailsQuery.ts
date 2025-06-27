
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

export const useListingDetailsQuery = () => {
  const fetchListingDetails = async (id: string): Promise<{
    details: Partial<Listing> | null;
    error: string | null;
  }> => {
    try {
      console.log('🔍 Fetching FULL details for listing:', id);
      
      // Fetch ALL fields for detailed view/editing
      const { data, error } = await supabase
        .from('listings')
        .select('*') // Get everything for detailed view
        .eq('id', id)
        .single();

      console.log('📡 Full details response:', { data, error });

      if (error) {
        console.error('❌ Details query error:', error);
        return { details: null, error: error.message };
      }

      console.log('✅ Successfully fetched full listing details');
      
      // Transform the data to match Listing interface
      const transformedDetails: Partial<Listing> = {
        ...data,
        measurements: data.measurements && typeof data.measurements === 'object' 
          ? data.measurements as { length?: string; width?: string; height?: string; weight?: string; }
          : {},
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        photos: Array.isArray(data.photos) ? data.photos : [],
        shipping_cost: data.shipping_cost || null,
      };

      return { details: transformedDetails, error: null };
    } catch (error: any) {
      console.error('💥 Exception in fetchListingDetails:', error);
      return { details: null, error: error.message };
    }
  };

  return { fetchListingDetails };
};
