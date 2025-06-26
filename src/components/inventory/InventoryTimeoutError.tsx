
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Settings } from 'lucide-react';
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

  const handleQuickRetry = () => {
    console.log('Quick retry with current settings...');
    toast({
      title: "Retrying...",
      description: "Loading inventory with current filters."
    });
    onRetry();
  };

  const handleOptimizedRetry = () => {
    console.log('Optimized retry with reduced data...');
    toast({
      title: "Loading optimized view...",
      description: "Using reduced dataset for faster loading."
    });
    
    // Clear any existing filters and use minimal data
    localStorage.setItem('inventory_emergency_mode', 'true');
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
            <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-red-700">Database Connection Timeout</h3>
            <p className="text-red-600 mb-6">
              The database query is taking too long to complete. This usually happens when there's a large amount of data or slow server response.
            </p>
            
            <div className="space-y-4">
              <Button onClick={handleQuickRetry} className="w-full" variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Quick Retry
              </Button>
              
              <Button onClick={handleOptimizedRetry} className="w-full" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Load Minimal Data
              </Button>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting Tips:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Try using filters to reduce the amount of data</li>
                  <li>• Check your internet connection stability</li>
                  <li>• Consider using the search function to find specific items</li>
                  <li>• The database may be under heavy load - try again in a few minutes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTimeoutError;
