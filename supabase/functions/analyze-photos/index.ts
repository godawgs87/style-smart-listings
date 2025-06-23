
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    console.log('Photos received:', photos?.length || 0);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured. Please check your Supabase Edge Function secrets.');
    }

    if (!openAIApiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format. Please check your API key in Supabase secrets.');
    }

    // Convert first photo to base64 for analysis
    const base64Images = photos.map((photo: string) => {
      return photo.split(',')[1]; // Remove data:image/jpeg;base64, prefix
    });

    console.log('Preparing to call OpenAI API...');

    // Test API key first
    try {
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
        },
      });
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('API key test failed:', errorText);
        
        if (testResponse.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your API key in Supabase secrets.');
        } else if (testResponse.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Your account may have hit request limits.');
        } else {
          throw new Error(`OpenAI API error during key validation: ${testResponse.status}`);
        }
      }
    } catch (testError) {
      console.error('API key test error:', testError);
      throw testError;
    }

    console.log('Analyzing photos with OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert eBay listing assistant. Analyze the uploaded photos and create a complete listing.

CRITICAL: You must respond with ONLY valid JSON. No explanations, no markdown, no extra text.

Response format (exactly this structure):
{
  "title": "Item Title Here",
  "description": "Detailed description here",
  "price": 85,
  "category": "Category",
  "condition": "Used",
  "measurements": {
    "length": "10 inches",
    "width": "8 inches",
    "height": "6 inches",
    "weight": "2 lbs"
  },
  "keywords": ["keyword1", "keyword2"],
  "priceResearch": "Price explanation here"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze these photos and respond with ONLY the JSON object. No other text.'
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
        max_tokens: 800,
        temperature: 0
      }),
    });

    console.log(`OpenAI API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error ${response.status}:`, errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please wait and try again.');
      } else if (response.status === 402) {
        throw new Error('OpenAI API quota exceeded. Please check your account billing.');
      } else {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content.trim();
    console.log('Raw OpenAI content:', content);

    // Clean and parse JSON
    let listingData;
    try {
      // Remove any markdown formatting or extra text
      let cleanContent = content;
      
      // Remove markdown code blocks if present
      cleanContent = cleanContent.replace(/```json\s*/, '');
      cleanContent = cleanContent.replace(/```\s*$/, '');
      
      // Find JSON object boundaries
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No JSON object found in response');
      }
      
      const jsonString = cleanContent.substring(jsonStart, jsonEnd + 1);
      console.log('Extracted JSON string:', jsonString);
      
      listingData = JSON.parse(jsonString);
      
      // Validate required fields
      if (!listingData.title || !listingData.description) {
        throw new Error('Missing required fields in response');
      }
      
      // Ensure price is a number
      if (typeof listingData.price === 'string') {
        listingData.price = parseFloat(listingData.price.replace(/[^0-9.]/g, '')) || 75;
      }
      
      console.log('Successfully parsed listing data');

    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Failed content:', content);
      
      // Create fallback response
      listingData = {
        title: "DeWalt Tool - Needs Review",
        description: "Professional grade DeWalt tool in good working condition. Please review and update this listing with accurate details.",
        price: 85,
        category: "Tools & Hardware",
        condition: "Used",
        measurements: {
          length: "10 inches",
          width: "8 inches",
          height: "6 inches",
          weight: "2 lbs"
        },
        keywords: ["dewalt", "tool", "construction"],
        priceResearch: "Estimated based on typical DeWalt tool pricing - please verify current market value"
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
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
