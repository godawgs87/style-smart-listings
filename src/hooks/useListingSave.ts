
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveListing = async (listingData: ListingData, shippingCost: number): Promise<boolean> => {
    console.log('=== SAVE LISTING DEBUG ===');
    console.log('Original listing data:', listingData);
    console.log('Shipping cost:', shippingCost);
    
    if (!listingData) {
      toast({
        title: "Error",
        description: "No listing data available to save.",
        variant: "destructive"
      });
      return false;
    }

    setIsSaving(true);
    
    try {
      // Quick auth check
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your listing.",
          variant: "destructive"
        });
        return false;
      }

      console.log('User authenticated:', user.id);

      // Match exact database schema from types.ts
      const insertData = {
        user_id: user.id,
        title: String(listingData.title || '').trim(),
        description: listingData.description ? String(listingData.description).trim() : null,
        price: Number(listingData.price) || 0,
        category: listingData.category ? String(listingData.category).trim() : null,
        condition: listingData.condition ? String(listingData.condition).trim() : null,
        measurements: listingData.measurements || {},
        keywords: Array.isArray(listingData.keywords) ? listingData.keywords : null,
        photos: Array.isArray(listingData.photos) ? listingData.photos : null,
        price_research: listingData.priceResearch ? String(listingData.priceResearch).trim() : null,
        shipping_cost: Number(shippingCost) || 0,
        status: 'draft'
      };

      console.log('Final insert data:', insertData);
      console.log('Data types check:');
      console.log('- title type:', typeof insertData.title);
      console.log('- price type:', typeof insertData.price);
      console.log('- measurements type:', typeof insertData.measurements);
      console.log('- keywords is array:', Array.isArray(insertData.keywords));
      console.log('- photos is array:', Array.isArray(insertData.photos));

      // Simple insert with exact field matching
      const { data, error } = await supabase
        .from('listings')
        .insert(insertData)
        .select('id')
        .single();

      if (error) {
        console.error('=== DATABASE ERROR ===');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw error;
      }

      console.log('=== SAVE SUCCESS ===');
      console.log('Saved with ID:', data.id);

      toast({
        title: "Success! ✅",
        description: `Your listing "${listingData.title}" has been saved.`
      });

      return true;

    } catch (error: any) {
      console.error('=== SAVE ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error object:', error);
      
      let errorMessage = 'Failed to save listing. Please try again.';
      
      if (error?.code === '23502') {
        errorMessage = 'Missing required field. Please check all required information is filled.';
      } else if (error?.code === '23505') {
        errorMessage = 'Duplicate entry. This listing may already exist.';
      } else if (error?.message?.includes('timeout')) {
        errorMessage = 'Database timeout. Please try again.';
      } else if (error?.code === 'PGRST116') {
        errorMessage = 'Permission denied. Please sign in again.';
      }

      toast({
        title: "Save Failed",
        description: `${errorMessage} (Error: ${error?.code || 'Unknown'})`,
        variant: "destructive"
      });

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveListing
  };
};
