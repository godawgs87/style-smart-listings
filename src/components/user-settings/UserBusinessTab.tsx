import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Building, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const UserBusinessTab = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const [businessData, setBusinessData] = useState({
    // Address fields
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'US',
    // Existing fields
    preferred_shipping_service: 'usps_priority',
    timezone: 'America/New_York'
  });

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country, preferred_shipping_service, timezone')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading business data:', error);
        return;
      }

      if (data) {
        setBusinessData({
          shipping_address_line1: data.shipping_address_line1 || '',
          shipping_address_line2: data.shipping_address_line2 || '',
          shipping_city: data.shipping_city || '',
          shipping_state: data.shipping_state || '',
          shipping_postal_code: data.shipping_postal_code || '',
          shipping_country: data.shipping_country || 'US',
          preferred_shipping_service: data.preferred_shipping_service || 'usps_priority',
          timezone: data.timezone || 'America/New_York'
        });
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to save business settings",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          shipping_address_line1: businessData.shipping_address_line1,
          shipping_address_line2: businessData.shipping_address_line2,
          shipping_city: businessData.shipping_city,
          shipping_state: businessData.shipping_state,
          shipping_postal_code: businessData.shipping_postal_code,
          shipping_country: businessData.shipping_country,
          preferred_shipping_service: businessData.preferred_shipping_service,
          timezone: businessData.timezone
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Business settings saved successfully"
      });
    } catch (error: any) {
      console.error('Error saving business data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save business settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Building className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Business Settings</h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Shipping Address</Label>
          <p className="text-sm text-gray-600 mb-3">Your business address used for eBay and other platform listings</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address-line1">Address Line 1</Label>
              <Input
                id="address-line1"
                value={businessData.shipping_address_line1}
                onChange={(e) => handleInputChange('shipping_address_line1', e.target.value)}
                placeholder="123 Main Street"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address-line2">Address Line 2 (Optional)</Label>
              <Input
                id="address-line2"
                value={businessData.shipping_address_line2}
                onChange={(e) => handleInputChange('shipping_address_line2', e.target.value)}
                placeholder="Suite 100, Apt 2B, etc."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={businessData.shipping_city}
                  onChange={(e) => handleInputChange('shipping_city', e.target.value)}
                  placeholder="New York"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={businessData.shipping_state}
                  onChange={(e) => handleInputChange('shipping_state', e.target.value)}
                  placeholder="NY"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="postal-code">ZIP Code</Label>
                <Input
                  id="postal-code"
                  value={businessData.shipping_postal_code}
                  onChange={(e) => handleInputChange('shipping_postal_code', e.target.value)}
                  placeholder="10001"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-base font-medium">Shipping Preferences</Label>
          <p className="text-sm text-gray-600 mb-3">Default shipping service for cost calculations</p>
          <div>
            <Label htmlFor="shipping-service">Preferred Shipping Service</Label>
            <select
              id="shipping-service"
              className="w-full p-2 border border-gray-300 rounded-md mt-1"
              value={businessData.preferred_shipping_service}
              onChange={(e) => handleInputChange('preferred_shipping_service', e.target.value)}
            >
              <option value="usps_priority">USPS Priority Mail</option>
              <option value="usps_first_class">USPS First Class</option>
              <option value="ups_ground">UPS Ground</option>
              <option value="fedex_ground">FedEx Ground</option>
            </select>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-base font-medium">Time Zone</Label>
          <p className="text-sm text-gray-600 mb-3">Your local time zone for scheduling and analytics</p>
          <div>
            <Label htmlFor="timezone">Time Zone</Label>
            <select
              id="timezone"
              className="w-full p-2 border border-gray-300 rounded-md mt-1"
              value={businessData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              <option value="America/New_York">Eastern Time (EST)</option>
              <option value="America/Chicago">Central Time (CST)</option>
              <option value="America/Denver">Mountain Time (MST)</option>
              <option value="America/Los_Angeles">Pacific Time (PST)</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Business Settings'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserBusinessTab;
