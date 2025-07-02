import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useEbaySyncOperation } from '@/hooks/useEbaySyncOperation';
import type { Listing } from '@/types/Listing';

interface EbaySyncButtonProps {
  listing: Listing;
  onSyncComplete?: () => void;
}

const EbaySyncButton = ({ listing, onSyncComplete }: EbaySyncButtonProps) => {
  const { syncToEbay, syncing } = useEbaySyncOperation();

  const handleSync = async () => {
    const result = await syncToEbay(listing);
    if (result.success && onSyncComplete) {
      onSyncComplete();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={syncing}
      className="flex items-center gap-2"
    >
      {syncing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ExternalLink className="w-4 h-4" />
      )}
      {syncing ? 'Syncing...' : 'Sync to eBay'}
    </Button>
  );
};

export default EbaySyncButton;