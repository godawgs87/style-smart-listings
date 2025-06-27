import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image, RefreshCw, AlertCircle, Wifi, WifiOff, Package } from 'lucide-react';

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
  usingFallback?: boolean;
}

const SimpleInventoryGrid = ({ 
  listings, 
  loading, 
  error, 
  onRetry, 
  usingFallback = false 
}: SimpleInventoryGridProps) => {
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

  if (error && listings.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status banner for fallback data */}
      {usingFallback && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-yellow-600" />
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">Using Cached Data</p>
            <p className="text-yellow-700 text-sm">
              Database connection issues detected. Showing previously loaded data.
            </p>
          </div>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm" 
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Error message for partial data */}
      {error && listings.length > 0 && !usingFallback && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <div className="flex-1">
            <p className="text-orange-800 text-sm">{error}</p>
          </div>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm" 
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No items found</p>
          <p className="text-sm text-gray-400">
            Your inventory will appear here once you create some listings
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                {/* Image */}
                <div className="flex justify-center">
                  {listing.photos && listing.photos.length > 0 ? (
                    <div className="relative">
                      <img
                        src={listing.photos[0]}
                        alt={listing.title}
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                          if (placeholder) {
                            placeholder.classList.remove('hidden');
                          }
                        }}
                      />
                      <div className="image-placeholder hidden w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center absolute top-0 left-0">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
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
      )}
    </div>
  );
};

export default SimpleInventoryGrid;
