import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types/Listing';

interface EbaySyncButtonProps {
  listing: Listing;
  onSyncComplete?: () => void;
}

const EbaySyncButton = ({ listing, onSyncComplete }: EbaySyncButtonProps) => {
  const [syncing, setSyncing] = useState(false);
  const [ebayListing, setEbayListing] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkEbayStatus();
  }, [listing.id]);

  const checkEbayStatus = async () => {
    try {
      // Check if this listing is already synced to eBay
      const { data } = await supabase
        .from('platform_listings')
        .select(`*, marketplace_accounts!inner(platform)`)
        .eq('listing_id', listing.id)
        .eq('marketplace_accounts.platform', 'ebay')
        .maybeSingle();

      setEbayListing(data);
    } catch (error) {
      console.error('Error checking eBay status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);

    try {
      console.log('🔄 Starting eBay sync for listing:', listing.id);
      
      // First check if user has eBay account connected
      const { data: ebayAccount, error: accountError } = await supabase
        .from('marketplace_accounts')
        .select('*')
        .eq('platform', 'ebay')
        .eq('is_active', true)
        .maybeSingle();

      if (accountError) {
        console.error('❌ Error checking eBay account:', accountError);
        throw new Error('Failed to check eBay account connection');
      }

      if (!ebayAccount) {
        toast({
          title: "eBay Account Required",
          description: "Please connect your eBay account first in Settings → Connections",
          variant: "destructive",
          action: (
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/settings'}>
              Go to Settings
            </Button>
          )
        });
        return;
      }

      console.log('✅ Found eBay account:', ebayAccount.account_username);

      // Validate listing data
      if (!listing.title || !listing.price) {
        throw new Error('Listing must have a title and price to sync to eBay');
      }

      // Call the eBay integration edge function
      const { data, error } = await supabase.functions.invoke('ebay-integration', {
        body: {
          action: 'publish_listing',
          listingId: listing.id
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(`Sync failed: ${error.message}`);
      }

      console.log('📦 Edge function response:', data);

      if (data?.status !== 'success') {
        throw new Error(data?.error || 'eBay sync failed - no success response');
      }

      // Success! Update local state
      const newEbayListing = {
        id: Date.now().toString(), // Temporary ID
        platform_listing_id: data.platform_listing_id,
        platform_url: data.platform_url,
        status: 'active',
        listed_price: listing.price
      };
      
      setEbayListing(newEbayListing);

      toast({
        title: "eBay Sync Successful! 🎉",
        description: `"${listing.title}" is now live on eBay`,
        action: data.platform_url ? (
          <Button variant="outline" size="sm" onClick={() => window.open(data.platform_url, '_blank')}>
            View on eBay
          </Button>
        ) : undefined
      });

      if (onSyncComplete) {
        onSyncComplete();
      }

    } catch (error: any) {
      console.error('💥 eBay sync failed:', error);
      
      // Provide specific error guidance
      let errorMessage = error.message;
      let description = 'Please try again or contact support if the issue persists.';
      
      if (error.message.includes('token expired')) {
        description = 'Please reconnect your eBay account in Settings → Connections.';
      } else if (error.message.includes('category')) {
        description = 'eBay requires a valid category. Try updating your listing category.';
      } else if (error.message.includes('policy')) {
        description = 'eBay requires shipping and return policies to be set up in your eBay account.';
      }
      
      toast({
        title: "eBay Sync Failed",
        description: `${errorMessage} ${description}`,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (checkingStatus) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="w-3 h-3" />
      </Button>
    );
  }

  // Show synced state if already on eBay
  if (ebayListing && ebayListing.status === 'active') {
    return (
      <div className="flex items-center gap-1">
        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
          eBay
        </Badge>
        {ebayListing.platform_url && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(ebayListing.platform_url, '_blank')}
            className="h-6 w-6 p-0"
            title="View on eBay"
          >
            →
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={syncing}
      className="text-xs h-7"
    >
      {syncing ? (
        <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Syncing
        </>
      ) : (
        <>
          <span className="mr-1">↗</span>
          eBay
        </>
      )}
    </Button>
  );
};

export default EbaySyncButton;