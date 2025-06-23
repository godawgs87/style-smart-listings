
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Settings } from 'lucide-react';

interface ListingData {
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
  shippingCost?: number;
  photos: string[];
}

interface ListingPreviewProps {
  listing: ListingData;
  onEdit: () => void;
  onExport: () => void;
}

const ListingPreview = ({ listing, onEdit, onExport }: ListingPreviewProps) => {
  const handleAdminClick = () => {
    window.location.href = '/admin';
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900 pr-4">{listing.title}</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleAdminClick}>
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-500">Price</span>
            <p className="text-2xl font-bold text-green-600">${listing.price}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Shipping</span>
            <p className="text-lg font-semibold">${listing.shippingCost?.toFixed(2) || '9.95'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{listing.category}</Badge>
          <Badge variant="outline">{listing.condition}</Badge>
          {listing.keywords?.slice(0, 3).map((keyword, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {listing.description}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Measurements</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {listing.measurements.length && (
                <span>Length: {listing.measurements.length}</span>
              )}
              {listing.measurements.width && (
                <span>Width: {listing.measurements.width}</span>
              )}
              {listing.measurements.height && (
                <span>Height: {listing.measurements.height}</span>
              )}
              {listing.measurements.weight && (
                <span>Weight: {listing.measurements.weight}</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {listing.photos.slice(0, 6).map((photo, index) => (
          <img
            key={index}
            src={photo}
            alt={`Product ${index + 1}`}
            className="w-full h-20 object-cover rounded-lg"
          />
        ))}
      </div>

      <Button onClick={onExport} className="w-full gradient-bg text-white">
        Continue to Shipping
      </Button>
    </div>
  );
};

export default ListingPreview;
