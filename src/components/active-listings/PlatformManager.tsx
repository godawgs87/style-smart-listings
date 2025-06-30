
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Plus, Zap, Eye, Heart, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Listing } from '@/types/Listing';

interface PlatformManagerProps {
  listings: Listing[];
  onUpdateListing: (id: string, updates: any) => Promise<boolean>;
}

const PlatformManager = ({
  listings,
  onUpdateListing
}: PlatformManagerProps) => {
  const isMobile = useIsMobile();

  // Mock platform data - in a real app this would come from props or context
  const mockPlatforms = [
    {
      id: 'ebay',
      name: 'eBay',
      icon: 'E',
      isActive: true,
      settings: {
        autoList: true,
        autoDelist: false,
        autoPrice: true,
        offerManagement: true
      }
    },
    {
      id: 'mercari',
      name: 'Mercari',
      icon: 'M',
      isActive: false,
      settings: {
        autoList: false,
        autoDelist: false,
        autoPrice: false,
        offerManagement: false
      }
    }
  ];

  const mockPlatformListings = listings.map(listing => ({
    id: listing.id,
    platform: 'ebay',
    status: 'active',
    views: Math.floor(Math.random() * 100),
    watchers: Math.floor(Math.random() * 20),
    offers: Math.floor(Math.random() * 5)
  }));

  const handlePlatformToggle = async (platformId: string, enabled: boolean) => {
    console.log('Toggle platform:', platformId, enabled);
    // In a real app, this would update platform settings
  };

  const handlePlatformSettings = (platformId: string) => {
    console.log('Open platform settings:', platformId);
  };

  const handleAddPlatform = () => {
    console.log('Add new platform');
  };

  const getPlatformStats = (platformId: string) => {
    const platformListings = mockPlatformListings.filter(pl => pl.platform === platformId);
    return {
      total: platformListings.length,
      active: platformListings.filter(pl => pl.status === 'active').length,
      totalViews: platformListings.reduce((sum, pl) => sum + pl.views, 0),
      totalWatchers: platformListings.reduce((sum, pl) => sum + pl.watchers, 0),
      totalOffers: platformListings.reduce((sum, pl) => sum + pl.offers, 0)
    };
  };

  return (
    <div className="space-y-6">
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row'} justify-between items-center`}>
        <h2 className="text-2xl font-bold">Platform Management</h2>
        <Button onClick={handleAddPlatform} className="flex items-center gap-2 w-full md:w-auto">
          <Plus className="w-4 h-4" />
          Add Platform
        </Button>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
        {mockPlatforms.map((platform) => {
          const stats = getPlatformStats(platform.id);
          return (
            <Card key={platform.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold">{platform.icon}</span>
                    </div>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                  </div>
                  <Switch
                    checked={platform.isActive}
                    onCheckedChange={(checked) => handlePlatformToggle(platform.id, checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mobile-optimized stats grid */}
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2'} gap-4 text-sm`}>
                  <div>
                    <div className="text-gray-500 text-xs">Active Listings</div>
                    <div className="font-semibold">{stats.active}/{stats.total}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 flex items-center gap-1 text-xs">
                      <Eye className="w-3 h-3" />
                      Views
                    </div>
                    <div className="font-semibold">{stats.totalViews}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 flex items-center gap-1 text-xs">
                      <Heart className="w-3 h-3" />
                      Watchers
                    </div>
                    <div className="font-semibold">{stats.totalWatchers}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 flex items-center gap-1 text-xs">
                      <TrendingUp className="w-3 h-3" />
                      Offers
                    </div>
                    <div className="font-semibold">{stats.totalOffers}</div>
                  </div>
                </div>

                {/* Mobile-optimized badges */}
                <div className="flex flex-wrap gap-1">
                  {platform.settings.autoList && (
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Auto-List
                    </Badge>
                  )}
                  {platform.settings.autoDelist && (
                    <Badge variant="secondary" className="text-xs">Auto-Delist</Badge>
                  )}
                  {platform.settings.autoPrice && (
                    <Badge variant="secondary" className="text-xs">Auto-Price</Badge>
                  )}
                  {platform.settings.offerManagement && (
                    <Badge variant="secondary" className="text-xs">Offers</Badge>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePlatformSettings(platform.id)}
                  className="w-full flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Platform Settings
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mobile-friendly empty state */}
      {mockPlatforms.length === 0 && (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Platforms Connected</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Connect your selling platforms to start cross-listing and managing your inventory.
          </p>
          <Button onClick={handleAddPlatform} className="w-full md:w-auto">
            Add Your First Platform
          </Button>
        </Card>
      )}
    </div>
  );
};

export default PlatformManager;
