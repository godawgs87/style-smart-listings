
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Settings, Database } from 'lucide-react';
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
    console.log('Quick retry with ultra-minimal settings...');
    localStorage.removeItem('inventory_emergency_mode');
    toast({
      title: "Retrying...",
      description: "Loading with minimal data set."
    });
    onRetry();
  };

  const handleEmergencyMode = () => {
    console.log('Activating emergency mode with absolute minimal data...');
    toast({
      title: "Emergency mode activated",
      description: "Loading only 5 items with basic information."
    });
    
    // Set emergency mode flag
    localStorage.setItem('inventory_emergency_mode', 'true');
    onRetry();
  };

  const handleClearCache = () => {
    console.log('Clearing all cache and reloading...');
    // Clear all related localStorage
    localStorage.removeItem('inventory_emergency_mode');
    localStorage.clear();
    
    toast({
      title: "Cache cleared",
      description: "Attempting fresh load..."
    });
    
    // Force a fresh reload
    setTimeout(() => {
      window.location.reload();
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
            <h3 className="text-xl font-semibold mb-2 text-red-700">Persistent Database Timeout</h3>
            <p className="text-red-600 mb-6">
              The database is consistently timing out even with minimal data requests. This indicates a serious performance issue.
            </p>
            
            <div className="space-y-3">
              <Button onClick={handleQuickRetry} className="w-full" variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again (Minimal Data)
              </Button>
              
              <Button onClick={handleEmergencyMode} className="w-full" variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Emergency Mode (5 Items Only)
              </Button>
              
              <Button onClick={handleClearCache} className="w-full" variant="secondary">
                <Settings className="w-4 h-4 mr-2" />
                Clear Cache & Reload
              </Button>
              
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h4 className="font-medium text-red-800 mb-2">Critical Performance Issue Detected:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Database queries are timing out consistently</li>
                  <li>• This may indicate server overload or network issues</li>
                  <li>• Emergency mode will load only essential data</li>
                  <li>• Consider contacting support if this persists</li>
                </ul>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <h4 className="font-medium text-blue-800 mb-2">What Emergency Mode Does:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Loads only 5 most recent items</li>
                  <li>• Fetches only title, price, and status</li>
                  <li>• Removes all complex filters</li>
                  <li>• Uses shortest possible timeout</li>
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
