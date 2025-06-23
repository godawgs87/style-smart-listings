
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Link as LinkIcon,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    ebayApiKey: '',
    ebayConnected: false,
    mercariApiKey: '',
    mercariConnected: false,
    postmarkApiKey: '',
    postmarkConnected: false,
    defaultShippingCost: '9.95',
    autoCalculateShipping: true,
    enableEmailNotifications: true,
  });

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    // TODO: Implement settings save
  };

  const connectPlatform = (platform: string) => {
    console.log(`Connecting to ${platform}`);
    // TODO: Implement platform connection
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
            <Navigation />
          </div>
        </div>
      </div>

      <MobileHeader 
        title="Admin Dashboard" 
        showBack 
        onBack={onBack}
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Platform Connections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="ebayApiKey">eBay API Key</Label>
                <Badge variant={settings.ebayConnected ? 'default' : 'destructive'} className={settings.ebayConnected ? 'bg-green-500' : ''}>
                  {settings.ebayConnected ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                  {settings.ebayConnected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  id="ebayApiKey"
                  placeholder="eBay API Key"
                  value={settings.ebayApiKey}
                  onChange={(e) => setSettings({ ...settings, ebayApiKey: e.target.value })}
                  disabled={settings.ebayConnected}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => connectPlatform('eBay')}
                  disabled={settings.ebayConnected}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  {settings.ebayConnected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="mercariApiKey">Mercari API Key</Label>
                <Badge variant={settings.mercariConnected ? 'default' : 'destructive'} className={settings.mercariConnected ? 'bg-green-500' : ''}>
                  {settings.mercariConnected ?  <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                  {settings.mercariConnected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  id="mercariApiKey"
                  placeholder="Mercari API Key"
                  value={settings.mercariApiKey}
                  onChange={(e) => setSettings({ ...settings, mercariApiKey: e.target.value })}
                  disabled={settings.mercariConnected}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => connectPlatform('Mercari')}
                  disabled={settings.mercariConnected}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  {settings.mercariConnected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Shipping Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultShippingCost">Default Shipping Cost</Label>
              <Input
                type="number"
                id="defaultShippingCost"
                placeholder="9.95"
                value={settings.defaultShippingCost}
                onChange={(e) => setSettings({ ...settings, defaultShippingCost: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-4">
              <Label htmlFor="autoCalculateShipping">Auto Calculate Shipping</Label>
              <Switch
                id="autoCalculateShipping"
                checked={settings.autoCalculateShipping}
                onCheckedChange={(checked) => setSettings({ ...settings, autoCalculateShipping: checked })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Email Notifications</h2>
          <div className="flex items-center space-x-4">
            <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
            <Switch
              id="enableEmailNotifications"
              checked={settings.enableEmailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, enableEmailNotifications: checked })}
            />
          </div>
          <Separator className="my-4" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="postmarkApiKey">Postmark API Key</Label>
              <Badge variant={settings.postmarkConnected ? 'default' : 'destructive'} className={settings.postmarkConnected ? 'bg-green-500' : ''}>
                {settings.postmarkConnected ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                {settings.postmarkConnected ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                id="postmarkApiKey"
                placeholder="Postmark API Key"
                value={settings.postmarkApiKey}
                onChange={(e) => setSettings({ ...settings, postmarkApiKey: e.target.value })}
                disabled={settings.postmarkConnected}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => connectPlatform('Postmark')}
                disabled={settings.postmarkConnected}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                {settings.postmarkConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </div>
        </Card>

        <Button onClick={handleSaveSettings} className="w-full gradient-bg text-white">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
