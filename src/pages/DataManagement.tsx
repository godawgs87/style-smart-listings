
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedInventory } from '@/hooks/useUnifiedInventory';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import EnhancedMobileNavigation from '@/components/EnhancedMobileNavigation';
import CSVDataManager from '@/components/inventory/CSVDataManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

interface DataManagementProps {
  onBack: () => void;
  onNavigate: (view: 'dashboard' | 'create' | 'inventory' | 'active-listings') => void;
}

const DataManagement = ({ onBack, onNavigate }: DataManagementProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const { 
    listings, 
    loading, 
    refetch
  } = useUnifiedInventory({
    limit: 1000 // Get all listings for export
  });

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Data Management"
        userEmail={user?.email}
        showBack
        onBack={onBack}
      />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Import & Export Data</h2>
          <p className="text-gray-600">Manage your inventory data with CSV import and export</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              CSV Data Management
            </CardTitle>
            <CardDescription>
              Export your current inventory or import new listings from CSV files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CSVDataManager 
              listings={listings}
              onImportComplete={refetch}
            />
          </CardContent>
        </Card>
      </div>

      {isMobile && (
        <EnhancedMobileNavigation
          currentView="data-management"
          onNavigate={onNavigate}
          showBack
          onBack={onBack}
          title="Data Management"
          loading={loading}
        />
      )}
    </div>
  );
};

export default DataManagement;
