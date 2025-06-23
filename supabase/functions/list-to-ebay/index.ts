
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { listing } = await req.json()
    
    const ebayApiKey = Deno.env.get('EBAY_API_KEY')
    if (!ebayApiKey) {
      throw new Error('eBay API key not configured')
    }

    // Get OAuth token (this is simplified - in production you'd need proper OAuth flow)
    const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(ebayApiKey + ':')}`
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get eBay OAuth token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Create eBay listing using Trading API
    const listingXml = `<?xml version="1.0" encoding="utf-8"?>
    <AddFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
      <RequesterCredentials>
        <eBayAuthToken>${accessToken}</eBayAuthToken>
      </RequesterCredentials>
      <Item>
        <Title>${listing.title}</Title>
        <Description><![CDATA[${listing.description}]]></Description>
        <PrimaryCategory>
          <CategoryID>281</CategoryID>
        </PrimaryCategory>
        <StartPrice>${listing.price}</StartPrice>
        <ConditionID>3000</ConditionID>
        <ListingDuration>Days_7</ListingDuration>
        <ListingType>FixedPriceItem</ListingType>
        <Currency>USD</Currency>
        <Country>US</Country>
        <Location>United States</Location>
        <ShippingDetails>
          <ShippingType>Flat</ShippingType>
          <ShippingServiceOptions>
            <ShippingServicePriority>1</ShippingServicePriority>
            <ShippingService>USPSGround</ShippingService>
            <ShippingServiceCost>${listing.shippingCost}</ShippingServiceCost>
          </ShippingServiceOptions>
        </ShippingDetails>
        <PictureDetails>
          ${listing.photos.map((photo: string, index: number) => 
            `<PictureURL>${photo}</PictureURL>`
          ).join('')}
        </PictureDetails>
      </Item>
    </AddFixedPriceItemRequest>`

    const ebayResponse = await fetch('https://api.ebay.com/ws/api.dll', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-DEV-NAME': ebayApiKey,
        'X-EBAY-API-APP-NAME': ebayApiKey,
        'X-EBAY-API-CERT-NAME': ebayApiKey,
        'X-EBAY-API-CALL-NAME': 'AddFixedPriceItem',
        'X-EBAY-API-SITEID': '0'
      },
      body: listingXml
    })

    const responseText = await ebayResponse.text()
    console.log('eBay API Response:', responseText)

    // Parse response to check for success
    if (responseText.includes('<Ack>Success</Ack>')) {
      const itemIdMatch = responseText.match(/<ItemID>(\d+)<\/ItemID>/)
      const itemId = itemIdMatch ? itemIdMatch[1] : null

      return new Response(
        JSON.stringify({ 
          success: true, 
          itemId: itemId,
          message: 'Item successfully listed on eBay'
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    } else {
      throw new Error('eBay listing failed: ' + responseText)
    }

  } catch (error) {
    console.error('eBay listing error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
