
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photos } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Convert first photo to base64 for analysis
    const base64Images = photos.map((photo: string) => {
      return photo.split(',')[1]; // Remove data:image/jpeg;base64, prefix
    });

    console.log('Analyzing photos with OpenAI...');

    // Retry logic for rate limiting - fixed implementation
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt + 1} of ${maxRetries}`);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `You are an expert eBay listing assistant. Analyze the uploaded photos and create a complete listing. 

Return a JSON object with this exact structure:
{
  "title": "Complete eBay title (max 80 characters)",
  "description": "Detailed description for eBay listing",
  "price": number (estimated market value),
  "category": "Category name",
  "condition": "Condition assessment",
  "measurements": {
    "length": "X inches",
    "width": "X inches", 
    "height": "X inches",
    "weight": "X lbs"
  },
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Focus on identifying the item accurately, estimating realistic measurements, and creating compelling listing copy that would sell well on eBay.`
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Please analyze these photos and create a complete eBay listing with accurate measurements and compelling description.'
                  },
                  ...base64Images.slice(0, 3).map(image => ({
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${image}`
                    }
                  }))
                ]
              }
            ],
            max_tokens: 1000,
            temperature: 0.3
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0].message.content;
          
          console.log('OpenAI response:', content);

          // Parse the JSON response
          let listingData;
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              listingData = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('No JSON found in response');
            }
          } catch (parseError) {
            console.error('Failed to parse JSON:', parseError);
            // Fallback response
            listingData = {
              title: "Item from Photos - Please Review",
              description: content,
              price: 25,
              category: "Other",
              condition: "Pre-owned",
              measurements: {
                length: "8 inches",
                width: "6 inches",
                height: "4 inches",
                weight: "1.5 lbs"
              },
              keywords: ["vintage", "collectible", "unique"]
            };
          }

          return new Response(JSON.stringify({ 
            success: true, 
            listing: listingData 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Handle rate limiting
        if (response.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Rate limited on attempt ${attempt + 1}. Waiting ${waitTime}ms before retry...`);
          
          if (attempt < maxRetries - 1) { // Don't wait on the last attempt
            await sleep(waitTime);
            continue;
          } else {
            throw new Error('OpenAI API rate limit exceeded. Please wait a moment and try again.');
          }
        }

        // Handle other HTTP errors
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);

      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error.message);
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries - 1) {
          throw error;
        }
        
        // Wait before retrying (except for rate limit errors which have their own wait)
        if (!error.message.includes('429') && !error.message.includes('rate limit')) {
          await sleep(1000 * (attempt + 1)); // 1s, 2s, 3s
        }
      }
    }

    // This should never be reached, but just in case
    throw lastError || new Error('Max retries exceeded');

  } catch (error) {
    console.error('Error in analyze-photos function:', error);
    
    // Provide specific error messages for common issues
    let errorMessage = error.message;
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      errorMessage = 'OpenAI API rate limit reached. Please wait a few minutes and try again.';
    } else if (error.message.includes('API key')) {
      errorMessage = 'OpenAI API key is not configured properly.';
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
