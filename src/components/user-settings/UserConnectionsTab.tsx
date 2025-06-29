
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Link, Settings } from 'lucide-react';

const UserConnectionsTab = () => {
  const [platforms, setPlatforms] = useState([
    { name: 'eBay', connected: true, autoList: true, icon: '🛒' },
    { name: 'Mercari', connected: true, autoList: false, icon: '📦' },
    { name: 'Poshmark', connected: false, autoList: false, icon: '👗' },
    { name: 'Whatnot', connected: false, autoList: false, icon: '📱' },
    { name: 'Depop', connected: false, autoList: false, icon: '🎨' }
  ]);

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Link className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Platform Connections</h3>
      </div>

      <div className="space-y-6">
        {platforms.map((platform, index) => (
          <div key={platform.name}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{platform.icon}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <Label className="font-medium">{platform.name}</Label>
                    <Badge variant={platform.connected ? "default" : "secondary"}>
                      {platform.connected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>
                  {platform.connected && (
                    <p className="text-sm text-gray-600">Last sync: 2 hours ago</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {platform.connected ? (
                  <>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      Settings
                    </Button>
                    <Button variant="outline" size="sm">
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button size="sm">Connect</Button>
                )}
              </div>
            </div>

            {platform.connected && (
              <div className="mt-4 pl-11 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${platform.name}-api`}>API Key</Label>
                    <Input
                      id={`${platform.name}-api`}
                      type="password"
                      placeholder="••••••••••••••••"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${platform.name}-store`}>Store ID</Label>
                    <Input
                      id={`${platform.name}-store`}
                      placeholder="Your store identifier"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-listing</Label>
                      <p className="text-sm text-gray-600">Automatically list new items</p>
                    </div>
                    <Switch
                      checked={platform.autoList}
                      onCheckedChange={(checked) => {
                        const newPlatforms = [...platforms];
                        newPlatforms[index].autoList = checked;
                        setPlatforms(newPlatforms);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Price sync</Label>
                      <p className="text-sm text-gray-600">Sync pricing changes across platforms</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Inventory sync</Label>
                      <p className="text-sm text-gray-600">Auto-update inventory levels</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {index < platforms.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default UserConnectionsTab;
