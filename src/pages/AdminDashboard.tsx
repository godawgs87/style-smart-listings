
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Save,
  User,
  Bell
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
    defaultShippingCost: '9.95',
    autoCalculateShipping: true,
    enableEmailNotifications: true,
    enableDesktopNotifications: false,
    defaultCondition: 'Used',
    defaultCategory: 'Electronics',
  });

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    // TODO: Implement settings save
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
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
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 mr-2" />
            <h2 className="text-xl font-bold">Account Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <div>
              <Label>Account Type</Label>
              <p className="text-sm text-gray-600">Free Plan</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Package className="w-5 h-5 mr-2" />
            <h2 className="text-xl font-bold">Listing Defaults</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultCondition">Default Condition</Label>
              <Input
                type="text"
                id="defaultCondition"
                value={settings.defaultCondition}
                onChange={(e) => setSettings({ ...settings, defaultCondition: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="defaultCategory">Default Category</Label>
              <Input
                type="text"
                id="defaultCategory"
                value={settings.defaultCategory}
                onChange={(e) => setSettings({ ...settings, defaultCategory: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 mr-2" />
            <h2 className="text-xl font-bold">Shipping Settings</h2>
          </div>
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
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 mr-2" />
            <h2 className="text-xl font-bold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableEmailNotifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive updates about your listings via email</p>
              </div>
              <Switch
                id="enableEmailNotifications"
                checked={settings.enableEmailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, enableEmailNotifications: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableDesktopNotifications">Desktop Notifications</Label>
                <p className="text-sm text-gray-500">Get browser notifications for important updates</p>
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
