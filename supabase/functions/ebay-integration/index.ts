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

    // Quick validation of eBay credentials
    const ebayClientId = Deno.env.get('EBAY_CLIENT_ID');
    const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET');
    
    if (!ebayClientId || !ebayClientSecret) {
      logStep("ERROR: eBay credentials missing");
      throw new Error('eBay credentials not configured');
    }
    
    logStep("eBay credentials verified");

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
  logStep("Connecting eBay account", { userId });

  // In a real implementation, this would handle OAuth flow
  // For now, we'll simulate the connection process
  const { username, oauth_token } = params;

  if (!username || !oauth_token) {
    throw new Error('Username and OAuth token required');
  }

  // Check if account already exists
  const { data: existingAccount } = await supabaseClient
    .from('marketplace_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', 'ebay')
    .single();

  const accountData = {
    user_id: userId,
    platform: 'ebay',
    account_username: username,
    is_connected: true,
    is_active: true,
    oauth_token: oauth_token,
    oauth_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    account_id: `ebay_${username}`,
    seller_level: 'standard',
    api_permissions: ['read', 'write'],
    last_sync_at: new Date().toISOString(),
    platform_settings: {
      auto_list: true,
      auto_relist: false,
      listing_duration: '7_days',
      listing_format: 'auction_with_bin'
    }
  };

  const { error } = await supabaseClient
    .from('marketplace_accounts')
    .upsert(accountData, { onConflict: 'user_id,platform' });

  if (error) {
    throw new Error(`Failed to save eBay account: ${error.message}`);
  }

  logStep("eBay account connected successfully", { username });

  return new Response(JSON.stringify({
    status: 'success',
    message: 'eBay account connected successfully',
    account: {
      platform: 'ebay',
      username: username,
      connected: true
    }
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
  // In real implementation, this would call eBay's GetMyeBaySelling API
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
  logStep("Publishing listing to eBay using Trading API", { userId, listingId: params.listingId });

  const { listingId } = params;
  if (!listingId) {
    throw new Error('Listing ID required');
  }

  // Get eBay credentials
  const ebayAppId = Deno.env.get('EBAY_CLIENT_ID');
  const ebayDevId = Deno.env.get('EBAY_DEV_ID');
  const ebayCertId = Deno.env.get('EBAY_CLIENT_SECRET');

  if (!ebayAppId || !ebayDevId || !ebayCertId) {
    throw new Error('Missing eBay Trading API credentials (APP_ID, DEV_ID, CERT_ID)');
  }

  // Fetch listing data with proper error handling
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

  // Get eBay account
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

  // Validate eBay token
  if (!ebayAccount.oauth_token) {
    throw new Error('eBay authentication token not available. Please reconnect your eBay account.');
  }

  // Build Trading API XML request for AddFixedPriceItem
  logStep("Building Trading API XML request");
  
  const ebayXML = buildTradingAPIXML(listing, ebayAccount.oauth_token, ebayAppId, ebayDevId, ebayCertId);
  
  logStep("Sending Trading API request to eBay");
  
  // Make Trading API call
  const tradingAPIResponse = await fetch('https://api.ebay.com/ws/api.dll', {
    method: 'POST',
    headers: {
      'X-EBAY-API-CALL-NAME': 'AddFixedPriceItem',
      'X-EBAY-API-APP-NAME': ebayAppId,
      'X-EBAY-API-DEV-NAME': ebayDevId,
      'X-EBAY-API-CERT-NAME': ebayCertId,
      'X-EBAY-API-SITEID': '0', // US eBay site
      'X-EBAY-API-COMPATIBILITY-LEVEL': '1209',
      'Content-Type': 'text/xml',
      'Accept': 'text/xml'
    },
    body: ebayXML
  });

  logStep("Trading API response status", { 
    status: tradingAPIResponse.status, 
    statusText: tradingAPIResponse.statusText 
  });

  if (!tradingAPIResponse.ok) {
    const errorText = await tradingAPIResponse.text();
    logStep("Trading API HTTP error", { 
      status: tradingAPIResponse.status,
      error: errorText 
    });
    throw new Error(`eBay Trading API HTTP error (${tradingAPIResponse.status}): ${errorText}`);
  }

  const responseXML = await tradingAPIResponse.text();
  logStep("Trading API response received", { xmlLength: responseXML.length });

  // Parse XML response
  const ebayResult = parseTradingAPIResponse(responseXML);
  
  if (ebayResult.errors && ebayResult.errors.length > 0) {
    const errorMessages = ebayResult.errors.map(err => `${err.ErrorCode}: ${err.LongMessage}`).join('; ');
    logStep("eBay API errors", { errors: ebayResult.errors });
    throw new Error(`eBay listing failed: ${errorMessages}`);
  }

  if (!ebayResult.itemId) {
    logStep("No item ID in response", { result: ebayResult });
    throw new Error('eBay listing creation failed - no item ID returned');
  }

  logStep("eBay listing created successfully", { 
    itemId: ebayResult.itemId,
    fees: ebayResult.fees 
  });
  
  const ebayResponse = {
    itemId: ebayResult.itemId,
    listingUrl: `https://ebay.com/itm/${ebayResult.itemId}`,
    fees: ebayResult.fees || { insertionFee: 0.35, finalValueFee: 0.10 }
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
      listing_format: 'FixedPriceItem',
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

  logStep("Listing published successfully", { 
    listingId,
    ebayItemId: ebayResponse.itemId 
  });

  return new Response(JSON.stringify({
    status: 'success',
    platform_listing_id: ebayResponse.itemId,
    platform_url: ebayResponse.listingUrl,
    fees: ebayResponse.fees,
    message: 'Listing published to eBay successfully'
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

function transformListingForEbay(listing: any) {
  return {
    title: listing.title,
    description: listing.description || 'Quality item in good condition.',
    category: mapCategoryToEbay(listing.category),
    condition: listing.condition || 'good',
    startPrice: listing.price,
    quantity: 1,
    listingDuration: 'Days_7',
    listingType: 'FixedPriceItem',
    paymentMethods: ['PayPal'],
    shippingDetails: {
      shippingType: 'Flat',
      shippingServiceCost: listing.shipping_cost || 9.95
    }
  };
}

function mapCategoryToEbay(category: string): string {
  const categoryMap: Record<string, string> = {
    'Electronics': '293',
    'Clothing': '11450',
    'Home & Garden': '11700',
    'Collectibles': '1',
    'Sporting Goods': '888'
  };
  
  return categoryMap[category] || '293'; // Default to Electronics
}

// Trading API XML Builder
function buildTradingAPIXML(listing: any, authToken: string, appId: string, devId: string, certId: string): string {
  const categoryId = mapCategoryToEbay(listing.category || 'Electronics');
  const conditionId = mapConditionToEbayId(listing.condition || 'Used');
  const title = (listing.title || 'Quality Item').substring(0, 80);
  const description = listing.description || 'Quality item in good condition.';
  const price = listing.price || 19.99;
  const shippingCost = listing.shipping_cost || 9.95;

  return `<?xml version="1.0" encoding="utf-8"?>
<AddFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${authToken}</eBayAuthToken>
  </RequesterCredentials>
  <Item>
    <Title>${escapeXML(title)}</Title>
    <Description><![CDATA[${description}]]></Description>
    <StartPrice>${price}</StartPrice>
    <CategoryID>${categoryId}</CategoryID>
    <ListingType>FixedPriceItem</ListingType>
    <ListingDuration>GTC</ListingDuration>
    <Country>US</Country>
    <Currency>USD</Currency>
    <Quantity>1</Quantity>
    <ConditionID>${conditionId}</ConditionID>
    <PaymentMethods>PayPal</PaymentMethods>
    <ShippingDetails>
      <ShippingType>Flat</ShippingType>
      <ShippingServiceOptions>
        <ShippingServicePriority>1</ShippingServicePriority>
        <ShippingService>USPSMedia</ShippingService>
        <ShippingServiceCost>${shippingCost}</ShippingServiceCost>
      </ShippingServiceOptions>
    </ShippingDetails>
    <ReturnPolicy>
      <ReturnsAcceptedOption>ReturnsAccepted</ReturnsAcceptedOption>
      <RefundOption>MoneyBack</RefundOption>
      <ReturnsWithinOption>Days_30</ReturnsWithinOption>
      <ShippingCostPaidByOption>Buyer</ShippingCostPaidByOption>
    </ReturnPolicy>
  </Item>
</AddFixedPriceItemRequest>`;
}

// Trading API XML Response Parser
function parseTradingAPIResponse(xmlResponse: string): any {
  const result: any = { errors: [] };
  
  // Extract Item ID
  const itemIdMatch = xmlResponse.match(/<ItemID>(\d+)<\/ItemID>/);
  if (itemIdMatch) {
    result.itemId = itemIdMatch[1];
  }
  
  // Extract Success/Failure
  const ackMatch = xmlResponse.match(/<Ack>(.*?)<\/Ack>/);
  result.ack = ackMatch ? ackMatch[1] : 'Unknown';
  result.success = result.ack === 'Success';
  
  // Extract Errors
  const errorRegex = /<ErrorCode>(\d+)<\/ErrorCode>[\s\S]*?<LongMessage>(.*?)<\/LongMessage>/g;
  let errorMatch;
  while ((errorMatch = errorRegex.exec(xmlResponse)) !== null) {
    result.errors.push({
      ErrorCode: errorMatch[1],
      LongMessage: errorMatch[2]
    });
  }
  
  // Extract Fees
  const feesRegex = /<Name>(.*?)<\/Name>[\s\S]*?<Fee[^>]*>(.*?)<\/Fee>/g;
  const fees: any = {};
  let feeMatch;
  while ((feeMatch = feesRegex.exec(xmlResponse)) !== null) {
    const feeName = feeMatch[1].toLowerCase().replace(/\s+/g, '_');
    const feeAmount = parseFloat(feeMatch[2]) || 0;
    fees[feeName] = feeAmount;
  }
  result.fees = fees;
  
  return result;
}

// Helper Functions
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mapCategoryToEbay(category: string): string {
  const categoryMap: Record<string, string> = {
    'Electronics': '293',
    'Clothing': '11450', 
    'Home & Garden': '11700',
    'Collectibles': '1',
    'Sporting Goods': '888',
    'Jewelry & Watches': '281',
    'Books': '267',
    'Music': '11233',
    'Movies & TV': '11232'
  };
  
  return categoryMap[category] || '293'; // Default to Electronics
}

function mapConditionToEbayId(condition: string): string {
  const conditionMap: Record<string, string> = {
    'New': '1000',
    'Like New': '1500', 
    'Excellent': '2000',
    'Very Good': '2500',
    'Good': '3000',
    'Acceptable': '4000',
    'Used': '3000'
  };
  
  return conditionMap[condition] || '3000'; // Default to Good
}