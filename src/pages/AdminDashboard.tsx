import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  Save,
  User,
  Bell,
  Link,
  CheckCircle,
  AlertCircle,
  Moon,
  Sun
} from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    defaultShippingCost: '9.95',
    autoCalculateShipping: true,
    enableEmailNotifications: true,
    enableDesktopNotifications: false,
  });

  const [ebayConnection, setEbayConnection] = useState({
    isConnected: false,
    devId: '',
    appId: '',
    certId: '',
    userToken: '',
  });

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    // TODO: Implement settings save
  };

  const handleConnectEbay = () => {
    console.log('Connecting to eBay with credentials:', {
      devId: ebayConnection.devId,
      appId: ebayConnection.appId,
      certId: ebayConnection.certId
    });
    // TODO: Implement eBay OAuth flow
    setEbayConnection({ ...ebayConnection, isConnected: true });
  };

  const handleDisconnectEbay = () => {
    setEbayConnection({
      isConnected: false,
      devId: '',
      appId: '',
      certId: '',
      userToken: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Welcome, {user?.email}</span>
            <Navigation />
          </div>
        </div>
      </div>

      <MobileHeader 
        title="Settings" 
        showBack 
        onBack={onBack}
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Account Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Email</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Account Type</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Free Plan</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
            )}
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Dark Mode</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Link className="w-5 h-5 mr-2" />
            <h2 className="text-xl font-bold">eBay Integration</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {ebayConnection.isConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                )}
                <div>
                  <p className="font-medium">
                    {ebayConnection.isConnected ? 'Connected to eBay' : 'Not Connected'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {ebayConnection.isConnected 
                      ? 'You can now list items directly to eBay' 
                      : 'Connect your eBay account to start listing items'
                    }
                  </p>
                </div>
              </div>
              
              {ebayConnection.isConnected ? (
                <Button variant="outline" onClick={handleDisconnectEbay}>
                  Disconnect
                </Button>
              ) : null}
            </div>

            {!ebayConnection.isConnected && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ebayDevId">Developer ID</Label>
                    <Input
                      type="text"
                      id="ebayDevId"
                      placeholder="Your eBay Developer ID"
                      value={ebayConnection.devId}
                      onChange={(e) => setEbayConnection({ ...ebayConnection, devId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ebayAppId">Application ID</Label>
                    <Input
                      type="text"
                      id="ebayAppId"
                      placeholder="Your eBay Application ID"
                      value={ebayConnection.appId}
                      onChange={(e) => setEbayConnection({ ...ebayConnection, appId: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="ebayCertId">Certificate ID</Label>
                  <Input
                    type="text"
                    id="ebayCertId"
                    placeholder="Your eBay Certificate ID"
                    value={ebayConnection.certId}
                    onChange={(e) => setEbayConnection({ ...ebayConnection, certId: e.target.value })}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Need eBay API credentials?</strong> Visit the eBay Developers Program to create your application and get your API keys.
                  </p>
                </div>

                <Button 
                  onClick={handleConnectEbay}
                  disabled={!ebayConnection.devId || !ebayConnection.appId || !ebayConnection.certId}
                  className="w-full"
                >
                  Connect to eBay
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shipping Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultShippingCost" className="text-gray-700 dark:text-gray-300">Default Shipping Cost</Label>
              <Input
                type="number"
                id="defaultShippingCost"
                placeholder="9.95"
                value={settings.defaultShippingCost}
                onChange={(e) => setSettings({ ...settings, defaultShippingCost: e.target.value })}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Label htmlFor="autoCalculateShipping" className="text-gray-700 dark:text-gray-300">Auto Calculate Shipping</Label>
              <Switch
                id="autoCalculateShipping"
                checked={settings.autoCalculateShipping}
                onCheckedChange={(checked) => setSettings({ ...settings, autoCalculateShipping: checked })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableEmailNotifications" className="text-gray-700 dark:text-gray-300">Email Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your listings via email</p>
              </div>
              <Switch
                id="enableEmailNotifications"
                checked={settings.enableEmailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, enableEmailNotifications: checked })}
              />
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-600" />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableDesktopNotifications" className="text-gray-700 dark:text-gray-300">Desktop Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get browser notifications for important updates</p>
              </div>
              <Switch
                id="enableDesktopNotifications"
                checked={settings.enableDesktopNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, enableDesktopNotifications: checked })}
              />
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
