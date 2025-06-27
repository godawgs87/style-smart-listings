
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

export const useListingDetailsQuery = () => {
  const fetchListingDetails = async (id: string): Promise<{
    details: Partial<Listing> | null;
    error: string | null;
  }> => {
    try {
      console.log('🔍 useListingDetailsQuery.fetchListingDetails for:', id);
      
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

      console.log('📡 Supabase raw response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        return { details: null, error: error.message };
      }

      console.log('📊 Raw data from database:', data);
      console.log('📏 Raw measurements:', data.measurements, 'Type:', typeof data.measurements);
      console.log('🏷️ Raw keywords:', data.keywords, 'Type:', typeof data.keywords, 'IsArray:', Array.isArray(data.keywords));
      console.log('📝 Raw description:', data.description, 'Type:', typeof data.description);
      
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

      console.log('🔄 Transformed details:', transformedDetails);
      console.log('📏 Transformed measurements:', transformedDetails.measurements);
      console.log('🏷️ Transformed keywords:', transformedDetails.keywords);
      console.log('📝 Transformed description:', transformedDetails.description);
      
      return { details: transformedDetails, error: null };
    } catch (error: any) {
      console.error('💥 Exception in fetchListingDetails:', error);
      return { details: null, error: error.message };
    }
  };

  return { fetchListingDetails };
};
