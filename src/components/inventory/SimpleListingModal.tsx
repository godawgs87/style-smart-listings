import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { Listing } from '@/types/Listing';

interface SimpleListingModalProps {
  listing: Listing;
  onClose: () => void;
}

const SimpleListingModal = ({ listing, onClose }: SimpleListingModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
            <div className="flex gap-2">
              <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                {listing.status}
              </Badge>
              <Badge variant="outline">{listing.category || 'No category'}</Badge>
              <Badge variant="outline">{listing.condition || 'No condition'}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-1">Price</h3>
              <p className="text-2xl font-bold text-green-600">${listing.price}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Shipping</h3>
              <p className="text-lg">${listing.shipping_cost || 9.95}</p>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700">{listing.description}</p>
            </div>
          )}

          {/* Photos */}
          {listing.photos && listing.photos.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Photos</h3>
              <div className="grid grid-cols-3 gap-2">
                {listing.photos.slice(0, 6).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${listing.title} ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {listing.keywords && listing.keywords.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-1">
                {listing.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleListingModal;