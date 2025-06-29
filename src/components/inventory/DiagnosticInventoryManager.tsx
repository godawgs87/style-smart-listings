
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useInventoryDiagnostic } from '@/hooks/useInventoryDiagnostic';

interface DiagnosticInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const DiagnosticInventoryManager = ({ onCreateListing, onBack }: DiagnosticInventoryManagerProps) => {
  const isMobile = useIsMobile();
  const { loading, error, listings, diagnostics, retry } = useInventoryDiagnostic();

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Diagnostic"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Status Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Inventory Load Status</h2>
            <Button onClick={retry} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Testing...' : 'Retry Test'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : listings.length}
              </div>
              <div className="text-sm text-blue-700">Records Found</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {diagnostics.length}
              </div>
              <div className="text-sm text-gray-700">Diagnostic Steps</div>
            </div>
            
            <div className="text-center p-4 rounded-lg" style={{
              backgroundColor: error ? '#fef2f2' : loading ? '#fef3c7' : '#f0fdf4'
            }}>
              <div className="flex items-center justify-center mb-2">
                {error ? (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                ) : loading ? (
                  <RefreshCw className="w-6 h-6 text-yellow-500 animate-spin" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>
              <div className="text-sm font-medium">
                {error ? 'Error' : loading ? 'Loading' : 'Success'}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-red-800 mb-2">Error Details:</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </Card>

        {/* Diagnostic Log */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Diagnostic Log</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {diagnostics.length === 0 ? (
              <div className="text-gray-500">No diagnostics yet...</div>
            ) : (
              diagnostics.map((diagnostic, index) => (
                <div key={index} className="mb-1">
                  {diagnostic}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Sample Data */}
        {listings.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sample Data Retrieved</h3>
            <div className="space-y-2">
              {listings.slice(0, 3).map((listing) => (
                <div key={listing.id} className="bg-gray-50 p-3 rounded border">
                  <div className="font-medium">{listing.title}</div>
                  <div className="text-sm text-gray-600">
                    ID: {listing.id} | Price: ${listing.price} | Status: {listing.status}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card className="p-6">
          <div className="flex gap-4">
            <Button onClick={onCreateListing} variant="outline">
              Create Test Listing
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
          </div>
        </Card>
      </div>

      {isMobile && (
        <MobileNavigation
          currentView="inventory"
          onNavigate={() => {}}
          showBack
          onBack={onBack}
          title="Diagnostic"
        />
      )}
    </div>
  );
};

export default DiagnosticInventoryManager;
