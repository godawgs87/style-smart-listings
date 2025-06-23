
import React, { useState } from 'react';
import MobileHeader from '@/components/MobileHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Package, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  Truck,
  Mail,
  ExternalLink,
  Check,
  X
} from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const { toast } = useToast();
  const [ebayApiKey, setEbayApiKey] = useState('');
  const [mercariEnabled, setMercariEnabled] = useState(false);
  const [postmarkApiKey, setPostmarkApiKey] = useState('');
  const [shippingProvider, setShippingProvider] = useState('');

  const platformIntegrations = [
    {
      name: 'eBay',
      status: 'connected',
      description: 'Automatically list items to eBay marketplace',
      icon: ShoppingCart,
      color: 'bg-yellow-500'
    },
    {
      name: 'Mercari',
      status: 'disconnected',
      description: 'Cross-list items to Mercari platform',
      icon: Package,
      color: 'bg-red-500'
    },
    {
      name: 'Postmark',
      status: 'disconnected',
      description: 'Email notifications and shipping updates',
      icon: Mail,
      color: 'bg-blue-500'
    }
  ];

  const revenueStats = [
    { label: 'Total Revenue', value: '$2,450.00', change: '+12.5%', color: 'text-green-600' },
    { label: 'Active Listings', value: '24', change: '+3', color: 'text-blue-600' },
    { label: 'Sold Items', value: '18', change: '+5', color: 'text-purple-600' },
    { label: 'Avg. Sale Price', value: '$136.11', change: '+8.2%', color: 'text-orange-600' }
  ];

  const handleSaveIntegration = (platform: string) => {
    toast({
      title: "Integration Saved",
      description: `${platform} integration has been updated successfully.`
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title="Admin Dashboard" 
        showBack 
        onBack={onBack}
      />

      <div className="p-4">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {revenueStats.map((stat, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <span className={`text-sm font-medium ${stat.color}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <Package className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm">Bulk Export</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <Truck className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm">Print Labels</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <DollarSign className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm">Revenue Report</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <Settings className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm">Bulk Edit</div>
                  </div>
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-6">
            <div className="space-y-4">
              {platformIntegrations.map((platform, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                        <platform.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{platform.name}</h4>
                        <p className="text-sm text-gray-600">{platform.description}</p>
                      </div>
                    </div>
                    <Badge variant={platform.status === 'connected' ? 'default' : 'secondary'}>
                      {platform.status === 'connected' ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          Disconnected
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  {platform.name === 'eBay' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="ebay-api-key">API Key</Label>
                        <Input
                          id="ebay-api-key"
                          type="password"
                          value={ebayApiKey}
                          onChange={(e) => setEbayApiKey(e.target.value)}
                          placeholder="Enter your eBay API key"
                        />
                      </div>
                      <Button onClick={() => handleSaveIntegration('eBay')} size="sm">
                        Update Integration
                      </Button>
                    </div>
                  )}

                  {platform.name === 'Mercari' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enable Mercari Integration</span>
                      <Switch
                        checked={mercariEnabled}
                        onCheckedChange={setMercariEnabled}
                      />
                    </div>
                  )}

                  {platform.name === 'Postmark' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="postmark-api-key">Server Token</Label>
                        <Input
                          id="postmark-api-key"
                          type="password"
                          value={postmarkApiKey}
                          onChange={(e) => setPostmarkApiKey(e.target.value)}
                          placeholder="Enter your Postmark server token"
                        />
                      </div>
                      <Button onClick={() => handleSaveIntegration('Postmark')} size="sm">
                        Update Integration
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Providers
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shipping-provider">Default Shipping Provider</Label>
                  <Input
                    id="shipping-provider"
                    value={shippingProvider}
                    onChange={(e) => setShippingProvider(e.target.value)}
                    placeholder="USPS, UPS, FedEx"
                  />
                </div>
                <Button onClick={() => handleSaveIntegration('Shipping')}>
                  Save Shipping Settings
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Label Printing</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Print Pending Labels (3)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Batch Print All Labels
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">General Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-list to eBay</Label>
                    <p className="text-sm text-gray-600">Automatically list new items to eBay</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive email updates for sales</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics Tracking</Label>
                    <p className="text-sm text-gray-600">Track listing performance metrics</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
