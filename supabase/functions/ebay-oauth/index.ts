import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EbayOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  sandbox: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, code, state } = await req.json()

    // eBay OAuth configuration
    const ebayConfig: EbayOAuthConfig = {
      clientId: Deno.env.get('EBAY_CLIENT_ID') ?? '',
      clientSecret: Deno.env.get('EBAY_CLIENT_SECRET') ?? '',
      redirectUri: 'https://preview--hustly-mvp.lovable.app/ebay/callback',
      sandbox: true // Change to false for production
    }

    console.log('eBay Config:', {
      clientId: ebayConfig.clientId ? `${ebayConfig.clientId.substring(0, 8)}...` : 'MISSING',
      clientSecret: ebayConfig.clientSecret ? 'SET' : 'MISSING',
      redirectUri: ebayConfig.redirectUri,
      sandbox: ebayConfig.sandbox
    })

    const baseUrl = ebayConfig.sandbox 
      ? 'https://auth.sandbox.ebay.com'
      : 'https://auth.ebay.com'

    const apiUrl = ebayConfig.sandbox
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com'

    if (action === 'get_auth_url') {
      // Step 1: Generate authorization URL
      const scopes = [
        'https://api.ebay.com/oauth/api_scope',
        'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.marketing',
        'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.account',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment'
      ].join(' ')

      // Validate required parameters
      if (!ebayConfig.clientId) {
        throw new Error('eBay Client ID is not configured')
      }

      const authUrl = new URL(`${baseUrl}/oauth2/authorize`)
      authUrl.searchParams.set('client_id', ebayConfig.clientId)
      authUrl.searchParams.set('redirect_uri', ebayConfig.redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', scopes)
      authUrl.searchParams.set('state', state || 'default_state')

      console.log('Generated OAuth URL:', authUrl.toString())
      console.log('Redirect URI being sent:', ebayConfig.redirectUri)
      console.log('Client ID (partial):', ebayConfig.clientId ? `${ebayConfig.clientId.substring(0, 8)}...` : 'MISSING')
      console.log('Scopes:', scopes)

      return new Response(
        JSON.stringify({ 
          auth_url: authUrl.toString(),
          debug_info: {
            client_id: ebayConfig.clientId ? 'present' : 'missing',
            redirect_uri: ebayConfig.redirectUri,
            sandbox: ebayConfig.sandbox
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'exchange_code') {
      // Step 2: Exchange authorization code for access token
      const tokenResponse = await fetch(`${baseUrl}/identity/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${ebayConfig.clientId}:${ebayConfig.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: ebayConfig.redirectUri
        })
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('eBay token exchange failed:', errorText)
        throw new Error(`Token exchange failed: ${tokenResponse.status}`)
      }

      const tokenData = await tokenResponse.json()
      console.log('eBay token exchange successful:', { 
        access_token: tokenData.access_token ? 'present' : 'missing',
        refresh_token: tokenData.refresh_token ? 'present' : 'missing',
        expires_in: tokenData.expires_in
      })

      // Step 3: Get user info
      const userResponse = await fetch(`${apiUrl}/commerce/identity/v1/user/`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      let userInfo = { username: 'Unknown User' }
      if (userResponse.ok) {
        userInfo = await userResponse.json()
      }

      // Step 4: Store the connection in database
      const { data: authData } = await supabase.auth.getUser(
        req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
      )

      if (!authData.user) {
        throw new Error('User not authenticated')
      }

      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()

      const { error: upsertError } = await supabase
        .from('marketplace_accounts')
        .upsert({
          user_id: authData.user.id,
          platform: 'ebay',
          account_username: userInfo.username,
          oauth_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          oauth_expires_at: expiresAt,
          is_connected: true,
          is_active: true,
          last_sync_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,platform'
        })

      if (upsertError) {
        console.error('Database upsert error:', upsertError)
        throw upsertError
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          username: userInfo.username,
          expires_at: expiresAt
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('eBay OAuth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})