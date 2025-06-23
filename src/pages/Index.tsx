
import React, { useState } from 'react';
import Dashboard from './Dashboard';
import CreateListing from './CreateListing';

type Screen = 'dashboard' | 'create-listing';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onCreateListing={() => setCurrentScreen('create-listing')} />;
      case 'create-listing':
        return <CreateListing onBack={() => setCurrentScreen('dashboard')} />;
      default:
        return <Dashboard onCreateListing={() => setCurrentScreen('create-listing')} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {renderScreen()}
    </div>
  );
};

export default Index;
