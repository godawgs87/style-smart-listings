
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveListing = async (listingData: ListingData, shippingCost: number): Promise<boolean> => {
    console.log('=== SAVE LISTING TO SUPABASE ===');
    
    if (!listingData) {
      console.error('No listing data provided');
      toast({
        title: "Error",
        description: "No listing data available to save.",
        variant: "destructive"
      });
      return false;
    }

    setIsSaving(true);
    
    try {
      // Check if user is authenticated with timeout
      const { data: { user }, error: authError } = await Promise.race([
        supabase.auth.getUser(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Authentication timeout')), 5000)
        )
      ]) as any;
      
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your listing.",
          variant: "destructive"
        });
        return false;
      }

      // Prepare listing data for Supabase
      const listingForDb = {
        user_id: user.id,
        title: listingData.title?.substring(0, 255) || '', // Limit title length
        description: listingData.description?.substring(0, 5000) || '', // Limit description length
        price: Number(listingData.price) || 0,
        category: listingData.category?.substring(0, 100) || '',
        condition: listingData.condition?.substring(0, 50) || '',
        measurements: listingData.measurements || {},
        keywords: Array.isArray(listingData.keywords) ? listingData.keywords.slice(0, 20) : [], // Limit keywords
        photos: Array.isArray(listingData.photos) ? listingData.photos.slice(0, 10) : [], // Limit photos
        price_research: listingData.priceResearch?.substring(0, 2000) || null, // Limit research text
        shipping_cost: Number(shippingCost) || 9.95,
        status: 'draft'
      };

      console.log('Saving listing to Supabase:', {
        title: listingForDb.title,
        price: listingForDb.price,
        shipping_cost: listingForDb.shipping_cost,
        user_id: listingForDb.user_id
      });

      // Save to Supabase with timeout
      const { data, error } = await Promise.race([
        supabase
          .from('listings')
          .insert([listingForDb])
          .select()
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database operation timeout')), 10000)
        )
      ]) as any;

      if (error) {
        console.error('Supabase save error:', error);
        
        // Handle specific error types
        if (error.message?.includes('timeout') || error.message?.includes('statement timeout')) {
          toast({
            title: "Save Timeout",
            description: "The save operation took too long. Please try again in a moment.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Save Failed",
            description: `Failed to save listing: ${error.message}`,
            variant: "destructive"
          });
        }
        return false;
      }

      console.log('Successfully saved listing:', data);

      toast({
        title: "Listing Saved! ✅",
        description: `Your ${listingData.title} listing has been saved to your account.`
      });

      return true;

    } catch (error: any) {
      console.error('=== SAVE ERROR ===');
      console.error('Error:', error);

      // Handle timeout errors specifically
      if (error.message?.includes('timeout')) {
        toast({
          title: "Connection Timeout",
          description: "The save operation timed out. Please check your connection and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Save Failed",
          description: `Failed to save listing: ${error?.message || 'Unknown error'}`,
          variant: "destructive"
        });
      }

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
