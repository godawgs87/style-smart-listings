
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image, RefreshCw } from 'lucide-react';

interface SimpleListing {
  id: string;
  title: string;
  price: number;
  status: string | null;
  category: string | null;
  photos: string[] | null;
  created_at: string;
}

interface SimpleInventoryGridProps {
  listings: SimpleListing[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const SimpleInventoryGrid = ({ listings, loading, error, onRetry }: SimpleInventoryGridProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No items found</p>
        <p className="text-sm text-gray-400">
          Your inventory will appear here once you create some listings
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {listings.map((listing) => (
        <Card key={listing.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            {/* Image */}
            <div className="flex justify-center">
              {listing.photos && listing.photos.length > 0 ? (
                <img
                  src={listing.photos[0]}
                  alt={listing.title}
                  className="w-32 h-32 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLElement;
                    if (placeholder) {
                      placeholder.classList.remove('hidden');
                    }
                  }}
                />
              ) : null}
              <div className={`w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center ${listing.photos && listing.photos.length > 0 ? 'hidden' : ''}`}>
                <Image className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            {/* Title */}
            <h3 className="font-medium text-sm line-clamp-2" title={listing.title}>
              {listing.title}
            </h3>

            {/* Price */}
            <p className="text-lg font-bold text-green-600">
              ${typeof listing.price === 'number' ? listing.price.toFixed(2) : listing.price}
            </p>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {listing.status && (
                <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                  {listing.status}
                </Badge>
              )}
              {listing.category && (
                <Badge variant="outline">{listing.category}</Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SimpleInventoryGrid;
