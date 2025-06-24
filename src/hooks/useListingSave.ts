
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
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your listing.",
          variant: "destructive"
        });
        return false;
      }

      console.log('User authenticated:', user.id);

      // Prepare listing data for Supabase with proper validation
      const listingForDb = {
        user_id: user.id,
        title: String(listingData.title || '').substring(0, 255),
        description: String(listingData.description || '').substring(0, 5000),
        price: Number(listingData.price) || 0,
        category: String(listingData.category || '').substring(0, 100),
        condition: String(listingData.condition || '').substring(0, 50),
        measurements: listingData.measurements || {},
        keywords: Array.isArray(listingData.keywords) ? listingData.keywords.slice(0, 20) : [],
        photos: Array.isArray(listingData.photos) ? listingData.photos.slice(0, 10) : [],
        price_research: String(listingData.priceResearch || '').substring(0, 2000) || null,
        shipping_cost: Number(shippingCost) || 9.95,
        status: 'draft'
      };

      console.log('Prepared listing data:', {
        title: listingForDb.title,
        price: listingForDb.price,
        shipping_cost: listingForDb.shipping_cost,
        user_id: listingForDb.user_id,
        photos_count: listingForDb.photos.length,
        keywords_count: listingForDb.keywords.length
      });

      // Save to Supabase
      const { data, error } = await supabase
        .from('listings')
        .insert([listingForDb])
        .select()
        .single();

      if (error) {
        console.error('Supabase save error:', error);
        
        let errorMessage = 'Failed to save listing. Please try again.';
        
        // Handle specific error types
        if (error.message?.includes('duplicate key')) {
          errorMessage = 'A listing with this information already exists.';
        } else if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          errorMessage = 'You do not have permission to save listings. Please sign in again.';
        } else if (error.message?.includes('value too long')) {
          errorMessage = 'Some of your listing information is too long. Please shorten it and try again.';
        }
        
        toast({
          title: "Save Failed",
          description: errorMessage,
          variant: "destructive"
        });
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

      let errorMessage = 'Failed to save listing.';
      
      if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message?.includes('auth')) {
        errorMessage = 'Authentication error. Please sign in again.';
      }

      toast({
        title: "Save Failed",
        description: `${errorMessage} ${error?.message ? `(${error.message})` : ''}`,
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
