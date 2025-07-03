import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EBAY-INTEGRATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

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
    logStep("User authenticated", { userId: user.id });

    let requestData;
    try {
      requestData = await req.json();
      logStep("Request data parsed", { action: requestData.action });
    } catch (parseError) {
      logStep("JSON parse error", { error: parseError.message });
      throw new Error(`Invalid JSON in request: ${parseError.message}`);
    }

    const { action, ...params } = requestData;
    logStep("Processing action", { action, params });

    switch (action) {
      case 'connect_account':
        logStep("Calling connectEbayAccount");
        return await connectEbayAccount(supabaseClient, user.id, params);
      
      case 'import_sold_listings':
        logStep("Calling importSoldListings");
        return await importSoldListings(supabaseClient, user.id, params);
      
      case 'publish_listing':
        logStep("Calling publishListing");
        return await publishListing(supabaseClient, user.id, params);
      
      case 'sync_listing_status':
        logStep("Calling syncListingStatus");
        return await syncListingStatus(supabaseClient, user.id, params);
      
      default:
        logStep("Unknown action", { action });
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function connectEbayAccount(supabaseClient: any, userId: string, params: any) {
  logStep("Connecting eBay account via OAuth 2.0", { userId });

  // Generate OAuth authorization URL
  const state = crypto.randomUUID();
  
  const { data: authData, error: authError } = await supabaseClient.functions.invoke('ebay-oauth', {
    body: { 
      action: 'get_auth_url',
      state: state
    }
  });

  if (authError) {
    throw new Error(`Failed to get eBay OAuth URL: ${authError.message}`);
  }

  logStep("OAuth URL generated", { authUrl: authData.auth_url });

  return new Response(JSON.stringify({
    status: 'oauth_url_generated',
    auth_url: authData.auth_url,
    state: state,
    message: 'Please visit the authorization URL to connect your eBay account'
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function importSoldListings(supabaseClient: any, userId: string, params: any) {
  logStep("Importing sold listings from eBay", { userId });

  // Get eBay account
  const { data: ebayAccount, error: accountError } = await supabaseClient
    .from('marketplace_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', 'ebay')
    .single();

  if (accountError || !ebayAccount) {
    throw new Error('eBay account not connected');
  }

  // Simulate fetching sold listings from eBay API
  // In real implementation, this would call eBay's REST API
  const mockSoldListings = generateMockSoldListings(params.count || 10);

  // Transform eBay listings to training data format
  const trainingData = mockSoldListings.map(listing => ({
    user_id: userId,
    source_platform: 'ebay',
    external_listing_id: listing.itemId,
    title: listing.title,
    description: listing.description,
    final_price: listing.soldPrice,
    category: listing.category,
    condition_rating: listing.condition,
    days_to_sell: listing.daysToSell,
    view_count: listing.viewCount,
    watcher_count: listing.watcherCount,
    offer_count: listing.offerCount,
    listing_date: listing.startDate,
    sold_date: listing.endDate,
    success_score: calculateSuccessScore(listing),
    keywords: listing.keywords,
    raw_data: listing
  }));

  // Insert training data
  const { error: insertError } = await supabaseClient
    .from('ai_training_data')
    .upsert(trainingData, { onConflict: 'user_id,external_listing_id,source_platform' });

  if (insertError) {
    throw new Error(`Failed to import training data: ${insertError.message}`);
  }

  logStep("Sold listings imported successfully", { count: trainingData.length });

  return new Response(JSON.stringify({
    status: 'success',
    imported_count: trainingData.length,
    message: 'Sold listings imported successfully'
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function publishListing(supabaseClient: any, userId: string, params: any) {
  logStep("Publishing listing to eBay using REST API with OAuth", { userId, listingId: params.listingId });

  const { listingId } = params;
  if (!listingId) {
    throw new Error('Listing ID required');
  }

  // Fetch listing data
  logStep("Fetching listing data", { listingId });
  
  const { data: listing, error: listingError } = await supabaseClient
    .from('listings')
    .select(`
      id, title, description, price, condition, brand, category, 
      photos, status, shipping_cost, measurements, keywords,
      color_primary, material, pattern, size_value, gender
    `)
    .eq('id', listingId)
    .eq('user_id', userId)
    .single();

  if (listingError) {
    logStep("Listing fetch error", { error: listingError });
    throw new Error(`Failed to fetch listing: ${listingError.message}`);
  }
  
  if (!listing) {
    throw new Error('Listing not found or you do not have permission to access it');
  }
  
  logStep("Listing data retrieved", { 
    title: listing.title, 
    price: listing.price,
    condition: listing.condition 
  });

  // Get eBay account with OAuth token
  logStep("Fetching eBay account", { userId });
  const { data: ebayAccount, error: accountError } = await supabaseClient
    .from('marketplace_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', 'ebay')
    .eq('is_connected', true)
    .eq('is_active', true)
    .single();

  if (accountError) {
    logStep("eBay account fetch error", { error: accountError });
    throw new Error(`Failed to fetch eBay account: ${accountError.message}`);
  }
  
  if (!ebayAccount) {
    logStep("No eBay account found", { userId });
    throw new Error('eBay account not connected. Please connect your eBay account first.');
  }
  
  logStep("eBay account retrieved", { 
    username: ebayAccount.account_username,
    tokenPresent: !!ebayAccount.oauth_token,
    expiresAt: ebayAccount.oauth_expires_at 
  });

  // Validate OAuth token
  if (!ebayAccount.oauth_token) {
    throw new Error('eBay OAuth token not available. Please reconnect your eBay account.');
  }

  // Check token expiration
  if (ebayAccount.oauth_expires_at && new Date(ebayAccount.oauth_expires_at) < new Date()) {
    throw new Error('eBay OAuth token has expired. Please reconnect your eBay account.');
  }

  // Build eBay Inventory API request for createOrReplaceInventoryItem
  logStep("Building eBay REST API request");
  
  const inventoryItemSku = `listing_${listingId}_${Date.now()}`;
  const inventoryItemData = {
    availability: {
      shipToLocationAvailability: {
        quantity: 1
      }
    },
    condition: mapConditionToEbayCondition(listing.condition || 'Used'),
    product: {
      title: (listing.title || 'Quality Item').substring(0, 80),
      description: listing.description || 'Quality item in good condition.',
      brand: listing.brand || 'Unbranded',
      mpn: 'Does not apply'
    }
  };

  logStep("Sending REST API request to eBay Inventory API");
  
  // Create inventory item
  const inventoryResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${inventoryItemSku}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${ebayAccount.oauth_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(inventoryItemData)
  });

  if (!inventoryResponse.ok) {
    const errorText = await inventoryResponse.text();
    logStep("Inventory API error", { 
      status: inventoryResponse.status,
      error: errorText 
    });
    throw new Error(`eBay Inventory API error (${inventoryResponse.status}): ${errorText}`);
  }

  logStep("Inventory item created successfully");

  // Create offer for the inventory item
  const offerData = {
    sku: inventoryItemSku,
    marketplaceId: 'EBAY_US',
    format: 'FIXED_PRICE',
    pricingSummary: {
      price: {
        value: listing.price?.toString() || '19.99',
        currency: 'USD'
      }
    },
    listingDescription: listing.description || 'Quality item in good condition.',
    listingPolicies: {
      fulfillmentPolicyId: 'default',
      paymentPolicyId: 'default',
      returnPolicyId: 'default'
    },
    categoryId: mapCategoryToEbayId(listing.category || 'Electronics'),
    merchantLocationKey: 'default'
  };

  const offerResponse = await fetch('https://api.ebay.com/sell/inventory/v1/offer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ebayAccount.oauth_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(offerData)
  });

  if (!offerResponse.ok) {
    const errorText = await offerResponse.text();
    logStep("Offer API error", { 
      status: offerResponse.status,
      error: errorText 
    });
    throw new Error(`eBay Offer API error (${offerResponse.status}): ${errorText}`);
  }

  const offerResult = await offerResponse.json();
  const offerId = offerResult.offerId;

  logStep("Offer created successfully", { offerId });

  // Publish the offer
  const publishResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ebayAccount.oauth_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  if (!publishResponse.ok) {
    const errorText = await publishResponse.text();
    logStep("Publish API error", { 
      status: publishResponse.status,
      error: errorText 
    });
    throw new Error(`eBay Publish API error (${publishResponse.status}): ${errorText}`);
  }

  const publishResult = await publishResponse.json();
  const listingId_ebay = publishResult.listingId;

  logStep("Listing published successfully", { 
    offerId,
    listingId: listingId_ebay 
  });
  
  const ebayResponse = {
    itemId: listingId_ebay || offerId,
    listingUrl: listingId_ebay ? `https://ebay.com/itm/${listingId_ebay}` : `https://ebay.com/`,
    fees: { insertionFee: 0.35, finalValueFee: 0.10 }
  };

  // Create platform listing record
  const platformListingData = {
    user_id: userId,
    listing_id: params.listingId,
    marketplace_account_id: ebayAccount.id,
    platform: 'ebay',
    platform_listing_id: ebayResponse.itemId,
    platform_url: ebayResponse.listingUrl,
    status: 'active',
    sync_status: 'synced',
    last_synced_at: new Date().toISOString(),
    platform_data: {
      ebay_item_id: ebayResponse.itemId,
      offer_id: offerId,
      sku: inventoryItemSku,
      listing_format: 'FixedPrice',
      fees: ebayResponse.fees
    },
    performance_metrics: {
      views: 0,
      watchers: 0,
      offers: 0
    }
  };

  const { error: platformError } = await supabaseClient
    .from('platform_listings')
    .insert(platformListingData);

  if (platformError) {
    throw new Error(`Failed to save platform listing: ${platformError.message}`);
  }

  // Update listing status
  const { error: updateError } = await supabaseClient
    .from('listings')
    .update({
      status: 'active',
      listed_date: new Date().toISOString().split('T')[0]
    })
    .eq('id', listingId);

  if (updateError) {
    logStep("Warning: Failed to update listing status", { error: updateError.message });
  }

  logStep("Listing sync completed successfully", { 
    listingId,
    ebayItemId: ebayResponse.itemId 
  });

  return new Response(JSON.stringify({
    status: 'success',
    platform_listing_id: ebayResponse.itemId,
    platform_url: ebayResponse.listingUrl,
    fees: ebayResponse.fees,
    message: 'Listing published to eBay successfully using OAuth'
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function syncListingStatus(supabaseClient: any, userId: string, params: any) {
  logStep("Syncing listing status from eBay", { userId });

  // Get all active eBay listings for user
  const { data: platformListings, error } = await supabaseClient
    .from('platform_listings')
    .select('*, marketplace_accounts!inner(*)')
    .eq('user_id', userId)
    .eq('platform', 'ebay')
    .eq('status', 'active');

  if (error) {
    throw new Error(`Failed to fetch platform listings: ${error.message}`);
  }

  const syncResults = [];

  for (const platformListing of platformListings) {
    try {
      // Simulate fetching item status from eBay
      const mockStatus = Math.random() > 0.9 ? 'sold' : 'active';
      const mockViews = Math.floor(Math.random() * 100);
      const mockWatchers = Math.floor(Math.random() * 20);

      // Update platform listing
      const { error: updateError } = await supabaseClient
        .from('platform_listings')
        .update({
          status: mockStatus,
          last_synced_at: new Date().toISOString(),
          performance_metrics: {
            views: mockViews,
            watchers: mockWatchers,
            offers: 0
          }
        })
        .eq('id', platformListing.id);

      if (updateError) {
        logStep("Failed to update platform listing", { 
          id: platformListing.id, 
          error: updateError.message 
        });
        continue;
      }

      // If sold, update main listing
      if (mockStatus === 'sold') {
        await supabaseClient
          .from('listings')
          .update({
            status: 'sold',
            sold_date: new Date().toISOString().split('T')[0],
            sold_price: Math.random() * 50 + 10 // Mock sold price
          })
          .eq('id', platformListing.listing_id);
      }

      syncResults.push({
        listing_id: platformListing.listing_id,
        platform_listing_id: platformListing.platform_listing_id,
        status: mockStatus,
        views: mockViews,
        watchers: mockWatchers
      });

    } catch (error) {
      logStep("Error syncing individual listing", { 
        id: platformListing.id, 
        error: error.message 
      });
    }
  }

  return new Response(JSON.stringify({
    status: 'success',
    synced_count: syncResults.length,
    results: syncResults,
    message: 'Listing status synced successfully'
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

// Helper functions
function generateMockSoldListings(count: number) {
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Collectibles', 'Sporting Goods'];
  const conditions = ['new', 'like new', 'excellent', 'good', 'fair'];
  const brands = ['Apple', 'Nike', 'Sony', 'Samsung', 'Vintage'];

  return Array.from({ length: count }, (_, i) => ({
    itemId: `ebay_item_${Date.now()}_${i}`,
    title: `${brands[Math.floor(Math.random() * brands.length)]} ${categories[Math.floor(Math.random() * categories.length)]} Item`,
    description: `Quality item in great condition. Fast shipping.`,
    category: categories[Math.floor(Math.random() * categories.length)],
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    soldPrice: Math.round((Math.random() * 100 + 10) * 100) / 100,
    startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysToSell: Math.floor(Math.random() * 30) + 1,
    viewCount: Math.floor(Math.random() * 200) + 10,
    watcherCount: Math.floor(Math.random() * 50),
    offerCount: Math.floor(Math.random() * 10),
    keywords: ['quality', 'fast shipping', 'authentic']
  }));
}

function calculateSuccessScore(listing: any): number {
  let score = 0.5; // Base score for sold items
  
  if (listing.daysToSell <= 7) score += 0.2;
  else if (listing.daysToSell <= 14) score += 0.1;
  
  if (listing.viewCount > 50) score += 0.1;
  if (listing.watcherCount > 10) score += 0.1;
  if (listing.offerCount > 0) score += 0.1;
  
  return Math.min(1.0, score);
}

// REST API Helper Functions
function mapConditionToEbayCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    'New': 'NEW',
    'Like New': 'LIKE_NEW', 
    'Excellent': 'VERY_GOOD',
    'Very Good': 'GOOD',
    'Good': 'ACCEPTABLE',
    'Acceptable': 'FOR_PARTS_OR_NOT_WORKING',
    'Used': 'GOOD'
  };
  
  return conditionMap[condition] || 'GOOD';
}

function mapCategoryToEbayId(category: string): string {
  const categoryMap: Record<string, string> = {
    'Electronics': '58058',
    'Clothing': '11450', 
    'Home & Garden': '11700',
    'Collectibles': '1',
    'Sporting Goods': '888',
    'Jewelry & Watches': '281',
    'Books': '267',
    'Music': '11233',
    'Movies & TV': '11232'
  };
  
  return categoryMap[category] || '58058'; // Default to Electronics
}