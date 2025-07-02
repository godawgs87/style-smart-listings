import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Listing } from '@/types/Listing';

interface SyncResult {
  success: boolean;
  platformListingId?: string;
  platformUrl?: string;
  error?: string;
}

export const useEbaySyncOperation = () => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const syncToEbay = useCallback(async (listing: Listing): Promise<SyncResult> => {
    console.log('🚀 Starting eBay sync operation for listing:', listing.id);
    try {
      setSyncing(true);
      console.log('🔄 Starting eBay sync for listing:', listing.id);

      // First check if user has an eBay connection
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required');
      }

      console.log('👤 User authenticated, checking eBay account...');
      const { data: ebayAccount, error: accountError } = await supabase
        .from('marketplace_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'ebay')
        .eq('is_connected', true)
        .eq('is_active', true)
        .single();

      if (accountError || !ebayAccount) {
        console.error('❌ No eBay account found:', accountError);
        throw new Error('eBay account not connected. Please connect your eBay account first.');
      }

      console.log('✅ eBay account found:', ebayAccount.account_username);

      // Check token expiration
      if (ebayAccount.oauth_expires_at) {
        const expirationDate = new Date(ebayAccount.oauth_expires_at);
        const now = new Date();
        if (now >= expirationDate) {
          throw new Error('eBay token has expired. Please reconnect your eBay account.');
        }
      }

      // Use the list-to-ebay edge function with account info
      console.log('📡 Calling eBay integration function...');
      const { data, error } = await supabase.functions.invoke('list-to-ebay', {
        body: {
          listing: {
            id: listing.id,
            title: listing.title,
            description: listing.description || 'No description provided',
            price: listing.price,
            shippingCost: listing.shipping_cost || 9.95,
            photos: listing.photos || [],
            condition: listing.condition || 'Used',
            category: listing.category || 'Other',
            brand: (listing as any).brand,
            weight_oz: (listing as any).weight_oz
          },
          accountInfo: {
            oauth_token: ebayAccount.oauth_token,
            account_id: ebayAccount.account_id,
            account_username: ebayAccount.account_username
          }
        }
      });

      if (error) {
        console.error('❌ eBay sync failed with error:', error);
        throw new Error(`eBay sync failed: ${error.message}`);
      }

      if (!data?.success) {
        console.error('❌ eBay sync returned failure:', data);
        throw new Error(data?.error || 'eBay listing failed');
      }

      // Create platform_listing record
      const { error: insertError } = await supabase
        .from('platform_listings')
        .insert({
          user_id: user.id,
          listing_id: listing.id,
          marketplace_account_id: ebayAccount.id,
          platform: 'ebay',
          platform_listing_id: data.itemId,
          platform_url: `https://www.ebay.com/itm/${data.itemId}`,
          status: 'active',
          sync_status: 'success',
          platform_data: {
            itemId: data.itemId,
            listingUrl: `https://www.ebay.com/itm/${data.itemId}`,
            fees: data.fees || {},
            listingDate: new Date().toISOString()
          },
          last_synced_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Failed to save platform listing:', insertError);
        // Don't throw here as the eBay listing succeeded
      }

      toast({
        title: "eBay Sync Successful",
        description: `Item "${listing.title}" has been listed on eBay`
      });

      return {
        success: true,
        platformListingId: data.itemId,
        platformUrl: `https://www.ebay.com/itm/${data.itemId}`
      };

    } catch (error: any) {
      console.error('❌ eBay sync operation failed:', error);
      
      toast({
        title: "eBay Sync Failed",
        description: error.message || 'Failed to sync listing to eBay',
        variant: "destructive"
      });

      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    } finally {
      setSyncing(false);
    }
  }, [toast]);

  return {
    syncToEbay,
    syncing
  };
};