
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Settings, Eye, EyeOff } from 'lucide-react';
import ListingEditor from './ListingEditor';

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
  priceResearch?: string;
  brand?: string;
  model?: string;
  features?: string[];
  defects?: string[];
  includes?: string[];
}

interface ListingPreviewProps {
  listing: ListingData;
  onEdit: () => void;
  onExport: () => void;
}

const ListingPreview = ({ listing, onEdit, onExport }: ListingPreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentListing, setCurrentListing] = useState(listing);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAdminClick = () => {
    window.location.href = '/admin';
  };

  const handleSaveEdit = (updatedListing: ListingData) => {
    setCurrentListing(updatedListing);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <ListingEditor
        listing={currentListing}
        onSave={handleSaveEdit}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900 pr-4">{currentListing.title}</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleAdminClick}>
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-500">Price</span>
            <p className="text-2xl font-bold text-green-600">${currentListing.price}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Shipping</span>
            <p className="text-lg font-semibold">${currentListing.shippingCost?.toFixed(2) || '9.95'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{currentListing.category}</Badge>
          <Badge variant="outline">{currentListing.condition}</Badge>
          {currentListing.brand && (
            <Badge variant="outline" className="bg-blue-50">{currentListing.brand}</Badge>
          )}
          {currentListing.model && (
            <Badge variant="outline" className="bg-purple-50">{currentListing.model}</Badge>
          )}
          {currentListing.keywords?.slice(0, 3).map((keyword, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {currentListing.description}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Measurements</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {currentListing.measurements.length && (
                <span>Length: {currentListing.measurements.length}</span>
              )}
              {currentListing.measurements.width && (
                <span>Width: {currentListing.measurements.width}</span>
              )}
              {currentListing.measurements.height && (
                <span>Height: {currentListing.measurements.height}</span>
              )}
              {currentListing.measurements.weight && (
                <span>Weight: {currentListing.measurements.weight}</span>
              )}
            </div>
          </div>

          {/* Features */}
          {currentListing.features && currentListing.features.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Key Features</h3>
              <div className="flex flex-wrap gap-1">
                {currentListing.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-green-50">
                    ✓ {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* What's Included */}
          {currentListing.includes && currentListing.includes.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">What's Included</h3>
              <div className="text-sm text-gray-700">
                {currentListing.includes.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Defects/Issues */}
          {currentListing.defects && currentListing.defects.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2 text-red-700">Issues/Defects</h3>
              <div className="text-sm text-red-600">
                {currentListing.defects.map((defect, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {defect}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Details Toggle */}
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm"
            >
              {showAdvanced ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showAdvanced ? 'Hide' : 'Show'} Advanced Details
            </Button>
            
            {showAdvanced && currentListing.priceResearch && (
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <h4 className="font-medium text-gray-900 mb-2">Price Research</h4>
                <p className="text-sm text-gray-600">{currentListing.priceResearch}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {currentListing.photos.slice(0, 6).map((photo, index) => (
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
