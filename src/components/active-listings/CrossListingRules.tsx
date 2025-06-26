
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Zap } from 'lucide-react';
import type { CrossListingRule } from '@/types/Platform';

interface CrossListingRulesProps {
  rules: CrossListingRule[];
  onCreateRule: () => void;
  onEditRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string, enabled: boolean) => void;
}

const CrossListingRules = ({
  rules,
  onCreateRule,
  onEditRule,
  onDeleteRule,
  onToggleRule
}: CrossListingRulesProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cross-Listing Rules</h2>
        <Button onClick={onCreateRule} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Rule
        </Button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{rule.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.settings.autoList}
                    onCheckedChange={(checked) => onToggleRule(rule.id, checked)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditRule(rule.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteRule(rule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Platforms ({rule.platforms.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {rule.platforms.map((platform) => (
                    <Badge key={platform} variant="outline">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Conditions</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Categories: </span>
                    <span>{rule.conditions.category?.join(', ') || 'All'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price Range: </span>
                    <span>
                      {rule.conditions.priceRange 
                        ? `$${rule.conditions.priceRange.min} - $${rule.conditions.priceRange.max}`
                        : 'All'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Condition: </span>
                    <span>{rule.conditions.condition?.join(', ') || 'All'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price Multiplier: </span>
                    <span>{rule.settings.priceMultiplier}x</span>
                  </div>
                </div>
              </div>

              {rule.settings.autoList && (
                <Badge className="bg-green-100 text-green-800">
                  <Zap className="w-3 h-3 mr-1" />
                  Auto-Listing Enabled
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}

        {rules.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">No cross-listing rules configured</p>
              <Button onClick={onCreateRule} variant="outline">
                Create Your First Rule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CrossListingRules;
