
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import ActiveListingsManager from '@/components/active-listings/ActiveListingsManager';
import { usePlatformData } from '@/hooks/usePlatformData';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ActiveListingsPageProps {
  onBack: () => void;
}

const ActiveListingsPage = ({ onBack }: ActiveListingsPageProps) => {
  const isMobile = useIsMobile();
  const { platforms, rules, offers, platformListings, loading } = usePlatformData();

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
        <StreamlinedHeader
          title="Active Listings"
          showBack
          onBack={onBack}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading platforms and listings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry option
  const renderErrorState = () => (
    <Card className="p-8 text-center max-w-md mx-auto mt-8">
      <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Unable to Load Data</h3>
      <p className="text-gray-600 mb-4">
        We're having trouble connecting to your platforms. Please check your internet connection and try again.
      </p>
      <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Retry
      </Button>
    </Card>
  );

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Active Listings"
        showBack
        onBack={onBack}
      />
      
      {platforms && platforms.length >= 0 ? (
        <ActiveListingsManager
          platforms={platforms}
          rules={rules}
          offers={offers}
          platformListings={platformListings}
        />
      ) : (
        renderErrorState()
      )}

      {isMobile && (
        <MobileNavigation
          currentView="active-listings"
          onNavigate={() => {}}
          showBack
          onBack={onBack}
          title="Active Listings"
        />
      )}
    </div>
  );
};

export default ActiveListingsPage;
