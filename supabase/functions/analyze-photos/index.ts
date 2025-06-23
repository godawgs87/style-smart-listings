
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

    console.log('=== DEBUG INFO ===');
    console.log('OpenAI API Key exists:', !!openAIApiKey);
    console.log('API Key length:', openAIApiKey?.length || 0);
    console.log('API Key starts with sk-:', openAIApiKey?.startsWith('sk-') || false);
    console.log('Photos received:', photos?.length || 0);

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY environment variable is not set');
      throw new Error('OpenAI API key not configured. Please check your Supabase Edge Function secrets.');
    }

    if (!openAIApiKey.startsWith('sk-')) {
      console.error('Invalid API key format - should start with sk-');
      throw new Error('Invalid OpenAI API key format. Please check your API key in Supabase secrets.');
    }

    // Convert first photo to base64 for analysis
    const base64Images = photos.map((photo: string) => {
      return photo.split(',')[1]; // Remove data:image/jpeg;base64, prefix
    });

    console.log('Preparing to call OpenAI API...');
    console.log('Base64 images count:', base64Images.length);

    // Test API key with a simple request first
    try {
      console.log('Testing API key with models endpoint...');
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
        },
      });
      
      console.log('Models endpoint status:', testResponse.status);
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('API key test failed:', errorText);
        
        if (testResponse.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your API key in Supabase secrets.');
        } else if (testResponse.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Your account may have hit request limits.');
        } else {
          throw new Error(`OpenAI API error during key validation: ${testResponse.status} - ${errorText}`);
        }
      }
      
      console.log('API key validation successful');
    } catch (testError) {
      console.error('API key test error:', testError);
      throw testError;
    }

    console.log('Analyzing photos with OpenAI...');

    // Single attempt first to debug
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

    console.log(`OpenAI API response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error ${response.status}:`, errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please verify your API key is correct in Supabase secrets.');
      } else if (response.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please wait and try again later.');
      } else if (response.status === 402) {
        throw new Error('OpenAI API quota exceeded. Please check your account billing and usage limits.');
      } else {
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    
    const content = data.choices[0].message.content;
    console.log('OpenAI response content:', content);

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

    console.log('Returning successful response');
    return new Response(JSON.stringify({ 
      success: true, 
      listing: listingData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-photos function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
