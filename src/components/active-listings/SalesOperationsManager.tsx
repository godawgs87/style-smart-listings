
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  AlertCircle, 
  Package, 
  DollarSign,
  Clock,
  BarChart3
} from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';

interface SalesOperationsManagerProps {
  onNavigateToInventory: () => void;
}

const SalesOperationsManager = ({ onNavigateToInventory }: SalesOperationsManagerProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Use the new inventory hook with active status filter
  const { listings, loading, stats } = useInventoryData({
    statusFilter: 'active',
    limit: 10
  });

  // Calculate sales-focused metrics
  const salesMetrics = {
    activeListings: listings.length,
    totalValue: stats.totalValue,
    avgPrice: listings.length > 0 ? stats.totalValue / listings.length : 0,
    highValueItems: listings.filter(item => (item.price || 0) > 100).length,
    lowPriceItems: listings.filter(item => (item.price || 0) < 25).length,
    needingAttention: listings.filter(item => 
      !item.photos || 
      !item.description || 
      (item.price || 0) === 0
    ).length
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Active Listings</p>
              <p className="text-2xl font-bold text-blue-700">{salesMetrics.activeListings}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Value</p>
              <p className="text-2xl font-bold text-green-700">${salesMetrics.totalValue.toFixed(0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Avg Price</p>
              <p className="text-2xl font-bold text-purple-700">${salesMetrics.avgPrice.toFixed(0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Need Attention</p>
              <p className="text-2xl font-bold text-orange-700">{salesMetrics.needingAttention}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex-col"
            onClick={onNavigateToInventory}
          >
            <Package className="w-6 h-6 mb-2" />
            <span className="text-sm">Manage Inventory</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex-col">
            <Target className="w-6 h-6 mb-2" />
            <span className="text-sm">Price Research</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex-col">
            <Calendar className="w-6 h-6 mb-2" />
            <span className="text-sm">Schedule Posts</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex-col">
            <BarChart3 className="w-6 h-6 mb-2" />
            <span className="text-sm">View Analytics</span>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Listings</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500">Loading active listings...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.slice(0, 5).map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium truncate">{listing.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{listing.category || 'Uncategorized'}</Badge>
                    <Badge variant="outline">{listing.condition || 'Good'}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${(listing.price || 0).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            ))}
            {listings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No active listings found</p>
                <Button 
                  variant="link" 
                  onClick={onNavigateToInventory}
                  className="mt-2"
                >
                  Create your first listing
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );

  const renderPricingAnalysis = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Price Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{salesMetrics.lowPriceItems}</p>
            <p className="text-sm text-red-700">Under $25</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {listings.filter(item => (item.price || 0) >= 25 && (item.price || 0) <= 100).length}
            </p>
            <p className="text-sm text-yellow-700">$25 - $100</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{salesMetrics.highValueItems}</p>
            <p className="text-sm text-green-700">Over $100</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Pricing Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium">Research High-Value Items</p>
              <p className="text-sm text-gray-600">
                {salesMetrics.highValueItems} items over $100 could benefit from market research
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="font-medium">Bundle Low-Price Items</p>
              <p className="text-sm text-gray-600">
                Consider bundling {salesMetrics.lowPriceItems} items under $25 for better margins
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sales Operations Center</h1>
        <p className="text-gray-600">
          Monitor active listings, track performance, and optimize your reselling operations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Platforms
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="pricing">
          {renderPricingAnalysis()}
        </TabsContent>

        <TabsContent value="platforms">
          <Card className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Platform Management</h3>
            <p className="text-gray-600 mb-4">
              Connect and manage your selling platforms (eBay, Facebook Marketplace, etc.)
            </p>
            <Button>Connect Platform</Button>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card className="p-8 text-center">
            <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Automation Rules</h3>
            <p className="text-gray-600 mb-4">
              Set up automatic pricing adjustments, cross-posting, and promotion schedules
            </p>
            <Button>Create Rule</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesOperationsManager;
