import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, code, state } = await req.json()
    
    if (action === 'test') {
      return new Response(
        JSON.stringify({ message: 'Function working' }),
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
      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID')
      const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET')
      
      if (!ebayClientId || !ebayClientSecret || !code) {
        return new Response(
          JSON.stringify({ error: 'Missing credentials or code' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

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

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text()
        return new Response(
          JSON.stringify({ error: 'Token exchange failed', details: error }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      const tokenData = await tokenResponse.json()
      
      // Store in database
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const authHeader = req.headers.get('authorization')
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'No auth header' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      await supabase.from('marketplace_accounts').upsert({
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