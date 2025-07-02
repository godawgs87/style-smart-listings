import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== EBAY OAUTH FUNCTION START ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Reading request body...')
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    console.log('Request method:', req.method)
    console.log('Request URL:', req.url)
    
    // Clone the request so we can read the body multiple times
    const clonedReq = req.clone()
    
    let requestData
    try {
      // First try to read as text to see what we get
      const bodyText = await clonedReq.text()
      console.log('Raw request body as text:', bodyText)
      console.log('Body length:', bodyText.length)
      
      if (!bodyText || bodyText.trim() === '') {
        console.error('Empty request body received')
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      // Now parse the JSON
      requestData = JSON.parse(bodyText)
      console.log('Parsed request data:', requestData)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body', 
          details: parseError.message,
          method: req.method,
          url: req.url
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    const { action, code, state } = requestData
    console.log('Action:', action, 'Code present:', !!code, 'State:', state)
    
    if (action === 'test') {
      console.log('Test action - returning success')
      return new Response(
        JSON.stringify({ message: 'Function working' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (action === 'debug') {
      console.log('Debug action - checking environment')
      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID')
      const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET')
      console.log('Client ID present:', !!ebayClientId)
      console.log('Client Secret present:', !!ebayClientSecret)
      
      return new Response(
        JSON.stringify({
          status: 'ok',
          config: {
            clientId: ebayClientId ? 'configured' : 'missing',
            clientSecret: ebayClientSecret ? 'configured' : 'missing'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (action === 'get_auth_url') {
      console.log('Getting auth URL...')
      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID')
      if (!ebayClientId) {
        console.error('eBay Client ID not configured')
        return new Response(
          JSON.stringify({ error: 'eBay Client ID not configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      const redirectUri = 'https://preview--hustly-mvp.lovable.app/ebay/callback'
      const authUrl = new URL('https://auth.sandbox.ebay.com/oauth2/authorize')
      authUrl.searchParams.set('client_id', ebayClientId)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', 'https://api.ebay.com/oauth/api_scope')
      authUrl.searchParams.set('state', state || 'default')

      console.log('Generated auth URL:', authUrl.toString())
      return new Response(
        JSON.stringify({ auth_url: authUrl.toString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (action === 'exchange_code') {
      console.log('=== TOKEN EXCHANGE START ===')
      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID')
      const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET')
      console.log('Credentials check - Client ID:', !!ebayClientId, 'Secret:', !!ebayClientSecret, 'Code:', !!code)
      console.log('EBAY_CLIENT_ID value:', ebayClientId ? `${ebayClientId.substring(0, 10)}...` : 'MISSING')
      console.log('EBAY_CLIENT_SECRET value:', ebayClientSecret ? `${ebayClientSecret.substring(0, 10)}...` : 'MISSING')
      console.log('Code value:', code ? `${code.substring(0, 20)}...` : 'MISSING')
      
      if (!ebayClientId || !ebayClientSecret || !code) {
        console.error('Missing credentials or code - Details:')
        console.error('- EBAY_CLIENT_ID present:', !!ebayClientId)
        console.error('- EBAY_CLIENT_SECRET present:', !!ebayClientSecret)
        console.error('- Authorization code present:', !!code)
        return new Response(
          JSON.stringify({ 
            error: 'Missing credentials or code',
            details: {
              clientId: !!ebayClientId,
              clientSecret: !!ebayClientSecret,
              code: !!code
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      console.log('Making eBay token request...')
      try {
        const tokenResponse = await fetch('https://auth.sandbox.ebay.com/identity/v1/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${ebayClientId}:${ebayClientSecret}`)}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'https://preview--hustly-mvp.lovable.app/ebay/callback'
          })
        })

        console.log('eBay response status:', tokenResponse.status)
        if (!tokenResponse.ok) {
          const error = await tokenResponse.text()
          console.error('eBay error response:', error)
          return new Response(
            JSON.stringify({ error: 'Token exchange failed', details: error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        const tokenData = await tokenResponse.json()
        console.log('eBay token data received, access_token present:', !!tokenData.access_token)
        
        // Store in database
        console.log('Creating Supabase client...')
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const authHeader = req.headers.get('authorization')
        console.log('Auth header present:', !!authHeader)
        if (!authHeader) {
          console.error('No auth header provided')
          return new Response(
            JSON.stringify({ error: 'No auth header' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          )
        }

        console.log('Getting user from auth header...')
        const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
        console.log('User lookup result - User found:', !!user, 'Error:', userError?.message)
        
        if (userError || !user) {
          console.error('User authentication failed:', userError)
          return new Response(
            JSON.stringify({ error: 'User not found or authentication failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          )
        }

        console.log('Storing marketplace account for user:', user.id)
        
        // Calculate expiration time (eBay tokens typically expire in 2 hours = 7200 seconds)
        const expiresIn = tokenData.expires_in || 7200
        const expirationTime = new Date(Date.now() + (expiresIn * 1000))
        
        const { data: accountData, error: dbError } = await supabase.from('marketplace_accounts').upsert({
          user_id: user.id,
          platform: 'ebay',
          oauth_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          oauth_expires_at: expirationTime.toISOString(),
          account_username: 'ebay_user',
          is_connected: true,
          is_active: true,
          platform_settings: { sandbox: true }
        }, { onConflict: 'user_id,platform' })

        console.log('Database operation result - Data present:', !!accountData, 'Error:', dbError?.message)
        if (dbError) {
          console.error('Database error details:', dbError)
          return new Response(
            JSON.stringify({ error: 'Failed to store account', details: dbError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        console.log('eBay connection stored successfully')
        return new Response(
          JSON.stringify({ success: true, message: 'eBay connected', username: 'ebay_user' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      } catch (fetchError) {
        console.error('Network error during eBay token exchange:', fetchError)
        return new Response(
          JSON.stringify({ error: 'Network error during token exchange', details: fetchError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }

    console.log('Unknown action received:', action)
    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('=== FUNCTION ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})