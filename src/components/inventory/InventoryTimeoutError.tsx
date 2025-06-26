
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import { useToast } from '@/hooks/use-toast';

interface InventoryTimeoutErrorProps {
  onBack: () => void;
  onRetry: () => void;
}

const InventoryTimeoutError = ({ onBack, onRetry }: InventoryTimeoutErrorProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleRetry = () => {
    console.log('Retrying with refresh...');
    toast({
      title: "Refreshing data...",
      description: "Loading your inventory with optimized settings."
    });
    onRetry();
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <RefreshCw className="w-12 h-12 mx-auto text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-orange-700">Database Timeout</h3>
            <p className="text-orange-600 mb-6">
              The database is taking too long to respond. This might be due to a large amount of data or server load.
            </p>
            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again with Smaller Dataset
              </Button>
              <p className="text-xs text-gray-500">
                We'll load fewer items at a time to prevent timeouts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTimeoutError;
