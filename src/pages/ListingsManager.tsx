
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
import { Eye, Download, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ListingData {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  measurements: {
    length?: string;
    width?: string;
    height?: string;
    weight?: string;
  };
  keywords?: string[];
  shippingCost: number;
  photos: string[];
  status: 'draft' | 'exported' | 'listed';
  createdAt: string;
  exportedAt?: string;
}

interface ListingsManagerProps {
  onBack: () => void;
}

const ListingsManager = ({ onBack }: ListingsManagerProps) => {
  const { toast } = useToast();
  
  // Get saved listings from localStorage
  const [listings, setListings] = useState<ListingData[]>(() => {
    const saved = localStorage.getItem('savedListings');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedListing, setSelectedListing] = useState<ListingData | null>(null);

  const handleExportToBay = (listing: ListingData) => {
    // Update listing status
    const updatedListings = listings.map(l => 
      l.id === listing.id 
        ? { ...l, status: 'exported' as const, exportedAt: new Date().toISOString() }
        : l
    );
    setListings(updatedListings);
    localStorage.setItem('savedListings', JSON.stringify(updatedListings));

    // Generate eBay-compatible data
    const ebayData = {
      title: listing.title,
      description: listing.description,
      startPrice: listing.price,
      category: listing.category,
      condition: listing.condition,
      shippingCost: listing.shippingCost,
      photos: listing.photos,
      itemSpecifics: [
        { name: "Condition", value: listing.condition },
        ...(listing.measurements.length ? [{ name: "Length", value: listing.measurements.length }] : []),
        ...(listing.measurements.width ? [{ name: "Width", value: listing.measurements.width }] : []),
        ...(listing.measurements.height ? [{ name: "Height", value: listing.measurements.height }] : []),
        ...(listing.measurements.weight ? [{ name: "Weight", value: listing.measurements.weight }] : []),
      ]
    };

    // Create download link for eBay CSV format
    const csvContent = [
      'Title,Description,StartPrice,Category,Condition,ShippingCost',
      `"${listing.title}","${listing.description}",${listing.price},"${listing.category}","${listing.condition}",${listing.shippingCost}`
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
      `"${listing.title}","${listing.description}",${listing.price},"${listing.category}","${listing.condition}",${listing.shippingCost}`
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
    const updatedListings = listings.map(l => 
      l.status === 'draft' 
        ? { ...l, status: 'exported' as const, exportedAt: new Date().toISOString() }
        : l
    );
    setListings(updatedListings);
    localStorage.setItem('savedListings', JSON.stringify(updatedListings));

    toast({
      title: "Bulk Export Complete!",
      description: `${draftListings.length} listings exported to CSV.`
    });
  };

  const handleDeleteListing = (listingId: string) => {
    const updatedListings = listings.filter(l => l.id !== listingId);
    setListings(updatedListings);
    localStorage.setItem('savedListings', JSON.stringify(updatedListings));
    
    toast({
      title: "Listing Deleted",
      description: "The listing has been removed."
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
                        <div className="text-xs text-gray-600">+${listing.shippingCost} shipping</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(listing.status)}
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
                                      {getStatusBadge(selectedListing.status)} • Created {new Date(selectedListing.createdAt).toLocaleDateString()}
                                    </SheetDescription>
                                  </SheetHeader>
                                  
                                  <div className="mt-6 space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Pricing</h4>
                                      <div className="text-2xl font-bold text-green-600">${selectedListing.price}</div>
                                      <div className="text-sm text-gray-600">+${selectedListing.shippingCost} shipping</div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium mb-2">Description</h4>
                                      <p className="text-sm text-gray-700">{selectedListing.description}</p>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium mb-2">Details</h4>
                                      <div className="space-y-1 text-sm">
                                        <div>Category: {selectedListing.category}</div>
                                        <div>Condition: {selectedListing.condition}</div>
                                        {selectedListing.measurements.weight && (
                                          <div>Weight: {selectedListing.measurements.weight}</div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium mb-2">Photos ({selectedListing.photos.length})</h4>
                                      <div className="grid grid-cols-2 gap-2">
                                        {selectedListing.photos.slice(0, 4).map((photo, index) => (
                                          <img
                                            key={index}
                                            src={photo}
                                            alt={`Product ${index + 1}`}
                                            className="w-full h-20 object-cover rounded"
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </SheetContent>
                          </Sheet>
                          
                          {listing.status === 'draft' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleExportToBay(listing)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteListing(listing.id)}
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
