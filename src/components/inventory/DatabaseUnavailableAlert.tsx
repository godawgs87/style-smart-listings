
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff } from 'lucide-react';

interface DatabaseUnavailableAlertProps {
  onRetry: () => void;
  onForceOffline?: () => void;
}

const DatabaseUnavailableAlert = ({ onRetry, onForceOffline }: DatabaseUnavailableAlertProps) => {
  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex">
          <WifiOff className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
          <div>
            <h3 className="text-red-800 font-semibold">Database Unavailable</h3>
            <p className="text-red-700 text-sm mt-1">
              Switched to offline mode. Click 'Try Database Again' to reconnect.
            </p>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Button onClick={onRetry} size="sm" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Database Again
          </Button>
          {onForceOffline && (
            <Button onClick={onForceOffline} variant="outline" size="sm">
              Stay Offline
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseUnavailableAlert;
