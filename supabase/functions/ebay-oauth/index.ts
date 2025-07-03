import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// eBay OAuth configuration
const EBAY_CONFIG = {
  clientId: Deno.env.get('EBAY_CLIENT_ID') || '',
  clientSecret: Deno.env.get('EBAY_CLIENT_SECRET') || '',
  sandbox: Deno.env.get('EBAY_SANDBOX') === 'true',
  get redirectUri() {
    return `https://preview--hustly-mvp.lovable.app/ebay/callback`;
  },
  get baseUrl() {
    return this.sandbox ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com';
  },
  get authUrl() {
    return this.sandbox ? 'https://auth.sandbox.ebay.com' : 'https://auth.ebay.com';
  }
};

const REQUIRED_SCOPES = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly'
].join(' ');

serve(async (req) => {
  console.log('=== EBAY OAUTH FUNCTION START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Reading request body...');
    
    // Handle different content types and empty bodies
    let requestData;
    try {
      const body = await req.text();
      console.log('Raw body text:', body);
      
      if (!body || body.trim() === '') {
        console.error('Empty request body received');
        return new Response(JSON.stringify({
          error: 'Empty request body',
          details: 'No data received in request body'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      requestData = JSON.parse(body);
      console.log('Parsed request data:', requestData);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(JSON.stringify({
        error: 'Invalid JSON in request body',
        details: parseError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const { action, code, state } = requestData;
    console.log('Action:', action, 'Code present:', !!code, 'State:', state);

    if (action === 'test') {
      console.log('Test action - returning success');
      return new Response(JSON.stringify({
        message: 'Function working'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'debug') {
      console.log('Debug action - checking environment');
      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID');
      const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET');
      console.log('Client ID present:', !!ebayClientId);
      console.log('Client Secret present:', !!ebayClientSecret);
      
      return new Response(JSON.stringify({
        status: 'ok',
        config: {
          clientId: ebayClientId ? 'configured' : 'missing',
          clientSecret: ebayClientSecret ? 'configured' : 'missing'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'get_auth_url') {
      console.log('✅ Get auth URL action - generating eBay OAuth URL');
      
      if (!EBAY_CONFIG.clientId) {
        console.error('eBay Client ID not configured');
        return new Response(JSON.stringify({
          error: 'eBay Client ID not configured'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      // Generate OAuth authorization URL
      const authUrl = `${EBAY_CONFIG.authUrl}/oauth2/authorize?` + 
        `client_id=${EBAY_CONFIG.clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(EBAY_CONFIG.redirectUri)}&` +
        `scope=${encodeURIComponent(REQUIRED_SCOPES)}&` +
        `state=${state || 'ebay_oauth'}`;

      console.log('Generated auth URL:', authUrl);
      
      return new Response(JSON.stringify({
        auth_url: authUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'exchange_code') {
      console.log('=== TOKEN EXCHANGE START ===');
      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID');
      const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET');
      
      console.log('Credentials check - Client ID:', !!ebayClientId, 'Secret:', !!ebayClientSecret, 'Code:', !!code);

      if (!ebayClientId || !ebayClientSecret || !code) {
        console.error('Missing credentials or code');
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

      console.log('Making eBay token request...');
      
      try {
        const tokenResponse = await fetch(`${EBAY_CONFIG.baseUrl}/identity/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${EBAY_CONFIG.clientId}:${EBAY_CONFIG.clientSecret}`)}`
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: EBAY_CONFIG.redirectUri
          })
        });

        console.log('eBay response status:', tokenResponse.status);
        
        if (!tokenResponse.ok) {
          const error = await tokenResponse.text();
          console.error('eBay error response:', error);
          return new Response(JSON.stringify({
            error: 'Token exchange failed',
            details: error
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          });
        }

        const tokenData = await tokenResponse.json();
        console.log('eBay token data received, access_token present:', !!tokenData.access_token);

        // Store in database with CORRECT schema fields
        console.log('Creating Supabase client...');
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '', 
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const authHeader = req.headers.get('authorization');
        console.log('Auth header present:', !!authHeader);
        
        if (!authHeader) {
          console.error('No auth header provided');
          return new Response(JSON.stringify({
            error: 'No auth header'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401
          });
        }

        console.log('Getting user from auth header...');
        const { data: { user }, error: userError } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        
        console.log('User lookup result - User found:', !!user, 'Error:', userError?.message);
        
        if (userError || !user) {
          console.error('User authentication failed:', userError);
          return new Response(JSON.stringify({
            error: 'User not found or authentication failed'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401
          });
        }

        console.log('Storing marketplace account for user:', user.id);
        
        // Calculate expiration time
        const expiresIn = tokenData.expires_in || 7200;
        const expirationTime = new Date(Date.now() + expiresIn * 1000);

        // Get user info from eBay to store real username
        let realUsername = 'ebay_seller';
        try {
          // Try the User Identity API first
          const userResponse = await fetch(`${EBAY_CONFIG.baseUrl}/commerce/identity/v1/user/`, {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Accept': 'application/json'
            }
          });
          
          if (userResponse.ok) {
            const userInfo = await userResponse.json();
            realUsername = userInfo.username || userInfo.userId || 'ebay_seller';
            console.log('Retrieved eBay username from Identity API:', realUsername);
          } else {
            console.log('Identity API failed, trying Account API...');
            
            // Fallback to Account API
            const accountResponse = await fetch(`${EBAY_CONFIG.baseUrl}/sell/account/v1/privilege`, {
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Accept': 'application/json'
              }
            });
            
            if (accountResponse.ok) {
              const accountInfo = await accountResponse.json();
              realUsername = accountInfo.username || `ebay_user_${Date.now()}`;
              console.log('Retrieved eBay username from Account API:', realUsername);
            }
          }
        } catch (err) {
          console.log('Failed to get eBay user info, using timestamped default:', err);
          realUsername = `ebay_user_${Date.now()}`;
        }

        // ✅ CORRECT database fields with real user data
        const marketplaceAccountData = {
          user_id: user.id,
          platform: 'ebay',
          account_username: realUsername,
          oauth_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          oauth_expires_at: expirationTime.toISOString(),
          token_expires_at: expirationTime.toISOString(),
          is_connected: true,
          is_active: true,
          platform_settings: {
            sandbox: EBAY_CONFIG.sandbox,
            scopes: REQUIRED_SCOPES.split(' '),
            token_type: tokenData.token_type || 'Bearer'
          }
        };

        console.log('Inserting marketplace account data...');
        
        const { data: accountData, error: dbError } = await supabase
          .from('marketplace_accounts')
          .upsert(marketplaceAccountData, {
            onConflict: 'user_id,platform'
          })
          .select()
          .single();

        console.log('Database operation result - Data:', !!accountData, 'Error:', dbError?.message);
        
        if (dbError) {
          console.error('Database error details:', dbError);
          return new Response(JSON.stringify({
            error: 'Failed to store account',
            details: dbError.message
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          });
        }

        console.log('eBay connection stored successfully');
        
        return new Response(JSON.stringify({
          success: true,
          message: 'eBay connected successfully',
          username: marketplaceAccountData.account_username,
          account: {
            id: accountData?.id,
            platform: 'ebay',
            username: marketplaceAccountData.account_username,
            connected_at: new Date().toISOString()
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (fetchError) {
        console.error('Network error during eBay token exchange:', fetchError);
        return new Response(JSON.stringify({
          error: 'Network error during token exchange',
          details: fetchError.message
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    }

    console.log('Unknown action received:', action);
    return new Response(JSON.stringify({
      error: `Unknown action: ${action}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });

  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error type:', typeof error);
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