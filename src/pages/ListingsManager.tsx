
import React, { useState } from 'react';
import MobileHeader from '@/components/MobileHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Eye, Download, Trash2, Upload, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useListings } from '@/hooks/useListings';

interface ListingsManagerProps {
  onBack: () => void;
}

const ListingsManager = ({ onBack }: ListingsManagerProps) => {
  const { toast } = useToast();
  const { listings, loading, deleteListing, updateListingStatus } = useListings();
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const handleListToEbay = async (listing: any) => {
    try {
      toast({
        title: "Listing to eBay...",
        description: "Please wait while we list your item on eBay."
      });

      const { data, error } = await supabase.functions.invoke('list-to-ebay', {
        body: { listing }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        await updateListingStatus(listing.id, 'listed', {
          ebay_item_id: data.itemId,
          listed_at: new Date().toISOString()
        });

        toast({
          title: "Listed on eBay!",
          description: `${listing.title} has been successfully listed on eBay.`
        });
      } else {
        throw new Error(data.error || 'eBay listing failed');
      }
    } catch (error) {
      console.error('eBay listing error:', error);
      toast({
        title: "eBay Listing Failed",
        description: "There was an error listing your item on eBay. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportToBay = async (listing: any) => {
    const success = await updateListingStatus(listing.id, 'exported', {
      exported_at: new Date().toISOString()
    });

    if (!success) return;

    // Generate eBay-compatible CSV
    const csvContent = [
      'Title,Description,StartPrice,Category,Condition,ShippingCost',
      `"${listing.title}","${listing.description || ''}",${listing.price},"${listing.category || ''}","${listing.condition || ''}",${listing.shipping_cost || 9.95}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebay-listing-${listing.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exported to eBay!",
      description: `${listing.title} has been exported and CSV downloaded.`
    });
  };

  const handleBulkExport = () => {
    const draftListings = listings.filter(l => l.status === 'draft');
    
    if (draftListings.length === 0) {
      toast({
        title: "No listings to export",
        description: "All listings have already been exported.",
        variant: "destructive"
      });
      return;
    }

    // Create bulk CSV
    const csvHeaders = 'Title,Description,StartPrice,Category,Condition,ShippingCost\n';
    const csvRows = draftListings.map(listing => 
      `"${listing.title}","${listing.description || ''}",${listing.price},"${listing.category || ''}","${listing.condition || ''}",${listing.shipping_cost || 9.95}`
    ).join('\n');

    const csvContent = csvHeaders + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebay-bulk-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    // Update all exported listings
    draftListings.forEach(listing => {
      updateListingStatus(listing.id, 'exported', {
        exported_at: new Date().toISOString()
      });
    });

    toast({
      title: "Bulk Export Complete!",
      description: `${draftListings.length} listings exported to CSV.`
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'exported':
        return <Badge variant="secondary">Exported</Badge>;
      case 'listed':
        return <Badge>Listed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title="Listings Manager" 
        showBack 
        onBack={onBack}
        rightAction={
          <Button 
            onClick={handleBulkExport} 
            size="sm"
            disabled={listings.filter(l => l.status === 'draft').length === 0}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Export
          </Button>
        }
      />

      <div className="p-4">
        {listings.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No Listings Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first listing to see it here!
            </p>
            <Button onClick={onBack}>
              Create Listing
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {listings.filter(l => l.status === 'draft').length}
                  </div>
                  <div className="text-sm text-gray-600">Draft</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {listings.filter(l => l.status === 'exported').length}
                  </div>
                  <div className="text-sm text-gray-600">Exported</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {listings.filter(l => l.status === 'listed').length}
                  </div>
                  <div className="text-sm text-gray-600">Listed</div>
                </div>
              </div>
            </Card>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div className="font-medium">{listing.title}</div>
                        <div className="text-sm text-gray-600">{listing.category}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">${listing.price}</div>
                        <div className="text-xs text-gray-600">+${listing.shipping_cost || 9.95} shipping</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(listing.status || 'draft')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedListing(listing)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full max-w-md">
                              {selectedListing && (
                                <>
                                  <SheetHeader>
                                    <SheetTitle>{selectedListing.title}</SheetTitle>
                                    <SheetDescription>
                                      {getStatusBadge(selectedListing.status || 'draft')} • Created {new Date(selectedListing.created_at).toLocaleDateString()}
                                    </SheetDescription>
                                  </SheetHeader>
                                  
                                  <div className="mt-6 space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Pricing</h4>
                                      <div className="text-2xl font-bold text-green-600">${selectedListing.price}</div>
                                      <div className="text-sm text-gray-600">+${selectedListing.shipping_cost || 9.95} shipping</div>
                                    </div>
                                    
                                    {selectedListing.description && (
                                      <div>
                                        <h4 className="font-medium mb-2">Description</h4>
                                        <p className="text-sm text-gray-700">{selectedListing.description}</p>
                                      </div>
                                    )}
                                    
                                    <div>
                                      <h4 className="font-medium mb-2">Details</h4>
                                      <div className="space-y-1 text-sm">
                                        {selectedListing.category && <div>Category: {selectedListing.category}</div>}
                                        {selectedListing.condition && <div>Condition: {selectedListing.condition}</div>}
                                        {selectedListing.measurements?.weight && (
                                          <div>Weight: {selectedListing.measurements.weight}</div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {selectedListing.photos && selectedListing.photos.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-2">Photos ({selectedListing.photos.length})</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                          {selectedListing.photos.slice(0, 4).map((photo: string, index: number) => (
                                            <img
                                              key={index}
                                              src={photo}
                                              alt={`Product ${index + 1}`}
                                              className="w-full h-20 object-cover rounded"
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </SheetContent>
                          </Sheet>
                          
                          {listing.status === 'draft' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleListToEbay(listing)}
                                className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleExportToBay(listing)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteListing(listing.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsManager;
