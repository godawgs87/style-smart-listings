import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InventorySyncManagerProps {
  selectedItems: string[];
  onSyncComplete: () => void;
}

const InventorySyncManager = ({ selectedItems, onSyncComplete }: InventorySyncManagerProps) => {
  const [ebayAccount, setEbayAccount] = useState<any>(null);
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncResults, setSyncResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkEbayConnection();
  }, []);

  const checkEbayConnection = async () => {
    const { data } = await supabase
      .from('marketplace_accounts')
      .select('*')
      .eq('platform', 'ebay')
      .eq('is_active', true)
      .maybeSingle();

    setEbayAccount(data);
  };

  const handleBulkSync = async () => {
    if (!ebayAccount) {
      toast({
        title: "eBay Account Required",
        description: "Please connect your eBay account first",
        variant: "destructive"
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items to sync to eBay",
        variant: "destructive"
      });
      return;
    }

    setBulkSyncing(true);
    setSyncProgress(0);
    setSyncResults([]);

    const results = [];

    try {
      for (let i = 0; i < selectedItems.length; i++) {
        const listingId = selectedItems[i];
        
        try {
          // Get listing details
          const { data: listing } = await supabase
            .from('listings')
            .select('*')
            .eq('id', listingId)
            .single();

          if (!listing) {
            throw new Error('Listing not found');
          }

          // Sync to eBay
          const { data, error } = await supabase.functions.invoke('ebay-integration', {
            body: {
              action: 'publish_listing',
              listingId: listingId
            }
          });

          if (error || data?.status !== 'success') {
            throw new Error(data?.error || error?.message || 'Sync failed');
          }

          results.push({
            listingId,
            title: listing.title,
            success: true,
            ebayUrl: data.platform_url,
            ebayItemId: data.platform_listing_id
          });

        } catch (error: any) {
          results.push({
            listingId,
            title: 'Unknown',
            success: false,
            error: error.message
          });
        }

        // Update progress
        setSyncProgress(((i + 1) / selectedItems.length) * 100);
        setSyncResults([...results]);
      }

      // Show results
      setShowResults(true);
      
      const successCount = results.filter(r => r.success).length;
      toast({
        title: "Bulk Sync Complete",
        description: `${successCount}/${selectedItems.length} items synced successfully`
      });

      if (onSyncComplete) {
        onSyncComplete();
      }

    } catch (error: any) {
      toast({
        title: "Bulk Sync Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setBulkSyncing(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Bulk Sync Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedItems.length === 0 || !ebayAccount}
          >
            <span className="mr-2">↗</span>
            Sync to eBay ({selectedItems.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sync to eBay</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!ebayAccount ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-orange-600">!</span>
                </div>
                <div>
                  <h3 className="font-medium">eBay Account Required</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Connect your eBay account to sync listings
                  </p>
                </div>
                <Button onClick={() => window.location.href = '/settings'}>
                  Connect eBay Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">eBay Account Connected</p>
                    <p className="text-sm text-gray-600">{ebayAccount.account_username}</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📋 Ready to sync {selectedItems.length} listing{selectedItems.length !== 1 ? 's' : ''} to eBay
                  </p>
                </div>

                {bulkSyncing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Syncing...</span>
                      <span>{Math.round(syncProgress)}%</span>
                    </div>
                    <Progress value={syncProgress} className="w-full" />
                  </div>
                )}

                {syncResults.length > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {syncResults.map((result, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {result.success ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                        <span className="truncate">{result.title}</span>
                        {result.success && result.ebayUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => window.open(result.ebayUrl, '_blank')}
                          >
                            →
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  onClick={handleBulkSync}
                  disabled={bulkSyncing}
                  className="w-full"
                >
                  {bulkSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Start Bulk Sync'
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Button */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => window.location.href = '/settings'}
      >
        ⚙
      </Button>

      {/* Selection Info */}
      {selectedItems.length > 0 && (
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {selectedItems.length} selected
        </Badge>
      )}
    </div>
  );
};

export default InventorySyncManager;