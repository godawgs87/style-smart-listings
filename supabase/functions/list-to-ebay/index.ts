
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
    const { listing, accountInfo } = await req.json()
    console.log('🔄 Starting eBay listing creation for:', listing.id)
    
    if (!accountInfo?.oauth_token) {
      throw new Error('No eBay OAuth token found. Please reconnect your eBay account.')
    }

    const ebayClientId = Deno.env.get('EBAY_CLIENT_ID')
    const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET')
    
    if (!ebayClientId || !ebayClientSecret) {
      throw new Error('eBay API credentials not configured')
    }

    // Use the stored OAuth token
    const accessToken = accountInfo.oauth_token
    console.log('📡 Using stored OAuth token for eBay API')

    // Map condition to eBay condition IDs
    const conditionMap: Record<string, number> = {
      'New': 1000,
      'Like New': 1500,
      'Excellent': 2000,
      'Very Good': 2500,
      'Good': 3000,
      'Acceptable': 4000,
      'Used': 3000
    }
    
    const conditionId = conditionMap[listing.condition] || 3000

    // Create eBay listing using REST API
    const listingPayload = {
      product: {
        title: listing.title.substring(0, 80), // eBay title limit
        description: listing.description || 'No description provided',
        imageUrls: listing.photos?.slice(0, 12) || [], // eBay allows max 12 images
        aspects: {
          Brand: [listing.brand || 'Unbranded'],
          Condition: [listing.condition || 'Used']
        }
      },
      condition: 'USED_EXCELLENT',
      conditionDescription: listing.condition || 'Used',
      packageWeightAndSize: {
        packageType: 'BULKY_GOODS',
        weight: {
          value: listing.weight_oz ? (listing.weight_oz / 16).toString() : '1',
          unit: 'POUND'
        }
      },
      availability: {
        shipToLocationAvailability: {
          quantity: 1
        }
      },
      pricing: {
        price: {
          value: listing.price.toString(),
          currency: 'USD'
        },
        pricingVisibility: 'IMMEDIATE'
      },
      fulfillmentPolicy: {
        fulfillmentPolicyId: 'DEFAULT'
      },
      paymentPolicy: {
        paymentPolicyId: 'DEFAULT'
      },
      returnPolicy: {
        returnPolicyId: 'DEFAULT'
      },
      categoryId: '281', // Default category - should be mapped properly
      listingDuration: 'GTC',
      listingFormat: 'FIXED_PRICE'
    }

    console.log('📤 Sending listing to eBay API...')
    
    const ebayResponse = await fetch('https://api.ebay.com/sell/inventory/v1/inventory_item', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(listingPayload)
    })

    const responseData = await ebayResponse.json()
    console.log('📥 eBay API Response:', responseData)

    if (!ebayResponse.ok) {
      // Handle token expiration
      if (ebayResponse.status === 401) {
        throw new Error('eBay token expired. Please reconnect your eBay account.')
      }
      
      throw new Error(`eBay API Error: ${responseData.errors?.[0]?.message || 'Unknown error'}`)
    }

    // For inventory API, we need to create an offer to actually list the item
    const offerId = `${listing.id}-${Date.now()}`
    const offerPayload = {
      sku: responseData.sku || listing.id,
      marketplaceId: 'EBAY_US',
      format: 'FIXED_PRICE',
      availableQuantity: 1,
      pricing: {
        price: {
          value: listing.price.toString(),
          currency: 'USD'
        }
      },
      pricingVisibility: 'IMMEDIATE',
      listingDescription: listing.description || 'No description provided',
      listingPolicies: {
        fulfillmentPolicyId: 'DEFAULT',
        paymentPolicyId: 'DEFAULT',
        returnPolicyId: 'DEFAULT'
      },
      categoryId: '281'
    }

    const offerResponse = await fetch('https://api.ebay.com/sell/inventory/v1/offer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(offerPayload)
    })

    const offerData = await offerResponse.json()
    console.log('📥 eBay Offer Response:', offerData)

    if (!offerResponse.ok) {
      throw new Error(`eBay Offer Error: ${offerData.errors?.[0]?.message || 'Unknown error'}`)
    }

    // Publish the offer to create the actual listing
    const publishResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerData.offerId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    const publishData = await publishResponse.json()
    console.log('📥 eBay Publish Response:', publishData)

    if (!publishResponse.ok) {
      throw new Error(`eBay Publish Error: ${publishData.errors?.[0]?.message || 'Unknown error'}`)
    }

    const itemId = publishData.listingId
    console.log('✅ eBay listing created successfully:', itemId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        itemId: itemId,
        message: 'Item successfully listed on eBay',
        fees: publishData.fees || {}
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

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
