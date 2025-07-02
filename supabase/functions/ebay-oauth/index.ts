import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== EBAY OAUTH FUNCTION CALLED ===')
    console.log('Timestamp:', new Date().toISOString())
    console.log('Method:', req.method)
    console.log('Headers:', Object.fromEntries(req.headers.entries()))

    const { action, code, state } = await req.json()
    console.log('Request body parsed:', { action, code: code ? 'present' : 'missing', state: state ? 'present' : 'missing' })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // eBay configuration
    const ebayClientId = Deno.env.get('EBAY_CLIENT_ID') ?? ''
    const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET') ?? ''
    const redirectUri = 'https://preview--hustly-mvp.lovable.app/ebay/callback'
    const sandbox = true

    console.log('eBay config loaded:', {
      clientId: ebayClientId ? `${ebayClientId.substring(0, 8)}...` : 'MISSING',
      clientSecret: ebayClientSecret ? 'SET' : 'MISSING',
      redirectUri: redirectUri,
      sandbox: sandbox
    })

    const baseUrl = sandbox 
      ? 'https://auth.sandbox.ebay.com'
      : 'https://auth.ebay.com'

    const apiUrl = sandbox
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com'

    if (action === 'debug') {
      console.log('Debug action called')
      return new Response(
        JSON.stringify({ 
          status: 'ok',
          timestamp: new Date().toISOString(),
          config: {
            clientId: ebayClientId ? 'configured' : 'missing',
            clientSecret: ebayClientSecret ? 'configured' : 'missing',
            redirectUri: redirectUri,
            sandbox: sandbox,
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

    if (action === 'test') {
      console.log('Test action called')
      return new Response(
        JSON.stringify({ 
          message: 'Function is working',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'get_auth_url') {
      console.log('Getting auth URL...')
      
      if (!ebayClientId) {
        throw new Error('eBay Client ID is not configured')
      }

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
            redirect_uri: redirectUri,
            sandbox: sandbox
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
      console.log('Code present:', code ? 'YES' : 'NO')
      console.log('Code length:', code?.length || 0)
      
      if (!code) {
        console.log('ERROR: No authorization code provided')
        throw new Error('No authorization code provided')
      }

      if (!ebayClientId || !ebayClientSecret) {
        console.log('ERROR: eBay credentials not configured')
        throw new Error('eBay credentials not configured')
      }

      // Token exchange request
      const tokenUrl = `${baseUrl}/identity/v1/oauth2/token`
      console.log('Token URL:', tokenUrl)
      console.log('Redirect URI:', redirectUri)

      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })

      console.log('Form data:', formData.toString())

      const credentials = btoa(`${ebayClientId}:${ebayClientSecret}`)
      console.log('Basic auth credentials length:', credentials.length)

      console.log('Making token exchange request...')
      
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
        console.log('Token response ok:', tokenResponse.ok)

        const responseText = await tokenResponse.text()
        console.log('Token response body:', responseText)

        if (!tokenResponse.ok) {
          console.error('=== EBAY ERROR RESPONSE ===')
          console.error('Status:', tokenResponse.status)
          console.error('Body:', responseText)
          
          return new Response(
            JSON.stringify({ 
              error: `eBay token exchange failed (${tokenResponse.status})`,
              ebay_error: responseText,
              details: {
                status: tokenResponse.status,
                client_id_present: !!ebayClientId,
                redirect_uri: redirectUri
              }
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          )
        }

        const tokenData = JSON.parse(responseText)
        console.log('Token exchange successful!')
        console.log('Access token received:', tokenData.access_token ? 'YES' : 'NO')

        // For now, just return success without storing in database to isolate the issue
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Token exchange successful',
            has_access_token: !!tokenData.access_token
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )

      } catch (fetchError) {
        console.error('=== FETCH ERROR ===')
        console.error('Error:', fetchError)
        console.error('Error message:', fetchError.message)
        
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

    console.log('Invalid action:', action)
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
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
        error: error.message,
        timestamp: new Date().toISOString(),
        type: 'function_error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})