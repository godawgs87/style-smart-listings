import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== EBAY OAUTH FUNCTION START ===')
  console.log('Method:', req.method)
  console.log('Headers:', Object.fromEntries(req.headers.entries()))
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    console.log('Raw body:', body)
    const { action, code, state } = JSON.parse(body)
    console.log('Parsed action:', action, 'code present:', !!code, 'state:', state)
    
    if (action === 'test') {
      return new Response(
        JSON.stringify({ message: 'Function working' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (action === 'debug') {
      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID')
      const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET')
      
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
      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID')
      if (!ebayClientId) {
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
      
      if (!ebayClientId || !ebayClientSecret || !code) {
        console.log('Missing credentials or code')
        return new Response(
          JSON.stringify({ error: 'Missing credentials or code' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      console.log('Making eBay token request...')
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
        console.log('eBay error response:', error)
        return new Response(
          JSON.stringify({ error: 'Token exchange failed', details: error }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      const tokenData = await tokenResponse.json()
      console.log('eBay token data received:', !!tokenData.access_token)
      
      // Store in database
      console.log('Creating Supabase client...')
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const authHeader = req.headers.get('authorization')
      console.log('Auth header present:', !!authHeader)
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'No auth header' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      console.log('Getting user from auth header...')
      const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      console.log('User found:', !!user, 'Error:', userError)
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      console.log('Storing marketplace account for user:', user.id)
      const { data: accountData, error: dbError } = await supabase.from('marketplace_accounts').upsert({
        user_id: user.id,
        platform: 'ebay',
        oauth_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        oauth_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        account_username: 'ebay_user',
        is_connected: true,
        is_active: true,
        platform_settings: { sandbox: true }
      }, { onConflict: 'user_id,platform' })

      console.log('Database operation result:', !!accountData, 'Error:', dbError)
      if (dbError) {
        console.log('Database error details:', dbError)
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
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})