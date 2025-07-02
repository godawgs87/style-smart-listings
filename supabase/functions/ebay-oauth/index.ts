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

    console.log('=== eBay OAuth Request ===')
    console.log('Action:', action)
    console.log('eBay Config:', {
      clientId: ebayConfig.clientId ? `${ebayConfig.clientId.substring(0, 8)}...` : 'MISSING',
      clientSecret: ebayConfig.clientSecret ? 'SET' : 'MISSING',
      redirectUri: ebayConfig.redirectUri,
      sandbox: ebayConfig.sandbox
    })

    // Validate required configuration
    if (!ebayConfig.clientId || !ebayConfig.clientSecret) {
      throw new Error('eBay Client ID and Client Secret must be configured')
    }

    const baseUrl = ebayConfig.sandbox 
      ? 'https://auth.sandbox.ebay.com'
      : 'https://auth.ebay.com'

    const apiUrl = ebayConfig.sandbox
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com'

    if (action === 'debug') {
      return new Response(
        JSON.stringify({ 
          status: 'ok',
          config: {
            clientId: ebayConfig.clientId ? 'configured' : 'missing',
            clientSecret: ebayConfig.clientSecret ? 'configured' : 'missing',
            redirectUri: ebayConfig.redirectUri,
            sandbox: ebayConfig.sandbox,
            baseUrl,
            apiUrl
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

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

      const authUrl = new URL(`${baseUrl}/oauth2/authorize`)
      authUrl.searchParams.set('client_id', ebayConfig.clientId)
      authUrl.searchParams.set('redirect_uri', ebayConfig.redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', scopes)
      authUrl.searchParams.set('state', state || 'default_state')

      console.log('Generated OAuth URL:', authUrl.toString())

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
      console.log('=== Starting Token Exchange ===')
      console.log('Code received:', code ? 'present' : 'missing')
      console.log('State received:', state ? 'present' : 'missing')
      
      if (!code) {
        throw new Error('No authorization code provided')
      }

      // Create the token request
      const tokenUrl = `${baseUrl}/identity/v1/oauth2/token`
      const credentials = btoa(`${ebayConfig.clientId}:${ebayConfig.clientSecret}`)
      
      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: ebayConfig.redirectUri
      })

      console.log('Token exchange details:')
      console.log('- URL:', tokenUrl)
      console.log('- Redirect URI:', ebayConfig.redirectUri)
      console.log('- Form data:', formData.toString())
      console.log('- Client ID:', ebayConfig.clientId ? ebayConfig.clientId.substring(0, 10) + '...' : 'MISSING')

      try {
        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,
            'Accept': 'application/json'
          },
          body: formData
        })

        console.log('Token response status:', tokenResponse.status)
        console.log('Token response headers:', Object.fromEntries(tokenResponse.headers.entries()))

        const responseText = await tokenResponse.text()
        console.log('Token response body:', responseText)

        if (!tokenResponse.ok) {
          console.error('=== eBay Token Exchange Failed ===')
          console.error('Status:', tokenResponse.status)
          console.error('Status text:', tokenResponse.statusText)
          console.error('Response body:', responseText)
          
          // Try to parse error details
          let errorDetails = responseText
          try {
            const errorJson = JSON.parse(responseText)
            errorDetails = JSON.stringify(errorJson, null, 2)
          } catch (e) {
            // Response is not JSON, use as-is
          }
          
          throw new Error(`eBay token exchange failed (${tokenResponse.status}): ${errorDetails}`)
        }

        const tokenData = JSON.parse(responseText)
        console.log('=== Token Exchange Success ===')
        console.log('Access token received:', tokenData.access_token ? 'YES' : 'NO')
        console.log('Refresh token received:', tokenData.refresh_token ? 'YES' : 'NO')
        console.log('Expires in:', tokenData.expires_in)

        if (!tokenData.access_token) {
          throw new Error('No access token in eBay response')
        }

        // Get user info
        let userInfo = { username: 'Unknown User' }
        try {
          const userResponse = await fetch(`${apiUrl}/commerce/identity/v1/user/`, {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json'
            }
          })

          if (userResponse.ok) {
            userInfo = await userResponse.json()
            console.log('User info retrieved:', userInfo.username)
          } else {
            console.warn('Failed to get user info:', userResponse.status)
          }
        } catch (error) {
          console.warn('Error getting user info:', error)
        }

        // Store in database
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          throw new Error('No authorization header provided')
        }

        const { data: authData, error: authError } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        )

        if (authError || !authData.user) {
          console.error('Authentication error:', authError)
          throw new Error(`Authentication error: ${authError?.message || 'User not found'}`)
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

        console.log('=== eBay Connection Complete ===')

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

      } catch (fetchError) {
        console.error('=== Network Error During Token Exchange ===')
        console.error('Error:', fetchError)
        throw new Error(`Network error during token exchange: ${fetchError.message}`)
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('=== eBay OAuth Error ===')
    console.error('Error:', error)
    console.error('Stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})