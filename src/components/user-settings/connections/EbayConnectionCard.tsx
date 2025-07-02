import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EbayConnectionCardProps {
  connected: boolean;
  connecting: boolean;
  refreshing: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
  onImportTrainingData: () => void;
  importing: boolean;
}

export const EbayConnectionCard: React.FC<EbayConnectionCardProps> = ({
  connected,
  connecting,
  refreshing,
  onConnect,
  onDisconnect,
  onRefresh,
  onImportTrainingData,
  importing
}) => {
  const { toast } = useToast();

  const handleSettings = () => {
    toast({
      title: "eBay Settings",
      description: "eBay integration settings will be available soon"
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">🛒</span>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">eBay</span>
            <Badge variant={connected ? "default" : "secondary"}>
              {connected ? 'Connected' : 'Not Connected'}
            </Badge>
          </div>
          {connected && (
            <p className="text-sm text-gray-600">Last sync: 2 hours ago</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {connected ? (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSettings}
            >
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button 
            size="sm" 
            onClick={onConnect}
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect'}
          </Button>
        )}
      </div>
    </div>
  );
};