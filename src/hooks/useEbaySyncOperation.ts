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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔍 Auth check result:', { user: !!user, authError });
      if (!user) {
        console.error('❌ No authenticated user found');
        throw new Error('Please sign in to sync listings to eBay');
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

      // Use the ebay-integration edge function with retry logic
      console.log('📡 Calling eBay integration function...');
      console.log('📋 Function payload:', {
        action: 'publish_listing',
        listingId: listing.id
      });
      
      let retryCount = 0;
      const maxRetries = 2; // Allow 1 retry for 500 errors
      let lastError;
      let successData;
      
      while (retryCount <= maxRetries) {
        try {
          const { data, error } = await supabase.functions.invoke('ebay-integration', {
            body: {
              action: 'publish_listing',
              listingId: listing.id
            }
          });

          console.log('📥 Function response:', { data, error, attempt: retryCount + 1 });

          if (error) {
            console.error('❌ eBay sync failed with error:', error);
            
            // Check if it's a temporary error that we should retry
            if (error.message.includes('FunctionsHttpError') && retryCount < maxRetries) {
              console.log(`🔄 Retrying eBay sync (attempt ${retryCount + 1}/${maxRetries + 1})...`);
              lastError = error;
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // 2s, 4s delay
              continue;
            }
            
            throw new Error(`eBay sync failed: ${error.message}`);
          }

          // Check for function execution errors (500 status, etc.)
          if (!data || data?.status !== 'success') {
            console.error('❌ eBay sync returned failure:', data);
            const errorMsg = data?.error || 'eBay listing failed - server returned an error';
            
            // Retry on server errors if we have retries left
            if (errorMsg.includes('timeout') && retryCount < maxRetries) {
              console.log(`🔄 Retrying due to timeout (attempt ${retryCount + 1}/${maxRetries + 1})...`);
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
              continue;
            }
            
            throw new Error(errorMsg);
          }
          
          // Success case - store data and break out of retry loop
          successData = data;
          break;
          
        } catch (err: any) {
          lastError = err;
          if (retryCount >= maxRetries) {
            throw err;
          }
          console.log(`🔄 Retrying after error (attempt ${retryCount + 1}/${maxRetries + 1}):`, err.message);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        }
      }

      // Platform listing record should already be created by ebay-integration function
      console.log('✅ eBay listing created successfully:', successData?.platform_listing_id);

      toast({
        title: "eBay Sync Successful",
        description: `Item "${listing.title}" has been listed on eBay`
      });

      return {
        success: true,
        platformListingId: successData?.platform_listing_id,
        platformUrl: successData?.platform_url
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