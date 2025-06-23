
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Plus, ArrowUp, List } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';

interface DashboardProps {
  onCreateListing: () => void;
  onViewListings: () => void;
}

const Dashboard = ({ onCreateListing, onViewListings }: DashboardProps) => {
  const recentListings = [
    { id: 1, title: "Vintage Nike Air Max 90", price: 85, status: "Active" },
    { id: 2, title: "Levi's 501 Jeans Size 32", price: 45, status: "Sold" },
    { id: 3, title: "North Face Jacket Large", price: 65, status: "Active" }
  ];

  const stats = {
    totalListings: 127,
    activeSales: 45,
    monthlyRevenue: 2340,
    avgListingTime: "2.3 min"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Smart Listing Generator" />
      
      {/* Hero Section */}
      <div className="gradient-bg text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
        <p className="text-blue-100 mb-6">Ready to create your next listing?</p>
        
        <div className="space-y-3">
          <Button
            onClick={onCreateListing}
            className="w-full bg-white text-blue-600 hover:bg-gray-100 py-3 text-lg font-medium"
          >
            <Camera className="w-5 h-5 mr-2" />
            Create New Listing
          </Button>
          
          <Button
            onClick={onViewListings}
            className="w-full bg-white/10 text-white border border-white/30 hover:bg-white hover:text-blue-600 py-3 text-lg font-medium transition-colors"
          >
            <List className="w-5 h-5 mr-2" />
            Manage Listings
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 -mt-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 card-hover">
            <div className="text-2xl font-bold text-gray-900">{stats.totalListings}</div>
            <div className="text-sm text-gray-500">Total Listings</div>
          </Card>
          <Card className="p-4 card-hover">
            <div className="text-2xl font-bold text-green-600">{stats.activeSales}</div>
            <div className="text-sm text-gray-500">Active Sales</div>
          </Card>
          <Card className="p-4 card-hover">
            <div className="text-2xl font-bold text-purple-600">${stats.monthlyRevenue}</div>
            <div className="text-sm text-gray-500">This Month</div>
          </Card>
          <Card className="p-4 card-hover">
            <div className="text-2xl font-bold text-blue-600">{stats.avgListingTime}</div>
            <div className="text-sm text-gray-500">Avg. Time</div>
          </Card>
        </div>

        {/* Recent Listings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Listings</h2>
          
          {recentListings.map((listing) => (
            <Card key={listing.id} className="p-4 card-hover">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">{listing.title}</h3>
                  <p className="text-sm text-gray-500">${listing.price}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    listing.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {listing.status}
                  </span>
                  <ArrowUp className="w-4 h-4 text-gray-400 rotate-45" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
