
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Settings, Database, WifiOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import { useToast } from '@/hooks/use-toast';
import { fallbackDataService } from '@/services/fallbackDataService';

interface InventoryTimeoutErrorProps {
  onBack: () => void;
  onRetry: () => void;
  onForceOffline?: () => void;
}

const InventoryTimeoutError = ({ onBack, onRetry, onForceOffline }: InventoryTimeoutErrorProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const hasFallbackData = fallbackDataService.hasFallbackData();

  const handleQuickRetry = () => {
    console.log('Quick retry with database...');
    toast({
      title: "Retrying...",
      description: "Attempting database connection..."
    });
    onRetry();
  };

  const handleOfflineMode = () => {
    console.log('Switching to offline mode...');
    toast({
      title: "Offline mode activated",
      description: hasFallbackData ? "Loading cached inventory data." : "No cached data available."
    });
    
    if (onForceOffline) {
      onForceOffline();
    }
  };

  const handleClearCache = () => {
    console.log('Clearing all cache and reloading...');
    fallbackDataService.clearFallbackData();
    localStorage.clear();
    
    toast({
      title: "Cache cleared",
      description: "Attempting fresh database connection..."
    });
    
    setTimeout(() => {
      onRetry();
    }, 1000);
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
            <h3 className="text-xl font-semibold mb-2 text-red-700">Database Connection Issues</h3>
            <p className="text-red-600 mb-6">
              The database is currently unavailable. You can try reconnecting or work with cached data offline.
            </p>
            
            <div className="space-y-3">
              <Button onClick={handleQuickRetry} className="w-full" variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Database Again
              </Button>
              
              {hasFallbackData && onForceOffline && (
                <Button onClick={handleOfflineMode} className="w-full" variant="outline">
                  <WifiOff className="w-4 h-4 mr-2" />
                  Work Offline (Cached Data)
                </Button>
              )}
              
              <Button onClick={handleClearCache} className="w-full" variant="secondary">
                <Settings className="w-4 h-4 mr-2" />
                Clear Cache & Retry
              </Button>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <h4 className="font-medium text-blue-800 mb-2">Available Options:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Try Database Again:</strong> Attempt to reconnect to the database</li>
                  {hasFallbackData && (
                    <li>• <strong>Work Offline:</strong> Use previously cached inventory data</li>
                  )}
                  <li>• <strong>Clear Cache:</strong> Reset all cached data and try fresh connection</li>
                </ul>
              </div>
              
              {!hasFallbackData && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                  <h4 className="font-medium text-yellow-800 mb-2">No Cached Data Available</h4>
                  <p className="text-sm text-yellow-700">
                    You'll need a successful database connection to view your inventory. Once connected, data will be cached for offline use.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTimeoutError;
