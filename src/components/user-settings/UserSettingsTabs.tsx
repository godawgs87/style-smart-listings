
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserProfileTab from './UserProfileTab';
import UserNotificationsTab from './UserNotificationsTab';
import UserAppearanceTab from './UserAppearanceTab';
import UserAdvancedTab from './UserAdvancedTab';

interface UserSettingsTabsProps {
  user: any;
}

const UserSettingsTabs = ({ user }: UserSettingsTabsProps) => {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <UserProfileTab user={user} />
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <UserNotificationsTab />
      </TabsContent>

      <TabsContent value="appearance" className="space-y-6">
        <UserAppearanceTab />
      </TabsContent>

      <TabsContent value="advanced" className="space-y-6">
        <UserAdvancedTab />
      </TabsContent>
    </Tabs>
  );
};

export default UserSettingsTabs;
