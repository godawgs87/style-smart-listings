
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Link, Settings } from 'lucide-react';
import { useEbayIntegration } from '@/hooks/useEbayIntegration';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const UserConnectionsTab = () => {
  const { connectEbayAccount, importSoldListings, connecting, importing } = useEbayIntegration();
  const { toast } = useToast();
  
  const [platforms, setPlatforms] = useState([
    { name: 'eBay', connected: false, autoList: true, icon: '🛒' },
    { name: 'Mercari', connected: false, autoList: false, icon: '📦' },
    { name: 'Poshmark', connected: false, autoList: false, icon: '👗' },
    { name: 'Whatnot', connected: false, autoList: false, icon: '📱' },
    { name: 'Depop', connected: false, autoList: false, icon: '🎨' }
  ]);

  // Check for pending eBay OAuth on component mount
  useEffect(() => {
    const handlePendingOAuth = async () => {
      const pendingOAuth = localStorage.getItem('ebay_oauth_pending');
      if (pendingOAuth) {
        try {
          const { code, state } = JSON.parse(pendingOAuth);
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // User is now authenticated, complete the OAuth flow
            const { data, error } = await supabase.functions.invoke('ebay-oauth', {
              headers: {
                Authorization: `Bearer ${session.access_token}`
              },
              body: { 
                action: 'exchange_code',
                code: code,
                state: state
              }
            });

            if (error) throw error;

            if (data.success) {
              localStorage.removeItem('ebay_oauth_pending');
              setPlatforms(prev => prev.map(p => 
                p.name === 'eBay' ? { ...p, connected: true } : p
              ));
              toast({
                title: "eBay Connected Successfully",
                description: `Your eBay account (${data.username}) is now connected and ready to use`
              });
            }
          }
        } catch (error: any) {
          console.error('Failed to complete pending eBay OAuth:', error);
          localStorage.removeItem('ebay_oauth_pending');
          toast({
            title: "Connection Failed",
            description: "Failed to complete eBay connection. Please try again.",
            variant: "destructive"
          });
        }
      }
    };

    handlePendingOAuth();
  }, [toast]);

  const handleConnectEbay = async () => {
    try {
      // Step 1: Get authorization URL from our edge function
      const { data, error } = await supabase.functions.invoke('ebay-oauth', {
        body: { 
          action: 'get_auth_url',
          state: crypto.randomUUID() // Generate random state for security
        }
      });

      if (error) throw error;

      // Step 2: Redirect to eBay OAuth page
      window.location.href = data.auth_url;
    } catch (error: any) {
      console.error('eBay OAuth initiation failed:', error);
      toast({
        title: "Connection Failed",
        description: error.message || 'Failed to initiate eBay connection',
        variant: "destructive"
      });
    }
  };

  const handleDisconnectEbay = () => {
    setPlatforms(prev => prev.map(p => 
      p.name === 'eBay' ? { ...p, connected: false } : p
    ));
    toast({
      title: "eBay Disconnected",
      description: "Your eBay account has been disconnected"
    });
  };

  const handleImportListings = async () => {
    const success = await importSoldListings(10);
    if (success) {
      toast({
        title: "Training Data Updated",
        description: "Your AI will now better match your selling style"
      });
    }
  };

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
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => {
                         if (platform.name === 'eBay') {
                           handleDisconnectEbay();
                         }
                       }}
                     >
                       Disconnect
                     </Button>
                  </>
                 ) : (
                   <Button 
                     size="sm" 
                     onClick={() => {
                       if (platform.name === 'eBay') {
                         handleConnectEbay();
                       } else {
                         toast({
                           title: "Coming Soon",
                           description: `${platform.name} integration will be available soon`
                         });
                       }
                     }}
                     disabled={platform.name === 'eBay' && connecting}
                   >
                     {platform.name === 'eBay' && connecting ? 'Connecting...' : 'Connect'}
                   </Button>
                 )}
              </div>
            </div>

            {/* eBay Connection Success */}
            {platform.name === 'eBay' && platform.connected && (
              <div className="mt-4 pl-11 space-y-4">
                <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium text-green-900">eBay Connected</p>
                      <p className="text-sm text-green-700">Ready to sync listings and import data</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleImportListings}
                    disabled={importing}
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    {importing ? 'Importing...' : 'Import Training Data'}
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">What happens next:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• AI will analyze your successful sales patterns</li>
                    <li>• Auto-generate listings that match your style</li>
                    <li>• Sync inventory and pricing across platforms</li>
                    <li>• Track performance and optimize listings</li>
                  </ul>
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

            {platform.connected && platform.name !== 'eBay' && (
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
