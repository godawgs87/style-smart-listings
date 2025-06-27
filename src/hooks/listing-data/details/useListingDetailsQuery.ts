
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

export const useListingDetailsQuery = () => {
  const fetchListingDetails = async (id: string): Promise<{
    details: Partial<Listing> | null;
    error: string | null;
  }> => {
    try {
      console.log('🔍 Fetching detailed data for listing:', id);
      
      const { data, error } = await supabase
        .from('listings')
        .select(`
          description,
          measurements,
          keywords,
          photos,
          shipping_cost,
          price_research,
          purchase_date,
          purchase_price,
          is_consignment,
          consignment_percentage,
          cost_basis,
          fees_paid,
          listed_date,
          sold_date,
          sold_price,
          consignor_contact,
          source_location,
          source_type,
          performance_notes,
          consignor_name
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Failed to fetch listing details:', error);
        return { details: null, error: error.message };
      }

      console.log('✅ Successfully fetched listing details:', data);
      
      // Transform the data to match Listing interface with proper measurements handling
      const transformedDetails: Partial<Listing> = {
        description: data.description,
        measurements: data.measurements && typeof data.measurements === 'object' 
          ? data.measurements as { length?: string; width?: string; height?: string; weight?: string; }
          : {},
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        photos: Array.isArray(data.photos) ? data.photos : [],
        shipping_cost: data.shipping_cost || null,
        price_research: data.price_research,
        purchase_date: data.purchase_date,
        purchase_price: data.purchase_price,
        is_consignment: data.is_consignment,
        consignment_percentage: data.consignment_percentage,
        cost_basis: data.cost_basis,
        fees_paid: data.fees_paid,
        listed_date: data.listed_date,
        sold_date: data.sold_date,
        sold_price: data.sold_price,
        consignor_contact: data.consignor_contact,
        source_location: data.source_location,
        source_type: data.source_type,
        performance_notes: data.performance_notes,
        consignor_name: data.consignor_name
      };
      
      return { details: transformedDetails, error: null };
    } catch (error: any) {
      console.error('💥 Exception fetching listing details:', error);
      return { details: null, error: error.message };
    }
  };

  return { fetchListingDetails };
};
