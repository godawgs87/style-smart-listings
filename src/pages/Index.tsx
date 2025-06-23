
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, List, LogOut } from "lucide-react";
import CreateListing from "./CreateListing";
import ListingsManager from "./ListingsManager";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'listings'>('dashboard');
  const { user, loading, signOut } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">eBay Listing Helper</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Create Professional eBay Listings in Minutes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload photos, get AI-powered descriptions and pricing, calculate shipping costs, 
            and export directly to eBay.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => setCurrentView('create')}>
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Create New Listing</h3>
              <p className="text-gray-600 mb-4">
                Upload photos and let AI generate a complete listing with title, description, and pricing.
              </p>
              <Button className="w-full">Start Creating</Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setCurrentView('listings')}>
            <div className="text-center">
              <List className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Manage Listings</h3>
              <p className="text-gray-600 mb-4">
                View, edit, and export your saved listings. Keep track of all your created listings.
              </p>
              <Button variant="outline" className="w-full">View Listings</Button>
            </div>
          </Card>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How it works:</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <strong>1. Upload Photos:</strong> Take clear pictures of your item from multiple angles
            </div>
            <div>
              <strong>2. AI Analysis:</strong> Our AI identifies the item and suggests optimized listing details
            </div>
            <div>
              <strong>3. Export & List:</strong> Review, calculate shipping, and export to eBay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
