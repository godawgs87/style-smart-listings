
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import ActiveListingsManager from '@/components/active-listings/ActiveListingsManager';
import { usePlatformData } from '@/hooks/usePlatformData';

interface ActiveListingsPageProps {
  onBack: () => void;
}

const ActiveListingsPage = ({ onBack }: ActiveListingsPageProps) => {
  const isMobile = useIsMobile();
  const { platforms, rules, offers, platformListings, loading } = usePlatformData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Active Listings"
        showBack
        onBack={onBack}
      />
      
      <ActiveListingsManager
        platforms={platforms}
        rules={rules}
        offers={offers}
        platformListings={platformListings}
      />

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
