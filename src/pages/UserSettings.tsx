
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
import { User, Bell, Palette, Settings as SettingsIcon } from 'lucide-react';

const UserSettings = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [defaultView, setDefaultView] = useState('grid');

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Account Settings"
        showBack
        onBack={handleBack}
      />
      
      <div className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user?.email}</h2>
                  <p className="text-gray-600">Your account information</p>
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
                    className="mt-1 bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">Contact support to change your email</p>
                </div>

                <div>
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    placeholder="Enter your display name"
                    className="mt-1"
                  />
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Profile Changes
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

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="listing-notifications">Listing Updates</Label>
                    <p className="text-sm text-gray-600">Get notified when your listings are viewed or sold</p>
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
                    <p className="text-sm text-gray-600">Get notified about market price changes for your items</p>
                  </div>
                  <Switch id="price-alerts" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="inventory-reminders">Inventory Reminders</Label>
                    <p className="text-sm text-gray-600">Weekly reminders to update stale listings</p>
                  </div>
                  <Switch id="inventory-reminders" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-digest">Weekly Email Digest</Label>
                    <p className="text-sm text-gray-600">Summary of your selling activity and performance</p>
                  </div>
                  <Switch id="email-digest" defaultChecked />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Palette className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Display Preferences</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-gray-600">Use dark theme throughout the app</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>

                <Separator />

                <div>
                  <Label>Default Inventory View</Label>
                  <p className="text-sm text-gray-600 mb-3">Choose how you want to see your listings by default</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant={defaultView === 'grid' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setDefaultView('grid')}
                    >
                      Grid View
                    </Button>
                    <Button 
                      variant={defaultView === 'table' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setDefaultView('table')}
                    >
                      Table View
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Items Per Page</Label>
                  <p className="text-sm text-gray-600 mb-3">How many listings to show at once</p>
                  <select className="w-full p-2 border rounded-md">
                    <option value="12">12 items</option>
                    <option value="24">24 items</option>
                    <option value="48">48 items</option>
                  </select>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <SettingsIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Advanced Settings</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <Label>Data Management</Label>
                  <p className="text-sm text-gray-600 mb-3">Manage your account data and privacy</p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Export My Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Download Listings Report
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Admin Access</Label>
                  <p className="text-sm text-gray-600 mb-3">Access advanced admin features</p>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/admin'}
                    className="w-full justify-start"
                  >
                    Open Admin Dashboard
                  </Button>
                </div>

                <Separator />

                <div>
                  <Label className="text-red-600">Danger Zone</Label>
                  <p className="text-sm text-gray-600 mb-3">Permanent actions that cannot be undone</p>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
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
