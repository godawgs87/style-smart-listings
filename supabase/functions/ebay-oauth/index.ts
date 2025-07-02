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
    let requestBody
    try {
      requestBody = await req.json()
      console.log('Request body:', requestBody)
    } catch (e) {
      console.error('Failed to parse JSON:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const { action } = requestBody

    if (action === 'test') {
      console.log('Test action - returning success')
      return new Response(
        JSON.stringify({ message: 'Function is working', timestamp: new Date().toISOString() }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'debug') {
      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID')
      const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET')
      
      console.log('Debug action - checking environment')
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
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'get_auth_url') {
      console.log('Getting auth URL...')
      
      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID')
      const { state } = requestBody
      
      if (!ebayClientId) {
        console.error('eBay Client ID not configured')
        return new Response(
          JSON.stringify({ error: 'eBay Client ID is not configured' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      const redirectUri = 'https://preview--hustly-mvp.lovable.app/ebay/callback'
      const baseUrl = 'https://auth.sandbox.ebay.com'
      
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
      authUrl.searchParams.set('client_id', ebayClientId)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', scopes)
      authUrl.searchParams.set('state', state || 'default_state')

      console.log('Generated OAuth URL:', authUrl.toString())

      return new Response(
        JSON.stringify({ 
          auth_url: authUrl.toString(),
          debug_info: {
            client_id: ebayClientId ? 'present' : 'missing',
            redirect_uri: redirectUri
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'exchange_code') {
      console.log('=== TOKEN EXCHANGE START ===')
      const { code, state } = requestBody
      console.log('Code present:', code ? 'YES' : 'NO')
      
      if (!code) {
        console.error('No authorization code provided')
        return new Response(
          JSON.stringify({ error: 'No authorization code provided' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      const ebayClientId = Deno.env.get('EBAY_CLIENT_ID')
      const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET')
      
      if (!ebayClientId || !ebayClientSecret) {
        console.error('eBay credentials not configured')
        return new Response(
          JSON.stringify({ error: 'eBay credentials not configured' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      const redirectUri = 'https://preview--hustly-mvp.lovable.app/ebay/callback'
      const tokenUrl = 'https://auth.sandbox.ebay.com/identity/v1/oauth2/token'
      
      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })

      console.log('Making token exchange request to:', tokenUrl)
      
      try {
        const credentials = btoa(`${ebayClientId}:${ebayClientSecret}`)
        
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
        const responseText = await tokenResponse.text()
        console.log('Token response body:', responseText)

        if (!tokenResponse.ok) {
          console.error('eBay token exchange failed:', responseText)
          return new Response(
            JSON.stringify({ 
              error: `eBay token exchange failed (${tokenResponse.status})`,
              ebay_error: responseText
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          )
        }

        const tokenData = JSON.parse(responseText)
        console.log('Token exchange successful!')
        
        // For now, just return success without storing in database
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Token exchange successful',
            has_access_token: !!tokenData.access_token,
            username: 'ebay_user'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )

      } catch (fetchError) {
        console.error('Fetch error during token exchange:', fetchError)
        return new Response(
          JSON.stringify({ 
            error: 'Network error during token exchange',
            details: fetchError.message
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }
    }

    console.log('Unknown action:', action)
    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('=== FUNCTION ERROR ===')
    console.error('Error:', error)
    console.error('Error message:', error.message)
    console.error('Stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})