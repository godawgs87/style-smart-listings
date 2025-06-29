
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Building } from 'lucide-react';

const UserBusinessTab = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Building className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Business Settings</h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Business Profile</Label>
          <p className="text-sm text-gray-600 mb-3">Your business information and branding</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business-name">Business Name</Label>
              <Input id="business-name" placeholder="Your business name" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="business-phone">Phone Number</Label>
              <Input id="business-phone" placeholder="(555) 123-4567" className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="business-address">Business Address</Label>
              <Textarea 
                id="business-address" 
                placeholder="Full business address"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-base font-medium">Default Shipping Settings</Label>
          <p className="text-sm text-gray-600 mb-3">Set default shipping options for new listings</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default-shipping-cost">Default Shipping Cost</Label>
              <Input id="default-shipping-cost" placeholder="9.95" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="handling-time">Handling Time (days)</Label>
              <select className="w-full p-2 border rounded-md mt-1">
                <option value="1">1 business day</option>
                <option value="2">2 business days</option>
                <option value="3">3 business days</option>
                <option value="5">5 business days</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="shipping-policy">Shipping Policy</Label>
              <Textarea 
                id="shipping-policy" 
                placeholder="Your shipping policy and terms"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-base font-medium">Return Policy</Label>
          <p className="text-sm text-gray-600 mb-3">Default return policy for your listings</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="return-period">Return Period</Label>
              <select className="w-full p-2 border rounded-md mt-1">
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="no-returns">No returns accepted</option>
              </select>
            </div>
            <div>
              <Label htmlFor="return-policy-text">Return Policy Text</Label>
              <Textarea 
                id="return-policy-text" 
                placeholder="Detailed return policy and conditions"
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-base font-medium">Business Hours</Label>
          <p className="text-sm text-gray-600 mb-3">Set your business hours for customer support</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="open-time">Opening Time</Label>
              <Input type="time" id="open-time" defaultValue="09:00" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="close-time">Closing Time</Label>
              <Input type="time" id="close-time" defaultValue="17:00" className="mt-1" />
            </div>
          </div>
          <div className="mt-3">
            <Label htmlFor="timezone">Timezone</Label>
            <select className="w-full p-2 border rounded-md mt-1">
              <option value="EST">Eastern Time (EST)</option>
              <option value="CST">Central Time (CST)</option>
              <option value="MST">Mountain Time (MST)</option>
              <option value="PST">Pacific Time (PST)</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Save Business Settings
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserBusinessTab;
