
import React, { useState } from 'react';
import Dashboard from './Dashboard';
import CreateListing from './CreateListing';
import ListingsManager from './ListingsManager';

type Screen = 'dashboard' | 'create-listing' | 'listings-manager';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard 
            onCreateListing={() => setCurrentScreen('create-listing')}
            onViewListings={() => setCurrentScreen('listings-manager')}
          />
        );
      case 'create-listing':
        return (
          <CreateListing 
            onBack={() => setCurrentScreen('dashboard')}
            onViewListings={() => setCurrentScreen('listings-manager')}
          />
        );
      case 'listings-manager':
        return (
          <ListingsManager 
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      default:
        return (
          <Dashboard 
            onCreateListing={() => setCurrentScreen('create-listing')}
            onViewListings={() => setCurrentScreen('listings-manager')}
          />
        );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {renderScreen()}
    </div>
  );
};

export default Index;
