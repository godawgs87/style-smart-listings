
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Settings, Database, WifiOff, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import { useToast } from '@/hooks/use-toast';
import { fallbackDataService } from '@/services/fallbackDataService';
import { useAuth } from '@/hooks/useAuth';

interface InventoryTimeoutErrorProps {
  onBack: () => void;
  onRetry: () => void;
  onForceOffline?: () => void;
  error?: string;
}

const InventoryTimeoutError = ({ onBack, onRetry, onForceOffline, error }: InventoryTimeoutErrorProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const hasFallbackData = fallbackDataService.hasFallbackData();

  const isAuthError = error?.includes('Access denied') || error?.includes('Authentication') || error?.includes('policy');
  const isTimeoutError = error?.includes('timeout') || error?.includes('unavailable');

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

  const handleSignOut = async () => {
    console.log('Signing out and clearing auth state...');
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "Please sign back in to access your listings"
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getErrorTitle = () => {
    if (isAuthError) return "Access Permission Error";
    if (isTimeoutError) return "Database Connection Issues";
    return "Database Error";
  };

  const getErrorDescription = () => {
    if (isAuthError) {
      return "Your authentication session may have expired or there's an issue with data access permissions.";
    }
    if (isTimeoutError) {
      return "The database is currently unavailable or taking too long to respond.";
    }
    return error || "An unexpected database error occurred.";
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
            <AlertTriangle className={`w-16 h-16 mx-auto mb-4 ${isAuthError ? 'text-orange-500' : 'text-red-500'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isAuthError ? 'text-orange-700' : 'text-red-700'}`}>
              {getErrorTitle()}
            </h3>
            <p className={`mb-6 ${isAuthError ? 'text-orange-600' : 'text-red-600'}`}>
              {getErrorDescription()}
            </p>
            
            <div className="space-y-3">
              {isAuthError ? (
                <>
                  <Button onClick={handleSignOut} className="w-full" variant="default">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out & Log Back In
                  </Button>
                  <Button onClick={handleQuickRetry} className="w-full" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
              
              <Button onClick={handleClearCache} className="w-full" variant="secondary">
                <Settings className="w-4 h-4 mr-2" />
                Clear Cache & Retry
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <h4 className="font-medium text-blue-800 mb-2">Available Options:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {isAuthError ? (
                  <>
                    <li>• <strong>Sign Out & Log Back In:</strong> Refresh your authentication session</li>
                    <li>• <strong>Try Again:</strong> Retry with current session</li>
                  </>
                ) : (
                  <>
                    <li>• <strong>Try Database Again:</strong> Attempt to reconnect to the database</li>
                    {hasFallbackData && (
                      <li>• <strong>Work Offline:</strong> Use previously cached inventory data</li>
                    )}
                  </>
                )}
                <li>• <strong>Clear Cache:</strong> Reset all cached data and try fresh connection</li>
              </ul>
            </div>
            
            {!hasFallbackData && !isAuthError && (
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
  );
};

export default InventoryTimeoutError;
