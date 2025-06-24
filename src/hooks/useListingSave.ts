
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ListingData } from '@/types/CreateListing';

export const useListingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveListing = async (listingData: ListingData, shippingCost: number): Promise<boolean> => {
    console.log('=== SAVE LISTING START ===');
    console.log('Raw input data:', { listingData, shippingCost });
    
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
      // Get current user with timeout
      const { data: { user }, error: authError } = await Promise.race([
        supabase.auth.getUser(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        )
      ]) as any;
      
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

      // Clean and prepare data - ensure proper types
      const cleanedData = {
        user_id: user.id,
        title: String(listingData.title || '').trim(),
        description: listingData.description ? String(listingData.description).trim() : null,
        price: Number(listingData.price) || 0,
        category: listingData.category ? String(listingData.category).trim() : null,
        condition: listingData.condition ? String(listingData.condition).trim() : null,
        measurements: listingData.measurements && typeof listingData.measurements === 'object' 
          ? listingData.measurements 
          : {},
        keywords: Array.isArray(listingData.keywords) && listingData.keywords.length > 0 
          ? listingData.keywords 
          : null,
        photos: Array.isArray(listingData.photos) && listingData.photos.length > 0 
          ? listingData.photos 
          : null,
        price_research: listingData.priceResearch ? String(listingData.priceResearch).trim() : null,
        shipping_cost: Number(shippingCost) || 9.95,
        status: 'draft'
      };

      console.log('Cleaned data for insert:', cleanedData);

      // Insert with timeout and proper error handling
      const insertPromise = supabase
        .from('listings')
        .insert(cleanedData)
        .select('id, title, created_at')
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database operation timed out')), 10000)
      );

      const { data, error } = await Promise.race([insertPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Database insert error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Successfully saved listing:', data);

      toast({
        title: "Listing Saved! ✅",
        description: `Your "${listingData.title}" listing has been saved successfully.`
      });

      return true;

    } catch (error: any) {
      console.error('=== COMPREHENSIVE SAVE ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error details:', error?.details);
      console.error('Error hint:', error?.hint);
      console.error('Full error:', error);

      let errorMessage = 'Failed to save listing. Please try again.';
      
      if (error?.message?.includes('timeout') || error?.message === 'Database operation timed out') {
        errorMessage = 'Save operation timed out. Please check your connection and try again.';
      } else if (error?.message?.includes('JWT') || error?.message?.includes('token')) {
        errorMessage = 'Session expired. Please refresh the page and try again.';
      } else if (error?.code === 'PGRST116' || error?.message?.includes('permission')) {
        errorMessage = 'Permission denied. Please ensure you are properly signed in.';
      } else if (error?.code === '23505') {
        errorMessage = 'A similar listing already exists.';
      } else if (error?.code === '23502') {
        errorMessage = 'Required listing information is missing.';
      }

      toast({
        title: "Save Failed",
        description: errorMessage,
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
