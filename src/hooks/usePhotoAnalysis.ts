
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
      console.log('=== PHOTO ANALYSIS START ===');
      console.log('Starting photo analysis with', photos.length, 'photos');
      console.log('Photos array:', photos.map(p => ({ name: p.name, size: p.size, type: p.type })));
      
      // Validate photos first
      const validPhotos = photos.filter(photo => {
        if (!photo || photo.size === 0) {
          console.error('Invalid photo found:', photo);
          return false;
        }
        if (!photo.type.startsWith('image/')) {
          console.error('Non-image file found:', photo.type);
          return false;
        }
        return true;
      });
      
      if (validPhotos.length === 0) {
        throw new Error('No valid image files found');
      }
      
      console.log('Valid photos count:', validPhotos.length);
      
      // Convert photos to base64 with progress tracking
      let base64Photos;
      try {
        console.log('Converting photos to base64...');
        base64Photos = await convertFilesToBase64(validPhotos);
        console.log('Photos converted successfully, count:', base64Photos.length);
      } catch (conversionError) {
        console.error('Photo conversion failed:', conversionError);
        throw new Error('Failed to process photos. Please try uploading different photos.');
      }
      
      // Validate base64 photos
      if (!base64Photos || base64Photos.length === 0) {
        throw new Error('Failed to convert photos to base64 format');
      }
      
      console.log('Calling analyze-photos function...');
      
      // Prepare the request payload
      const requestPayload = { 
        photos: base64Photos 
      };
      
      console.log('Request payload prepared - Photos count:', requestPayload.photos.length);
      
      // Use Supabase function invocation with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Analysis request timed out after 60 seconds')), 60000);
      });
      
      const analysisPromise = supabase.functions.invoke('analyze-photos', {
        body: requestPayload
      });
      
      const { data, error } = await Promise.race([analysisPromise, timeoutPromise]) as any;

      console.log('Function response received');
      console.log('Function data:', data);
      console.log('Function error:', error);
      
      if (error) {
        console.error('Function call failed:', error);
        
        // Handle specific function errors
        if (error.message?.includes('FunctionsRelayError')) {
          throw new Error('Analysis service is not responding. Please try again in a moment.');
        } else if (error.message?.includes('FunctionsFetchError')) {
          throw new Error('Network error calling analysis service. Check your connection.');
        } else if (error.message?.includes('timeout')) {
          throw new Error('Analysis timed out. Please try with fewer or smaller photos.');
        } else {
          throw new Error(`Analysis failed: ${error.message}`);
        }
      }

      if (data?.success && data?.listing) {
        const analysisResult = data.listing;
        
        // Create listing data with the analyzed results
        const listingData = {
          ...analysisResult,
          photos: base64Photos
        };
        
        console.log('Analysis completed successfully');
        
        // Show success message with price info
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
      if (error?.message?.includes('timeout')) {
        errorMessage = 'Analysis timed out. Try using fewer or smaller photos.';
      } else if (error?.message?.includes('quota')) {
        errorMessage = 'OpenAI quota exceeded. Please try again later or contact support.';
      } else if (error?.message?.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error?.message?.includes('API key')) {
        errorMessage = 'API configuration issue. Please contact support.';
      } else if (error?.message?.includes('not responding')) {
        errorMessage = 'Service temporarily unavailable. Please try again.';
      } else if (error?.message?.includes('Network error')) {
        errorMessage = 'Connection issue. Please check your internet and try again.';
      } else if (error?.message?.includes('corrupted') || error?.message?.includes('base64')) {
        errorMessage = 'Photo upload issue. Please try uploading the photos again.';
      } else if (error?.message?.includes('convert') || error?.message?.includes('process')) {
        errorMessage = 'Photo processing failed. Please try different photos or smaller file sizes.';
      }
      
      toast({
        title: "Analysis Failed",
        description: `${error?.message || 'Unknown error'}. ${errorMessage}`,
        variant: "destructive"
      });

      return null;
    } finally {
      setIsAnalyzing(false);
      console.log('=== PHOTO ANALYSIS END ===');
    }
  };

  return {
    isAnalyzing,
    analyzePhotos
  };
};
