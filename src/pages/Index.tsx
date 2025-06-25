import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, List, Package } from "lucide-react";
import CreateListing from "./CreateListing";
import ListingsManager from "./ListingsManager";
import InventoryManager from "./InventoryManager";
import AuthForm from "@/components/AuthForm";
import StreamlinedHeader from "@/components/StreamlinedHeader";
import MobileNavigation from "@/components/MobileNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'listings' | 'inventory'>('dashboard');
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <AuthForm onAuthSuccess={() => setCurrentView('dashboard')} />
      </div>
    );
  }

  if (currentView === 'create') {
    return (
      <CreateListing 
        onBack={() => setCurrentView('dashboard')}
        onViewListings={() => setCurrentView('listings')}
      />
    );
  }

  if (currentView === 'listings') {
    return <ListingsManager onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'inventory') {
    return (
      <InventoryManager 
        onBack={() => setCurrentView('dashboard')} 
        onCreateListing={() => setCurrentView('create')} 
      />
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Hustly"
        userEmail={user.email}
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your Reseller Business Hub
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage inventory, create listings, track profits, and grow your reselling business.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => setCurrentView('create')}>
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Create Listing</h3>
              <p className="text-gray-600 mb-4">
                Upload photos and create professional listings with AI assistance.
              </p>
              <Button className="w-full">Start Creating</Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setCurrentView('inventory')}>
            <div className="text-center">
              <Package className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Inventory Manager</h3>
              <p className="text-gray-600 mb-4">
                Track purchases, calculate profits, and manage your reseller inventory.
              </p>
              <Button variant="outline" className="w-full">Manage Inventory</Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setCurrentView('listings')}>
            <div className="text-center">
              <List className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Active Listings</h3>
              <p className="text-gray-600 mb-4">
                View and manage your active listings across platforms.
              </p>
              <Button variant="outline" className="w-full">View Listings</Button>
            </div>
          </Card>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How Hustly works:</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <strong>1. Track Inventory:</strong> Log purchases with cost basis, source, and photos
            </div>
            <div>
              <strong>2. Create Listings:</strong> AI-powered descriptions and optimized pricing
            </div>
            <div>
              <strong>3. Manage & Profit:</strong> Track sales, calculate profits, grow your business
            </div>
          </div>
        </div>
      </div>

      {isMobile && (
        <MobileNavigation
          currentView={currentView}
          onNavigate={setCurrentView}
        />
      )}
    </div>
  );
};

export default Index;
