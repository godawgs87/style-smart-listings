
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

    // Retry logic for rate limiting
    let retries = 3;
    let response;
    
    while (retries > 0) {
      try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
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
          break; // Success, exit retry loop
        } else if (response.status === 429) {
          retries--;
          if (retries > 0) {
            console.log(`Rate limited, retrying in ${4 - retries} seconds...`);
            await sleep((4 - retries) * 1000); // Exponential backoff
          } else {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.');
          }
        } else {
          throw new Error(`OpenAI API error: ${response.status} - ${await response.text()}`);
        }
      } catch (error) {
        if (retries === 1) {
          throw error; // Last retry, throw the error
        }
        retries--;
        console.log(`Request failed, retrying... (${retries} attempts left)`);
        await sleep(1000);
      }
    }

    if (!response || !response.ok) {
      throw new Error('Failed to get response from OpenAI after retries');
    }

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

  } catch (error) {
    console.error('Error in analyze-photos function:', error);
    
    // Provide specific error messages for common issues
    let errorMessage = error.message;
    if (error.message.includes('Rate limit')) {
      errorMessage = 'OpenAI API rate limit reached. Please wait a moment and try again.';
    } else if (error.message.includes('429')) {
      errorMessage = 'Too many requests to OpenAI. Please wait a few seconds and try again.';
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
