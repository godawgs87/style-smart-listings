
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveListing = async (
    listingData: ListingData, 
    shippingCost: number, 
    status: string = 'active',
    existingListingId?: string
  ) => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save listings",
          variant: "destructive"
        });
        return { success: false, listingId: null };
      }

      console.log('💰 Saving listing with shipping cost:', shippingCost, typeof shippingCost);

      // Ensure all required fields have valid values
      const processedData = {
        title: listingData.title?.trim() || 'Untitled Listing',
        description: listingData.description?.trim() || '',
        price: Number(listingData.price) || 0,
        category: listingData.category || 'Uncategorized',
        condition: listingData.condition || 'Used',
        measurements: listingData.measurements || {},
        keywords: Array.isArray(listingData.keywords) ? listingData.keywords : [],
        photos: Array.isArray(listingData.photos) ? listingData.photos : [],
        purchase_price: listingData.purchase_price ? Number(listingData.purchase_price) : null,
        purchase_date: listingData.purchase_date || null,
        is_consignment: Boolean(listingData.is_consignment),
        consignment_percentage: listingData.consignment_percentage ? Number(listingData.consignment_percentage) : null,
        consignor_name: listingData.consignor_name?.trim() || null,
        consignor_contact: listingData.consignor_contact?.trim() || null,
        source_location: listingData.source_location?.trim() || null,
        source_type: listingData.source_type || null,
        price_research: listingData.priceResearch?.trim() || null,
        shipping_cost: Number(shippingCost), // Ensure it's always a number, including 0
        status: status,
        user_id: user.id
      };

      console.log('💰 Final shipping_cost being saved:', processedData.shipping_cost, typeof processedData.shipping_cost);

      // Calculate financial metrics
      const costBasis = processedData.purchase_price || 0;
      let netProfit = null;
      let profitMargin = null;
      
      if (processedData.purchase_price && processedData.price) {
        netProfit = processedData.price - costBasis;
        profitMargin = costBasis > 0 ? (netProfit / costBasis) * 100 : 0;
      }

      const finalData = {
        ...processedData,
        cost_basis: costBasis,
        fees_paid: 0,
        net_profit: netProfit,
        profit_margin: profitMargin,
        listed_date: status === 'active' ? new Date().toISOString().split('T')[0] : null,
      };

      console.log('Saving listing with data:', finalData);

      let result;
      let listingId;

      if (existingListingId) {
        result = await supabase
          .from('listings')
          .update(finalData)
          .eq('id', existingListingId)
          .eq('user_id', user.id)
          .select('id')
          .single();
        
        if (result.error) {
          console.error('Update error:', result.error);
          toast({
            title: "Error",
            description: `Failed to update listing: ${result.error.message}`,
            variant: "destructive"
          });
          return { success: false, listingId: null };
        }
        listingId = result.data.id;
      } else {
        result = await supabase
          .from('listings')
          .insert([finalData])
          .select('id')
          .single();

        if (result.error) {
          console.error('Insert error:', result.error);
          toast({
            title: "Error",
            description: `Failed to save listing: ${result.error.message}`,
            variant: "destructive"
          });
          return { success: false, listingId: null };
        }
        listingId = result.data.id;
      }

      if (status !== 'draft') {
        toast({
          title: "Success!",
          description: `Listing ${existingListingId ? 'updated' : 'created'} successfully!`
        });
      }
      
      return { success: true, listingId };
    } catch (error) {
      console.error('Save operation failed:', error);
      toast({
        title: "Error",
        description: "Failed to save listing. Please check your data and try again.",
        variant: "destructive"
      });
      return { success: false, listingId: null };
    } finally {
      setIsSaving(false);
    }
  };

  return { saveListing, isSaving };
};
