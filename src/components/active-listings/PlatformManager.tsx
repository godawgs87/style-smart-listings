
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Plus, Zap, Eye, Heart, TrendingUp } from 'lucide-react';
import type { Platform, PlatformListing } from '@/types/Platform';

interface PlatformManagerProps {
  platforms: Platform[];
  platformListings: PlatformListing[];
  onPlatformToggle: (platformId: string, enabled: boolean) => void;
  onPlatformSettings: (platformId: string) => void;
  onAddPlatform: () => void;
}

const PlatformManager = ({
  platforms,
  platformListings,
  onPlatformToggle,
  onPlatformSettings,
  onAddPlatform
}: PlatformManagerProps) => {
  const getPlatformStats = (platformId: string) => {
    const listings = platformListings.filter(pl => pl.platform === platformId);
    return {
      total: listings.length,
      active: listings.filter(pl => pl.status === 'active').length,
      totalViews: listings.reduce((sum, pl) => sum + pl.views, 0),
      totalWatchers: listings.reduce((sum, pl) => sum + pl.watchers, 0),
      totalOffers: listings.reduce((sum, pl) => sum + pl.offers, 0)
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Platform Management</h2>
        <Button onClick={onAddPlatform} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Platform
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => {
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
                    onCheckedChange={(checked) => onPlatformToggle(platform.id, checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Active Listings</div>
                    <div className="font-semibold">{stats.active}/{stats.total}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Views
                    </div>
                    <div className="font-semibold">{stats.totalViews}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      Watchers
                    </div>
                    <div className="font-semibold">{stats.totalWatchers}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Offers
                    </div>
                    <div className="font-semibold">{stats.totalOffers}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
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
                  onClick={() => onPlatformSettings(platform.id)}
                  className="w-full flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformManager;
