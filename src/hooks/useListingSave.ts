
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

      // Ensure required fields have default values
      const safeListingData = {
        ...listingData,
        title: listingData.title || 'Untitled Listing',
        description: listingData.description || '',
        price: listingData.price || 0,
        category: listingData.category || 'Uncategorized',
        condition: listingData.condition || 'Used',
        measurements: listingData.measurements || {},
        keywords: listingData.keywords || [],
        photos: listingData.photos || []
      };

      // Calculate profit if both purchase price and listing price are available
      let calculatedCostBasis = safeListingData.purchase_price || 0;
      let calculatedNetProfit = null;
      let calculatedProfitMargin = null;
      
      if (safeListingData.purchase_price && safeListingData.price) {
        calculatedNetProfit = safeListingData.price - calculatedCostBasis;
        calculatedProfitMargin = calculatedCostBasis > 0 ? (calculatedNetProfit / calculatedCostBasis) * 100 : 0;
      }

      const listingToSave = {
        title: safeListingData.title,
        description: safeListingData.description,
        price: safeListingData.price,
        purchase_price: safeListingData.purchase_price || null,
        purchase_date: safeListingData.purchase_date || null,
        is_consignment: safeListingData.is_consignment || false,
        consignment_percentage: safeListingData.consignment_percentage || null,
        consignor_name: safeListingData.consignor_name || null,
        consignor_contact: safeListingData.consignor_contact || null,
        source_location: safeListingData.source_location || null,
        source_type: safeListingData.source_type || null,
        category: safeListingData.category,
        condition: safeListingData.condition,
        measurements: safeListingData.measurements,
        keywords: safeListingData.keywords,
        photos: safeListingData.photos,
        price_research: safeListingData.priceResearch || null,
        shipping_cost: shippingCost || 0,
        status: status,
        cost_basis: calculatedCostBasis,
        fees_paid: safeListingData.fees_paid || 0,
        net_profit: calculatedNetProfit,
        profit_margin: calculatedProfitMargin,
        listed_date: status === 'active' ? new Date().toISOString().split('T')[0] : null,
        user_id: user.id
      };

      console.log('Attempting to save listing with data:', listingToSave);

      let result;
      let listingId;

      if (existingListingId) {
        // Update existing listing
        result = await supabase
          .from('listings')
          .update(listingToSave)
          .eq('id', existingListingId)
          .eq('user_id', user.id)
          .select('id')
          .single();
        
        if (result.error) {
          console.error('Error updating listing:', result.error);
          toast({
            title: "Error",
            description: `Failed to update listing: ${result.error.message}`,
            variant: "destructive"
          });
          return { success: false, listingId: null };
        }
        listingId = result.data.id;
      } else {
        // Create new listing
        result = await supabase
          .from('listings')
          .insert([listingToSave])
          .select('id')
          .single();

        if (result.error) {
          console.error('Error creating listing:', result.error);
          toast({
            title: "Error",
            description: `Failed to save listing: ${result.error.message}`,
            variant: "destructive"
          });
          return { success: false, listingId: null };
        }
        listingId = result.data.id;
      }

      const statusText = status === 'draft' ? 'draft saved' : 'listing saved';
      
      if (status !== 'draft') {
        toast({
          title: "Success!",
          description: `Your ${statusText} successfully!`
        });
      }
      
      return { success: true, listingId };
    } catch (error) {
      console.error('Error saving listing:', error);
      toast({
        title: "Error",
        description: "Failed to save listing. Please try again.",
        variant: "destructive"
      });
      return { success: false, listingId: null };
    } finally {
      setIsSaving(false);
    }
  };

  return { saveListing, isSaving };
};
