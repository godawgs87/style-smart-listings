import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from 'lucide-react';
import { useEbayIntegration } from '@/hooks/useEbayIntegration';
import { EbayConnectionCard } from './connections/EbayConnectionCard';
import { EbaySuccessSection } from './connections/EbaySuccessSection';
import { GenericPlatformCard } from './connections/GenericPlatformCard';
import { PlatformSettingsSection } from './connections/PlatformSettingsSection';
import { useEbayConnection } from './connections/useEbayConnection';

interface Platform {
  name: string;
  connected: boolean;
  autoList: boolean;
  icon: string;
}

const UserConnectionsTab = () => {
  const { importSoldListings, connecting, importing } = useEbayIntegration();
  const {
    checkEbayConnection,
    handlePendingOAuth,
    connectEbay,
    disconnectEbay,
    refreshConnectionStatus,
    refreshing
  } = useEbayConnection();
  
  const [platforms, setPlatforms] = useState<Platform[]>([
    { name: 'eBay', connected: false, autoList: true, icon: '🛒' },
    { name: 'Mercari', connected: false, autoList: false, icon: '📦' },
    { name: 'Poshmark', connected: false, autoList: false, icon: '👗' },
    { name: 'Whatnot', connected: false, autoList: false, icon: '📱' },
    { name: 'Depop', connected: false, autoList: false, icon: '🎨' }
  ]);

  // Check for pending eBay OAuth on component mount
  useEffect(() => {
    const initializeConnections = async () => {
      // Handle pending OAuth first
      const pendingCompleted = await handlePendingOAuth();
      
      // Check current connection status
      const isConnected = await checkEbayConnection();
      
      setPlatforms(prev => prev.map(p => 
        p.name === 'eBay' ? { ...p, connected: pendingCompleted || isConnected } : p
      ));
    };

    initializeConnections();
  }, []);

  const handleEbayConnect = async () => {
    await connectEbay();
  };

  const handleEbayDisconnect = async () => {
    const success = await disconnectEbay();
    if (success) {
      setPlatforms(prev => prev.map(p => 
        p.name === 'eBay' ? { ...p, connected: false } : p
      ));
    }
  };

  const handleEbayRefresh = async () => {
    const isConnected = await refreshConnectionStatus();
    setPlatforms(prev => prev.map(p => 
      p.name === 'eBay' ? { ...p, connected: isConnected } : p
    ));
  };

  const handleImportListings = async () => {
    await importSoldListings(10);
  };

  const handleGenericDisconnect = (platformName: string) => {
    setPlatforms(prev => prev.map(p => 
      p.name === platformName ? { ...p, connected: false } : p
    ));
  };

  const ebayPlatform = platforms.find(p => p.name === 'eBay')!;
  const otherPlatforms = platforms.filter(p => p.name !== 'eBay');

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Link className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Platform Connections</h3>
      </div>

      <div className="space-y-6">
        {/* eBay Section */}
        <div>
          <EbayConnectionCard
            connected={ebayPlatform.connected}
            connecting={connecting}
            refreshing={refreshing}
            onConnect={handleEbayConnect}
            onDisconnect={handleEbayDisconnect}
            onRefresh={handleEbayRefresh}
            onImportTrainingData={handleImportListings}
            importing={importing}
          />

          {ebayPlatform.connected && (
            <EbaySuccessSection
              onImportTrainingData={handleImportListings}
              importing={importing}
            />
          )}

          {ebayPlatform.connected && (
            <PlatformSettingsSection
              platform={ebayPlatform}
              index={0}
              platforms={platforms}
              setPlatforms={setPlatforms}
            />
          )}

          <Separator className="mt-6" />
        </div>

        {/* Other Platforms */}
        {otherPlatforms.map((platform, index) => (
          <div key={platform.name}>
            <GenericPlatformCard
              platform={platform}
              onConnect={() => {}}
              onDisconnect={() => handleGenericDisconnect(platform.name)}
            />

            {platform.connected && (
              <PlatformSettingsSection
                platform={platform}
                index={index + 1}
                platforms={platforms}
                setPlatforms={setPlatforms}
              />
            )}

            {index < otherPlatforms.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default UserConnectionsTab;
