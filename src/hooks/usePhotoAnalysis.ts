
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ListingData } from '@/types/CreateListing';
import { convertFilesToBase64 } from '@/utils/photoUtils';

export const usePhotoAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzePhotos = async (photos: File[]): Promise<ListingData | null> => {
    if (photos.length === 0) {
      toast({
        title: "No Photos",
        description: "Please upload at least one photo to analyze.",
        variant: "destructive"
      });
      return null;
    }
    
    setIsAnalyzing(true);
    
    try {
      console.log('=== PHOTO ANALYSIS DEBUG ===');
      console.log('Starting photo analysis with', photos.length, 'photos');
      
      // Convert photos to base64
      const base64Photos = await convertFilesToBase64(photos);
      console.log('Photos converted to base64, first photo size:', base64Photos[0]?.length || 0);
      
      // Validate base64 photos
      if (!base64Photos || base64Photos.length === 0) {
        throw new Error('Failed to convert photos to base64 format');
      }
      
      // Check if photos are valid base64
      const invalidPhotos = base64Photos.filter(photo => !photo || photo.length < 100);
      if (invalidPhotos.length > 0) {
        throw new Error('Some photos appear to be corrupted or too small');
      }
      
      console.log('Calling analyze-photos function...');
      
      // Prepare the request payload - DO NOT stringify, supabase client handles this
      const requestPayload = { 
        photos: base64Photos 
      };
      
      console.log('Request payload prepared, photos count:', requestPayload.photos.length);
      
      // Use Supabase function invocation - body should be plain object, not JSON string
      const { data, error } = await supabase.functions.invoke('analyze-photos', {
        body: requestPayload
      });

      console.log('Function response data:', data);
      console.log('Function error:', error);
      
      if (error) {
        console.error('Function call failed:', error);
        
        // Handle specific function errors
        if (error.message?.includes('FunctionsRelayError')) {
          throw new Error('Edge Function is not responding. Please try again in a moment.');
        } else if (error.message?.includes('FunctionsFetchError')) {
          throw new Error('Network error calling analysis function. Check your connection.');
        } else if (error.message?.includes('non-2xx status code')) {
          throw new Error('Analysis service encountered an error. Please try uploading different photos.');
        } else {
          throw new Error(`Analysis failed: ${error.message}`);
        }
      }

      if (data?.success && data?.listing) {
        const analysisResult = data.listing;
        
        // Use the AI-determined measurements instead of overriding them
        const listingData = {
          ...analysisResult,
          photos: base64Photos
        };
        
        // Show price research info if available
        const priceInfo = analysisResult.priceResearch 
          ? ` (${analysisResult.priceResearch})`
          : '';
        
        toast({
          title: "Analysis Complete! 🎯",
          description: `Listing generated with researched price: $${analysisResult.price}${priceInfo}`
        });

        return listingData;
      } else {
        throw new Error(data?.error || 'Analysis failed - no data returned');
      }
    } catch (error) {
      console.error('=== ANALYSIS ERROR ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Full error:', error);
      
      // More specific error handling
      let errorMessage = 'Please check your photos and try again.';
      if (error?.message?.includes('quota')) {
        errorMessage = 'OpenAI quota exceeded. Please try again later or contact support.';
      } else if (error?.message?.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error?.message?.includes('API key')) {
        errorMessage = 'API configuration issue. Please contact support.';
      } else if (error?.message?.includes('Edge Function')) {
        errorMessage = 'Service temporarily unavailable. Please try again.';
      } else if (error?.message?.includes('Network error') || error?.message?.includes('not responding')) {
        errorMessage = 'Connection issue. Please check your internet and try again.';
      } else if (error?.message?.includes('corrupted') || error?.message?.includes('base64')) {
        errorMessage = 'Photo upload issue. Please try uploading the photos again.';
      }
      
      toast({
        title: "Analysis Failed",
        description: `Error: ${error?.message || 'Unknown error'}. ${errorMessage}`,
        variant: "destructive"
      });

      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    analyzePhotos
  };
};
