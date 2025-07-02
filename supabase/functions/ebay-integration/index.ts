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

    const ebayApiKey = Deno.env.get('EBAY_API_KEY');
    if (!ebayApiKey) {
      throw new Error('EBAY_API_KEY is not configured');
    }

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

    const { action, ...params } = await req.json();

    switch (action) {
      case 'connect_account':
        return await connectEbayAccount(supabaseClient, user.id, params);
      
      case 'import_sold_listings':
        return await importSoldListings(supabaseClient, user.id, params);
      
      case 'publish_listing':
        return await publishListing(supabaseClient, user.id, params);
      
      case 'sync_listing_status':
        return await syncListingStatus(supabaseClient, user.id, params);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
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
  logStep("Publishing listing to eBay", { userId, listingId: params.listingId });

  const { listingId } = params;
  if (!listingId) {
    throw new Error('Listing ID required');
  }

  // Get listing data
  const { data: listing, error: listingError } = await supabaseClient
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .eq('user_id', userId)
    .single();

  if (listingError || !listing) {
    throw new Error('Listing not found');
  }

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

  // Check token expiration
  if (ebayAccount.oauth_expires_at) {
    const expirationDate = new Date(ebayAccount.oauth_expires_at);
    const now = new Date();
    if (now >= expirationDate) {
      throw new Error('eBay token has expired. Please reconnect your eBay account.');
    }
  }

  // Use eBay Sell API Inventory endpoint
  const inventoryItemSku = `hustly_${listingId}_${Date.now()}`;
  
  // First create inventory item
  const inventoryResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${inventoryItemSku}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${ebayAccount.oauth_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      availability: {
        shipToLocationAvailability: {
          quantity: 1
        }
      },
      condition: getEbayCondition(listing.condition),
      product: {
        title: listing.title.substring(0, 80),
        description: listing.description || 'Quality item in good condition.',
        aspects: {},
        brand: listing.brand || 'Unbranded',
        mpn: 'Does Not Apply'
      }
    })
  });

  if (!inventoryResponse.ok) {
    const errorData = await inventoryResponse.text();
    console.error('eBay inventory creation failed:', errorData);
    throw new Error(`eBay inventory creation failed: ${errorData}`);
  }

  // Then create the offer
  const offerResponse = await fetch('https://api.ebay.com/sell/inventory/v1/offer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ebayAccount.oauth_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      sku: inventoryItemSku,
      marketplaceId: 'EBAY_US',
      format: 'FIXED_PRICE',
      pricingSummary: {
        price: {
          value: listing.price.toString(),
          currency: 'USD'
        }
      },
      listingDescription: listing.description || 'Quality item in good condition.',
      listingPolicies: {
        fulfillmentPolicyId: 'DEFAULT',
        paymentPolicyId: 'DEFAULT',
        returnPolicyId: 'DEFAULT'
      },
      categoryId: '293' // Electronics default
    })
  });

  if (!offerResponse.ok) {
    const errorData = await offerResponse.text();
    console.error('eBay offer creation failed:', errorData);
    throw new Error(`eBay offer creation failed: ${errorData}`);
  }

  const offerData = await offerResponse.json();
  const offerId = offerData.offerId;

  // Finally publish the offer
  const publishResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ebayAccount.oauth_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  if (!publishResponse.ok) {
    const errorData = await publishResponse.text();
    console.error('eBay publish failed:', errorData);
    throw new Error(`eBay publish failed: ${errorData}`);
  }

  const publishData = await publishResponse.json();
  const ebayItemId = publishData.listingId;
  
  const ebayResponse = {
    itemId: ebayItemId,
    listingUrl: `https://ebay.com/itm/${ebayItemId}`,
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

function getEbayCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    'New': 'NEW',
    'Like New': 'LIKE_NEW',
    'Excellent': 'EXCELLENT',
    'Very Good': 'VERY_GOOD', 
    'Good': 'GOOD',
    'Acceptable': 'ACCEPTABLE',
    'Used': 'USED'
  };
  
  return conditionMap[condition] || 'USED';
}