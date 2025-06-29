
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserProfileTab from './UserProfileTab';
import UserAdvancedTab from './UserAdvancedTab';

interface UserSettingsTabsProps {
  user: any;
}

const UserSettingsTabs = ({ user }: UserSettingsTabsProps) => {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile" className="mt-6">
        <UserProfileTab user={user} />
      </TabsContent>
      
      <TabsContent value="advanced" className="mt-6">
        <UserAdvancedTab />
      </TabsContent>
    </Tabs>
  );
};

export default UserSettingsTabs;
