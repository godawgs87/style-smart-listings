import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  console.log('=== EBAY OAUTH FUNCTION START ===');
  console.log('Method:', req.method);

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Reading request body...');
    const requestData = await req.json();
    
    console.log('=== REQUEST DEBUG ===');
    console.log('Raw request data:', requestData);
    console.log('Request data type:', typeof requestData);
    console.log('Request data keys:', Object.keys(requestData));
    
    const { action, code, state } = requestData;
    
    console.log('=== PARAMETER DEBUG ===');
    console.log('action:', action);
    console.log('action type:', typeof action);
    console.log('code present:', !!code);
    console.log('state:', state);
    
    // Test action
    if (action === 'test') {
      console.log('✅ Test action triggered');
      return new Response(JSON.stringify({
        message: 'Function working',
        debug: { received: requestData }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Debug action
    if (action === 'debug') {
      console.log('✅ Debug action triggered');
      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID');
      const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET');
      
      return new Response(JSON.stringify({
        status: 'debug_ok',
        config: {
          clientId: ebayClientId ? 'configured' : 'missing',
          clientSecret: ebayClientSecret ? 'configured' : 'missing'
        },
        request: requestData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get auth URL action
    if (action === 'get_auth_url') {
      console.log('✅ Get auth URL action triggered');
      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID');
      
      if (!ebayClientId) {
        console.error('eBay Client ID not configured');
        return new Response(JSON.stringify({
          error: 'eBay Client ID not configured'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      const redirectUri = 'https://preview--hustly-mvp.lovable.app/ebay/callback';
      const authUrl = new URL('https://auth.sandbox.ebay.com/oauth2/authorize');
      authUrl.searchParams.set('client_id', ebayClientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'https://api.ebay.com/oauth/api_scope');
      authUrl.searchParams.set('state', state || 'default');

      console.log('Generated auth URL:', authUrl.toString());
      return new Response(JSON.stringify({
        auth_url: authUrl.toString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Exchange code action
    if (action === 'exchange_code') {
      console.log('✅ Exchange code action triggered');
      
      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID');
      const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET');
      
      console.log('Environment check:', {
        hasClientId: !!ebayClientId,
        hasClientSecret: !!ebayClientSecret,
        hasCode: !!code
      });

      if (!ebayClientId || !ebayClientSecret || !code) {
        console.error('Missing required data');
        return new Response(JSON.stringify({
          error: 'Missing credentials or code',
          details: {
            clientId: !!ebayClientId,
            clientSecret: !!ebayClientSecret,
            code: !!code
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }

      // For now, just return a success response to test the flow
      console.log('Returning test success response');
      return new Response(JSON.stringify({
        success: true,
        message: 'Test eBay connection successful',
        account: {
          id: 'test-id',
          platform: 'ebay',
          username: 'test_user',
          connected_at: new Date().toISOString()
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Unknown action
    console.log('❌ Unknown action received:', action);
    return new Response(JSON.stringify({
      error: `Unknown action: ${action}`,
      received: requestData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });

  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});