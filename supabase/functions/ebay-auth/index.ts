import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EBAY-AUTH] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("eBay Auth function started");

    const ebayAppId = Deno.env.get('EBAY_CLIENT_ID');
    const ebayDevId = Deno.env.get('EBAY_DEV_ID'); 
    const ebayCertId = Deno.env.get('EBAY_CLIENT_SECRET');

    if (!ebayAppId || !ebayDevId || !ebayCertId) {
      throw new Error('eBay credentials not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");

    const { action, ...params } = await req.json();
    logStep("Processing auth action", { action });

    switch (action) {
      case 'get_session_id':
        return await getSessionId(ebayAppId, ebayDevId, ebayCertId);
      
      case 'fetch_token':
        return await fetchToken(supabaseClient, user.id, params, ebayAppId, ebayDevId, ebayCertId);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function getSessionId(appId: string, devId: string, certId: string) {
  logStep("Getting eBay session ID");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<GetSessionIDRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <Username></Username>
    <Password></Password>
  </RequesterCredentials>
  <RuName>Hustly_Reseller_Platform</RuName>
</GetSessionIDRequest>`;

  const response = await fetch('https://api.ebay.com/ws/api.dll', {
    method: 'POST',
    headers: {
      'X-EBAY-API-CALL-NAME': 'GetSessionID',
      'X-EBAY-API-APP-NAME': appId,
      'X-EBAY-API-DEV-NAME': devId,
      'X-EBAY-API-CERT-NAME': certId,
      'X-EBAY-API-SITEID': '0',
      'X-EBAY-API-COMPATIBILITY-LEVEL': '1209',
      'Content-Type': 'text/xml'
    },
    body: xml
  });

  if (!response.ok) {
    throw new Error(`eBay API error: ${response.status}`);
  }

  const xmlResponse = await response.text();
  logStep("SessionID response received");

  // Extract session ID from XML
  const sessionIdMatch = xmlResponse.match(/<SessionID>(.*?)<\/SessionID>/);
  if (!sessionIdMatch) {
    throw new Error('Failed to extract session ID from eBay response');
  }

  const sessionId = sessionIdMatch[1];
  logStep("Session ID extracted", { sessionId });

  // Generate eBay Sign-In URL
  const signInUrl = `https://signin.ebay.com/ws/eBayISAPI.dll?SignIn&RuName=Hustly_Reseller_Platform&SessID=${sessionId}`;

  return new Response(JSON.stringify({
    status: 'success',
    sessionId,
    signInUrl,
    message: 'Session ID generated successfully. User must complete sign-in at the provided URL.'
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function fetchToken(supabaseClient: any, userId: string, params: any, appId: string, devId: string, certId: string) {
  logStep("Fetching eBay token", { userId });

  const { sessionId } = params;
  if (!sessionId) {
    throw new Error('Session ID required');
  }

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<FetchTokenRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <Username></Username>
    <Password></Password>
  </RequesterCredentials>
  <SessionID>${sessionId}</SessionID>
</FetchTokenRequest>`;

  const response = await fetch('https://api.ebay.com/ws/api.dll', {
    method: 'POST',
    headers: {
      'X-EBAY-API-CALL-NAME': 'FetchToken',
      'X-EBAY-API-APP-NAME': appId,
      'X-EBAY-API-DEV-NAME': devId,
      'X-EBAY-API-CERT-NAME': certId,
      'X-EBAY-API-SITEID': '0',
      'X-EBAY-API-COMPATIBILITY-LEVEL': '1209',
      'Content-Type': 'text/xml'
    },
    body: xml
  });

  if (!response.ok) {
    throw new Error(`eBay API error: ${response.status}`);
  }

  const xmlResponse = await response.text();
  logStep("FetchToken response received");

  // Extract token from XML
  const tokenMatch = xmlResponse.match(/<eBayAuthToken>(.*?)<\/eBayAuthToken>/);
  if (!tokenMatch) {
    throw new Error('Failed to extract token from eBay response');
  }

  const authToken = tokenMatch[1];
  
  // Extract expiration date
  const expirationMatch = xmlResponse.match(/<HardExpirationTime>(.*?)<\/HardExpirationTime>/);
  const expirationDate = expirationMatch ? new Date(expirationMatch[1]) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  logStep("Token extracted successfully");

  // Save account to database
  const accountData = {
    user_id: userId,
    platform: 'ebay',
    account_username: 'eBay User', // Will be updated later
    is_connected: true,
    is_active: true,
    oauth_token: authToken,
    oauth_expires_at: expirationDate.toISOString(),
    account_id: `ebay_${userId}`,
    seller_level: 'standard',
    api_permissions: ['read', 'write'],
    last_sync_at: new Date().toISOString(),
    platform_settings: {
      auto_list: true,
      auto_relist: false,
      listing_duration: '7_days',
      listing_format: 'fixed_price'
    }
  };

  const { error } = await supabaseClient
    .from('marketplace_accounts')
    .upsert(accountData, { onConflict: 'user_id,platform' });

  if (error) {
    throw new Error(`Failed to save eBay account: ${error.message}`);
  }

  logStep("eBay account saved successfully");

  return new Response(JSON.stringify({
    status: 'success',
    message: 'eBay account connected successfully',
    account: {
      platform: 'ebay',
      connected: true,
      expiresAt: expirationDate.toISOString()
    }
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}