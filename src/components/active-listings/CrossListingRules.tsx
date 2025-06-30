
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Zap, Target, DollarSign } from 'lucide-react';
import type { Listing } from '@/types/Listing';

interface CrossListingRulesProps {
  listings: Listing[];
  onUpdateListing: (id: string, updates: any) => Promise<boolean>;
}

const CrossListingRules = ({
  listings,
  onUpdateListing
}: CrossListingRulesProps) => {
  // Mock rules data - in a real app this would come from props or context
  const mockRules = [
    {
      id: '1',
      name: 'Designer Items Auto-List',
      platforms: ['eBay', 'Mercari', 'Poshmark'],
      conditions: {
        category: ['Clothing', 'Accessories'],
        priceRange: { min: 50, max: 500 }
      },
      settings: {
        autoList: true,
        priceMultiplier: 1.2
      }
    },
    {
      id: '2',
      name: 'Electronics Quick List',
      platforms: ['eBay', 'Facebook'],
      conditions: {
        category: ['Electronics'],
        priceRange: { min: 100, max: 1000 }
      },
      settings: {
        autoList: false,
        priceMultiplier: 1.1
      }
    }
  ];

  const handleCreateRule = () => {
    console.log('Create new cross-listing rule');
  };

  const handleEditRule = (ruleId: string) => {
    console.log('Edit rule:', ruleId);
  };

  const handleDeleteRule = (ruleId: string) => {
    console.log('Delete rule:', ruleId);
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    console.log('Toggle rule:', ruleId, enabled);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cross-Listing Rules</h2>
        <Button onClick={handleCreateRule} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Rule
        </Button>
      </div>

      {mockRules.length === 0 ? (
        <Card className="p-8 text-center">
          <Zap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Automation Rules</h3>
          <p className="text-gray-600 mb-4">
            Create rules to automatically list items across multiple platforms based on your criteria.
          </p>
          <Button onClick={handleCreateRule}>Create Your First Rule</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockRules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{rule.name}</CardTitle>
                  <Switch
                    checked={rule.settings.autoList}
                    onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {rule.platforms.map((platform) => (
                    <Badge key={platform} variant="secondary" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2 text-sm">
                  {rule.conditions.category && (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span>Categories: {rule.conditions.category.join(', ')}</span>
                    </div>
                  )}
                  {rule.conditions.priceRange && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>
                        Price: ${rule.conditions.priceRange.min} - ${rule.conditions.priceRange.max}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-600">
                    Price Multiplier: {rule.settings.priceMultiplier}x
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRule(rule.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CrossListingRules;
