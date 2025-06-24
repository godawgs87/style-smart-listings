
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Edit, Copy, Trash, AlertCircle, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

interface ListingsManagerProps {
  onBack: () => void;
}

const ListingsManager = ({ onBack }: ListingsManagerProps) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { listings, loading, error, refetch, deleteListing, updateListing } = useListings();

  const handleSelectListing = (id: string) => {
    setSelectedListings((prev) => {
      if (prev.includes(id)) {
        return prev.filter((listingId) => listingId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedListings.length === 0) return;

    for (const id of selectedListings) {
      await deleteListing(id);
    }

    setSelectedListings([]);
    refetch();
  };

  const handleEditListing = (listing: any) => {
    setEditingListing(listing);
  };

  const handleUpdateListing = async (id: string, data: any) => {
    await updateListing(id, data);
    setEditingListing(null);
    refetch();
  };

  const handleDeleteListing = async (id: string) => {
    await deleteListing(id);
    refetch();
  };

  const handleCopyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `Successfully copied ${title} to clipboard.`,
      });
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
        <StreamlinedHeader
          title="Manage Listings"
          userEmail={user?.email}
          showBack
          onBack={onBack}
        />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode('table')}>
              Table View
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode('cards')}>
              Card View
            </Button>
            {selectedListings.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                Delete Selected ({selectedListings.length})
              </Button>
            )}
          </div>
          <Input type="text" placeholder="Search listings..." className="max-w-xs" />
        </div>

        {error && (
          <div className="text-red-500">
            <AlertCircle className="mr-2 inline-block h-4 w-4" />
            Failed to load listings. Please try again.
          </div>
        )}

        {viewMode === 'table' ? (
          <Table>
            <TableCaption>A list of your eBay listings.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedListings.length === listings?.length}
                    onCheckedChange={() => {
                      if (selectedListings.length === listings?.length) {
                        setSelectedListings([]);
                      } else {
                        setSelectedListings(listings?.map((listing: any) => listing.id) || []);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings?.map((listing: any) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">
                    <Checkbox
                      checked={selectedListings.includes(listing.id)}
                      onCheckedChange={() => handleSelectListing(listing.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{listing.title}</TableCell>
                  <TableCell>{listing.category}</TableCell>
                  <TableCell>${listing.price}</TableCell>
                  <TableCell>
                    {listing.status === 'active' ? (
                      <Badge variant="outline">Active</Badge>
                    ) : (
                      <Badge>Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditListing(listing)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyToClipboard(listing.description || '', "description")}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Description
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteListing(listing.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings?.map((listing: any) => (
              <Card key={listing.id}>
                <CardHeader>
                  <CardTitle>{listing.title}</CardTitle>
                  <CardDescription>Category: {listing.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Price: ${listing.price}</p>
                  <p>Status: {listing.status}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Checkbox
                    checked={selectedListings.includes(listing.id)}
                    onCheckedChange={() => handleSelectListing(listing.id)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEditListing(listing)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyToClipboard(listing.description || '', "description")}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Description
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteListing(listing.id)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isMobile && (
        <MobileNavigation
          currentView="listings"
          onNavigate={() => {}} // Disabled during listings view
          showBack
          onBack={onBack}
          title="Manage Listings"
        />
      )}

      <Dialog open={editingListing !== null} onOpenChange={() => setEditingListing(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
            <DialogDescription>
              Make changes to your listing here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingListing ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  defaultValue={editingListing.title}
                  className="col-span-3"
                  onChange={(e) => setEditingListing({ ...editingListing, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  defaultValue={editingListing.category}
                  className="col-span-3"
                  onChange={(e) => setEditingListing({ ...editingListing, category: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  defaultValue={editingListing.price}
                  className="col-span-3"
                  onChange={(e) => setEditingListing({ ...editingListing, price: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  defaultValue={editingListing.description}
                  className="col-span-3"
                  onChange={(e) => setEditingListing({ ...editingListing, description: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={() => handleUpdateListing(editingListing.id, editingListing)}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingsManager;
