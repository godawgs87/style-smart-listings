import React, { useState, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useListingDetails } from '@/hooks/useListingDetails';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import ListingsTable from '@/components/ListingsTable';
import ListingsCardView from '@/components/ListingsCardView';
import ListingsManagerControls from '@/components/ListingsManagerControls';
import ListingsLoadingState from '@/components/ListingsLoadingState';
import ListingsErrorState from '@/components/ListingsErrorState';
import ListingsEmptyState from '@/components/ListingsEmptyState';
import QuickFilters from '@/components/listings/QuickFilters';
import PageInfoDialog from '@/components/PageInfoDialog';
import InventoryTimeoutError from '@/components/inventory/InventoryTimeoutError';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ListingPreview from '@/components/ListingPreview';
import ListingEditor from '@/components/ListingEditor';

interface ListingsManagerProps {
  onBack: () => void;
}

const ListingsManager = ({ onBack }: ListingsManagerProps) => {
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedListingForDialog, setSelectedListingForDialog] = useState<any>(null);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { loadDetails } = useListingDetails();
  
  const { 
    listings, 
    loading, 
    error, 
    usingFallback,
    deleteListing, 
    updateListing, 
    refetch,
    forceOfflineMode
  } = useListings({
    limit: 25
  });

  // Get unique categories for filters
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(listings.map(l => l.category).filter(Boolean))];
    return uniqueCategories as string[];
  }, [listings]);

  const handleSelectListing = (listingId: string, checked: boolean) => {
    setSelectedListings(prev => 
      checked 
        ? [...prev, listingId]
        : prev.filter(id => id !== listingId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedListings(checked ? filteredListings.map(l => l.id) : []);
  };

  const handleUpdateListing = async (listingId: string, updates: any) => {
    await updateListing(listingId, updates);
  };

  const handleDeleteListing = async (listingId: string) => {
    console.log('Deleting listing:', listingId);
    await deleteListing(listingId);
    setSelectedListings(prev => prev.filter(id => id !== listingId));
  };

  const transformListingForPreview = (listing: any, details: any = {}) => {
    console.log('🔄 transformListingForPreview input:', {
      listing: { 
        id: listing.id, 
        title: listing.title,
        description: listing.description ? 'Has description' : 'No description',
        measurements: listing.measurements ? 'Has measurements' : 'No measurements'
      },
      details: details ? {
        description: details.description ? 'Has description' : 'No description',
        measurements: details.measurements ? 'Has measurements' : 'No measurements',
        keywords: details.keywords ? `${details.keywords.length} keywords` : 'No keywords'
      } : 'No details'
    });

    const transformed = {
      title: listing.title || '',
      description: details.description || listing.description || '',
      price: listing.price || 0,
      category: listing.category || '',
      condition: listing.condition || '',
      measurements: details.measurements || listing.measurements || {},
      keywords: details.keywords || listing.keywords || [],
      photos: details.photos || listing.photos || [],
      priceResearch: details.price_research || listing.price_research || '',
      shippingCost: details.shipping_cost || listing.shipping_cost || 0,
      brand: details.brand || listing.brand || '',
      model: details.model || listing.model || '',
      features: details.features || listing.features || [],
      defects: details.defects || listing.defects || [],
      includes: details.includes || listing.includes || []
    };

    console.log('🔄 transformListingForPreview output:', {
      description: transformed.description ? 'Present' : 'Missing',
      measurements: transformed.measurements ? Object.keys(transformed.measurements) : 'Missing',
      keywords: transformed.keywords ? transformed.keywords.length : 'Missing'
    });

    return transformed;
  };

  const transformListingForEdit = (listing: any, details: any = {}) => {
    return {
      title: listing.title || '',
      description: details.description || listing.description || '',
      price: listing.price || 0,
      category: listing.category || '',
      condition: listing.condition || '',
      measurements: details.measurements || listing.measurements || {},
      keywords: details.keywords || listing.keywords || [],
      photos: details.photos || listing.photos || [],
      priceResearch: details.price_research || listing.price_research || '',
      purchase_price: details.purchase_price || listing.purchase_price,
      purchase_date: details.purchase_date || listing.purchase_date,
      source_location: details.source_location || listing.source_location,
      source_type: details.source_type || listing.source_type,
      is_consignment: details.is_consignment || listing.is_consignment,
      consignment_percentage: details.consignment_percentage || listing.consignment_percentage,
      consignor_name: details.consignor_name || listing.consignor_name,
      consignor_contact: details.consignor_contact || listing.consignor_contact
    };
  };

  const handlePreviewListing = async (listing: any) => {
    console.log('🎯 handlePreviewListing called for:', listing.id);
    console.log('🎯 Original listing data:', {
      title: listing.title,
      description: listing.description ? 'Has description' : 'No description',
      measurements: listing.measurements ? 'Has measurements' : 'No measurements'
    });
    
    // Load full details for preview
    const details = await loadDetails(listing.id);
    console.log('🎯 Loaded details:', details ? {
      description: details.description ? 'Has description' : 'No description',
      measurements: details.measurements ? 'Has measurements' : 'No measurements',
      keywords: details.keywords ? `${details.keywords.length} keywords` : 'No keywords'
    } : 'No details loaded');
    
    const transformedListing = transformListingForPreview(listing, details);
    console.log('🎯 Final transformed listing for preview:', transformedListing);
    
    setSelectedListingForDialog(transformedListing);
    setShowPreviewDialog(true);
  };

  const handleEditListing = async (listing: any) => {
    console.log('Edit listing:', listing);
    
    // Load full details for editing
    const details = await loadDetails(listing.id);
    console.log('Loaded details for edit:', details);
    
    const transformedListing = transformListingForEdit(listing, details);
    console.log('Transformed listing for edit:', transformedListing);
    
    setSelectedListingForDialog({ ...transformedListing, id: listing.id });
    setShowEditDialog(true);
  };

  const handleBulkDelete = async () => {
    if (selectedListings.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedListings.length} listings? This action cannot be undone.`)) {
      for (const id of selectedListings) {
        await deleteListing(id);
      }
      setSelectedListings([]);
    }
  };

  const handleSaveEdit = async (updatedListing: any) => {
    if (selectedListingForDialog && selectedListingForDialog.id) {
      await updateListing(selectedListingForDialog.id, updatedListing);
      setShowEditDialog(false);
      setSelectedListingForDialog(null);
    }
  };

  // Apply filters
  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.category?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;

      // Condition filter
      const matchesCondition = conditionFilter === 'all' || 
        listing.condition?.toLowerCase() === conditionFilter;

      // Price range filter
      const matchesPriceRange = () => {
        if (priceRangeFilter === 'all') return true;
        const price = listing.price;
        switch (priceRangeFilter) {
          case 'under-25': return price < 25;
          case '25-100': return price >= 25 && price <= 100;
          case '100-500': return price > 100 && price <= 500;
          case 'over-500': return price > 500;
          default: return true;
        }
      };

      return matchesSearch && matchesCategory && matchesCondition && matchesPriceRange();
    });
  }, [listings, searchTerm, categoryFilter, conditionFilter, priceRangeFilter]);

  const activeFiltersCount = [categoryFilter, conditionFilter, priceRangeFilter]
    .filter(filter => filter !== 'all').length;

  const handleClearFilters = () => {
    setCategoryFilter('all');
    setConditionFilter('all');
    setPriceRangeFilter('all');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <ListingsLoadingState 
        title="Manage Listings"
        userEmail={user?.email}
        onBack={onBack}
        isMobile={isMobile}
      />
    );
  }

  // Show specific error page for critical errors
  if (error && (error.includes('AUTHENTICATION_ERROR') || error.includes('RLS_POLICY_ERROR') || error.includes('JWT_ERROR'))) {
    return (
      <InventoryTimeoutError
        onBack={onBack}
        onRetry={refetch}
        onForceOffline={forceOfflineMode}
        error={error}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Manage Listings"
        userEmail={user?.email}
        showBack
        onBack={onBack}
      />

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Manage Listings</h1>
          <PageInfoDialog pageName="Manage Listings" />
          {usingFallback && (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                Offline Mode
              </div>
              <button
                onClick={refetch}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Reconnect
              </button>
            </div>
          )}
        </div>

        <ListingsManagerControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedListings={selectedListings}
          onBulkDelete={handleBulkDelete}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filteredCount={filteredListings.length}
        />

        <QuickFilters
          categories={categories}
          selectedCategory={categoryFilter}
          onCategoryChange={setCategoryFilter}
          conditionFilter={conditionFilter}
          onConditionChange={setConditionFilter}
          priceRange={priceRangeFilter}
          onPriceRangeChange={setPriceRangeFilter}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={handleClearFilters}
        />

        {error && !error.includes('AUTHENTICATION_ERROR') && !error.includes('RLS_POLICY_ERROR') && !error.includes('JWT_ERROR') && (
          <ListingsErrorState error={error} />
        )}

        {viewMode === 'grid' && (
          <ListingsCardView
            listings={filteredListings}
            isBulkMode={selectedListings.length > 0}
            selectedListings={selectedListings}
            onSelectListing={handleSelectListing}
            onEditListing={handleEditListing}
            onPreviewListing={handlePreviewListing}
            onDeleteListing={handleDeleteListing}
          />
        )}

        {viewMode === 'table' && (
          <ListingsTable
            listings={filteredListings}
            selectedListings={selectedListings}
            onSelectListing={handleSelectListing}
            onSelectAll={handleSelectAll}
            onUpdateListing={handleUpdateListing}
            onDeleteListing={handleDeleteListing}
            onPreviewListing={handlePreviewListing}
            onEditListing={handleEditListing}
          />
        )}

        {filteredListings.length === 0 && !loading && !error && (
          <ListingsEmptyState />
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Item Preview</DialogTitle>
          </DialogHeader>
          {selectedListingForDialog && (
            <ListingPreview
              listing={selectedListingForDialog}
              onEdit={() => {
                setShowPreviewDialog(false);
                setShowEditDialog(true);
              }}
              onExport={() => {
                setShowPreviewDialog(false);
                // TODO: Handle export/publish action
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {selectedListingForDialog && (
            <ListingEditor
              listing={selectedListingForDialog}
              onSave={handleSaveEdit}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {isMobile && (
        <MobileNavigation
          currentView="listings"
          onNavigate={() => {}}
          showBack
          onBack={onBack}
          title="Manage Listings"
        />
      )}
    </div>
  );
};

export default ListingsManager;
