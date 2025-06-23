
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
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert eBay listing assistant. Analyze the uploaded photos with extreme attention to detail and create a complete, professional listing.

CRITICAL INSTRUCTIONS:
- You must respond with ONLY valid JSON. No explanations, no markdown, no extra text.
- Look for ANY text, labels, model numbers, brand names, or serial numbers visible in the photos
- Pay special attention to rulers, measuring tapes, or size references in photos
- Identify the exact brand, model, and specific product details
- Research current market prices for similar items
- Write compelling, detailed descriptions that highlight key features and condition

Response format (exactly this structure):
{
  "title": "Specific Brand Model Name - Key Features",
  "description": "Detailed multi-paragraph description with specifications, condition notes, and features",
  "price": 85,
  "category": "Specific Category",
  "condition": "New/Used/Like New/Fair/Poor",
  "measurements": {
    "length": "X inches/cm",
    "width": "X inches/cm", 
    "height": "X inches/cm",
    "weight": "X lbs/oz"
  },
  "keywords": ["brand", "model", "specific", "terms"],
  "priceResearch": "Detailed explanation of pricing research and market analysis",
  "brand": "Brand Name",
  "model": "Model Number/Name",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "defects": ["Any visible wear", "Missing parts", "Damage noted"],
  "includes": ["What's included in sale"]
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze these photos in extreme detail. Look for any text, labels, model numbers, measurements, brand markings, or identifying features. Create a professional eBay listing with accurate pricing research. Respond with ONLY the JSON object.'
              },
              ...base64Images.slice(0, 4).map(image => ({
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                  detail: 'high'
                }
              }))
            ]
          }
        ],
        max_tokens: 1200,
        temperature: 0.1
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
        listingData.price = parseFloat(listingData.price.replace(/[^0-9.]/g, '')) || 85;
      }
      
      // Ensure arrays exist
      listingData.keywords = listingData.keywords || [];
      listingData.features = listingData.features || [];
      listingData.defects = listingData.defects || [];
      listingData.includes = listingData.includes || [];
      
      console.log('Successfully parsed enhanced listing data');

    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Failed content:', content);
      
      // Create enhanced fallback response
      listingData = {
        title: "Professional Tool - Needs Review",
        description: "Professional grade tool in working condition. Please review photos carefully and update this listing with accurate details based on the specific item shown.",
        price: 85,
        category: "Tools & Hardware",
        condition: "Used",
        measurements: {
          length: "10 inches",
          width: "8 inches",
          height: "6 inches",
          weight: "2 lbs"
        },
        keywords: ["tool", "professional", "equipment"],
        priceResearch: "Estimated based on typical tool pricing - please verify current market value",
        brand: "Unknown",
        model: "Please identify from photos",
        features: ["Professional grade", "Working condition"],
        defects: ["Please inspect photos for wear"],
        includes: ["Item as shown in photos"]
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
