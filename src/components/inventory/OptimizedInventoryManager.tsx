
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useStableInventory } from '@/hooks/useStableInventory';
import { useInventoryDiagnostic } from '@/hooks/useInventoryDiagnostic';
import { useListingOperations } from '@/hooks/useListingOperations';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';
import OptimisticInventoryTable from './OptimisticInventoryTable';
import ImprovedInventoryControls from './ImprovedInventoryControls';
import DiagnosticInventoryManager from './DiagnosticInventoryManager';
import FallbackDataNotice from './FallbackDataNotice';
import InventoryStatsCards from './InventoryStatsCards';
import RefreshStatusIndicator from './RefreshStatusIndicator';
import InventoryErrorSection from './InventoryErrorSection';
import InventoryEmptyState from './InventoryEmptyState';
import InventoryLoadingState from './InventoryLoadingState';
import type { Listing } from '@/types/Listing';

interface OptimizedInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const OptimizedInventoryManager = ({ onCreateListing, onBack }: OptimizedInventoryManagerProps) => {
  const isMobile = useIsMobile();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [useFallbackData, setUseFallbackData] = useState(false);
  const [loadingState, setLoadingState] = useState<'initial' | 'loading' | 'loaded' | 'error'>('initial');

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    categories,
    handleClearFilters
  } = useInventoryFilters([]);

  // Primary inventory hook
  const { 
    listings: primaryListings, 
    loading: primaryLoading, 
    error: primaryError, 
    stats: primaryStats, 
    isRefreshing,
    refetch: primaryRefetch, 
    clearCache 
  } = useStableInventory({
    searchTerm: searchTerm.trim() || undefined,
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
    categoryFilter: categoryFilter === 'all' ? undefined : categoryFilter,
    limit: 30
  });

  // Fallback diagnostic hook - only run when needed
  const { 
    listings: fallbackListings, 
    loading: fallbackLoading, 
    error: fallbackError 
  } = useInventoryDiagnostic();

  // Manage loading state more carefully
  useEffect(() => {
    if (useFallbackData) {
      if (fallbackLoading) {
        setLoadingState('loading');
      } else if (fallbackError) {
        setLoadingState('error');
      } else {
        setLoadingState('loaded');
      }
    } else {
      if (primaryLoading || isRefreshing) {
        setLoadingState('loading');
      } else if (primaryError) {
        setLoadingState('error');
      } else {
        setLoadingState('loaded');
      }
    }
  }, [primaryLoading, primaryError, isRefreshing, fallbackLoading, fallbackError, useFallbackData]);

  // Auto-switch to fallback if primary fails but fallback has data
  useEffect(() => {
    if (loadingState === 'error' && primaryError && !useFallbackData && fallbackListings.length > 0 && !fallbackError) {
      console.log('🔄 Auto-switching to fallback data due to primary error');
      setUseFallbackData(true);
    }
  }, [loadingState, primaryError, useFallbackData, fallbackListings.length, fallbackError]);

  // Determine which data to use
  const shouldUseFallback = useFallbackData;
  const listings = shouldUseFallback ? fallbackListings : primaryListings;
  const currentError = shouldUseFallback ? fallbackError : primaryError;
  
  // Calculate stats for fallback data
  const fallbackStats = {
    totalItems: fallbackListings.length,
    totalValue: fallbackListings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: fallbackListings.filter(item => item.status === 'active').length,
    draftItems: fallbackListings.filter(item => item.status === 'draft').length
  };
  
  const stats = shouldUseFallback ? fallbackStats : primaryStats;

  const { deleteListing, updateListing, duplicateListing } = useListingOperations();

  // Show diagnostic mode if explicitly requested
  if (showDiagnostic) {
    return (
      <DiagnosticInventoryManager
        onCreateListing={onCreateListing}
        onBack={() => setShowDiagnostic(false)}
      />
    );
  }

  const handleSelectListing = (listingId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked 
        ? [...prev, listingId]
        : prev.filter(id => id !== listingId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? listings.map(l => l.id) : []);
  };

  const handleUpdateListing = async (listingId: string, updates: any) => {
    const success = await updateListing(listingId, updates);
    if (success) {
      if (shouldUseFallback) {
        window.location.reload();
      } else {
        setTimeout(() => primaryRefetch(), 1000);
      }
    }
  };

  const handleDeleteListing = async (listingId: string): Promise<void> => {
    const success = await deleteListing(listingId);
    if (success) {
      setSelectedItems(prev => prev.filter(id => id !== listingId));
      if (shouldUseFallback) {
        window.location.reload();
      } else {
        setTimeout(() => primaryRefetch(), 1000);
      }
    }
  };

  const handleDuplicateListing = async (listing: any) => {
    const result = await duplicateListing(listing);
    if (result) {
      if (shouldUseFallback) {
        window.location.reload();
      } else {
        primaryRefetch();
      }
    }
    return result;
  };

  const handleRetryWithFilters = () => {
    handleClearFilters();
    clearCache();
    setUseFallbackData(false);
    setLoadingState('initial');
    primaryRefetch();
  };

  const handleUseFallback = () => {
    setUseFallbackData(true);
    setLoadingState('initial');
  };

  const handleRetryPrimary = () => {
    setUseFallbackData(false);
    setLoadingState('initial');
    clearCache();
    primaryRefetch();
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Fallback Data Notice */}
        {shouldUseFallback && loadingState === 'loaded' && (
          <FallbackDataNotice onRetryPrimary={handleRetryPrimary} />
        )}

        {/* Stats Cards - only show when loaded and have data */}
        {loadingState === 'loaded' && listings.length > 0 && (
          <InventoryStatsCards stats={stats} />
        )}

        {/* Refresh Status */}
        {isRefreshing && !shouldUseFallback && (
          <RefreshStatusIndicator />
        )}

        {/* Error Handling - only show when in error state */}
        {loadingState === 'error' && currentError && !shouldUseFallback && (
          <InventoryErrorSection
            error={currentError}
            onRetry={primaryRefetch}
            onClearFilters={handleRetryWithFilters}
            onUseFallback={handleUseFallback}
            onShowDiagnostic={() => setShowDiagnostic(true)}
            fallbackDataCount={fallbackListings.length}
          />
        )}

        {/* Controls - only show if not in error state or using fallback */}
        {(loadingState !== 'error' || shouldUseFallback) && (
          <ImprovedInventoryControls
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            categories={categories}
            loading={loadingState === 'loading'}
            selectedCount={selectedItems.length}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onCategoryChange={setCategoryFilter}
            onClearFilters={handleClearFilters}
            onRefresh={shouldUseFallback ? () => window.location.reload() : primaryRefetch}
            onCreateListing={onCreateListing}
          />
        )}

        {/* Table - only show if loaded successfully */}
        {loadingState === 'loaded' && listings.length > 0 && (
          <OptimisticInventoryTable
            listings={listings}
            selectedListings={selectedItems}
            onSelectListing={handleSelectListing}
            onSelectAll={handleSelectAll}
            onUpdateListing={handleUpdateListing}
            onDeleteListing={handleDeleteListing}
            onDuplicateListing={handleDuplicateListing}
            useVirtualization={listings.length > 25}
          />
        )}

        {/* Empty State */}
        {loadingState === 'loaded' && listings.length === 0 && (
          <InventoryEmptyState onCreateListing={onCreateListing} />
        )}

        {/* Loading State - only show when actually loading */}
        {loadingState === 'loading' && (
          <InventoryLoadingState />
        )}
      </div>

      {isMobile && (
        <MobileNavigation
          currentView="inventory"
          onNavigate={() => {}}
          showBack
          onBack={onBack}
          title="Inventory"
        />
      )}
    </div>
  );
};

export default OptimizedInventoryManager;
