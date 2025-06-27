
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Shield, Palette, Database } from 'lucide-react';

const UserSettings = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Settings"
        showBack
        onBack={handleBack}
      />
      
      <div className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user?.email}</h2>
                  <p className="text-gray-600">Account created</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    placeholder="Your display name"
                    className="mt-1"
                  />
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  Update Profile
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="listing-notifications">Listing Updates</Label>
                    <p className="text-sm text-gray-600">Get notified when listings are viewed or sold</p>
                  </div>
                  <Switch
                    id="listing-notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="price-alerts">Price Alerts</Label>
                    <p className="text-sm text-gray-600">Get notified about market price changes</p>
                  </div>
                  <Switch id="price-alerts" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="inventory-reminders">Inventory Reminders</Label>
                    <p className="text-sm text-gray-600">Reminders to update stale listings</p>
                  </div>
                  <Switch id="inventory-reminders" />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Palette className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Appearance Settings</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-gray-600">Use dark theme for the interface</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>

                <Separator />

                <div>
                  <Label>Default View</Label>
                  <p className="text-sm text-gray-600 mb-2">Choose your preferred inventory view</p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Grid</Button>
                    <Button variant="outline" size="sm">Table</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Admin Dashboard</h3>
              </div>

              <div className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/admin'}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Open Admin Dashboard
                </Button>

                <p className="text-sm text-gray-600">
                  Access advanced system settings, user management, and database administration tools.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {isMobile && (
        <MobileNavigation
          currentView="settings"
          onNavigate={() => {}}
          showBack
          onBack={handleBack}
          title="Settings"
        />
      )}
    </div>
  );
};

export default UserSettings;
