
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Percent, DollarSign, Clock, Send, TrendingDown } from 'lucide-react';
import type { ListingOffer } from '@/types/Platform';

interface OfferManagerProps {
  offers: ListingOffer[];
  onCreateOffer: (offer: Partial<ListingOffer>) => void;
  onSendOffer: (offerId: string) => void;
  onCancelOffer: (offerId: string) => void;
}

const OfferManager = ({
  offers,
  onCreateOffer,
  onSendOffer,
  onCancelOffer
}: OfferManagerProps) => {
  const [newOffer, setNewOffer] = useState({
    offerType: 'price_drop' as const,
    discountPercent: 10,
    expiryHours: 24
  });

  const handleCreateOffer = () => {
    onCreateOffer({
      offerType: newOffer.offerType,
      expiresAt: new Date(Date.now() + newOffer.expiryHours * 60 * 60 * 1000).toISOString()
    });
  };

  const getOfferTypeIcon = (type: string) => {
    switch (type) {
      case 'best_offer': return <DollarSign className="w-4 h-4" />;
      case 'coupon': return <Percent className="w-4 h-4" />;
      case 'price_drop': return <TrendingDown className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getOfferTypeBadge = (type: string) => {
    const colors = {
      best_offer: 'bg-blue-100 text-blue-800',
      coupon: 'bg-purple-100 text-purple-800',
      price_drop: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Offer Management</h2>
      </div>

      {/* Quick Offer Creator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Quick Offer Creator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select 
              value={newOffer.offerType} 
              onValueChange={(value: any) => setNewOffer({...newOffer, offerType: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_drop">Price Drop</SelectItem>
                <SelectItem value="coupon">Coupon</SelectItem>
                <SelectItem value="best_offer">Best Offer</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={newOffer.discountPercent}
                onChange={(e) => setNewOffer({...newOffer, discountPercent: parseInt(e.target.value)})}
                className="w-20"
              />
              <span className="text-sm text-gray-500">% off</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={newOffer.expiryHours}
                onChange={(e) => setNewOffer({...newOffer, expiryHours: parseInt(e.target.value)})}
                className="w-20"
              />
              <span className="text-sm text-gray-500">hours</span>
            </div>
            
            <Button onClick={handleCreateOffer} className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Create Offer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Offers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Offers ({offers.length})</h3>
        
        {offers.map((offer) => (
          <Card key={offer.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getOfferTypeIcon(offer.offerType)}
                    <Badge className={getOfferTypeBadge(offer.offerType)}>
                      {offer.offerType.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-500">Platform: </span>
                    <span className="font-medium">{offer.platform}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-500 line-through">${offer.originalPrice}</span>
                    <span className="font-semibold text-green-600 ml-2">${offer.offerPrice}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Expires {new Date(offer.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {offer.isActive ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendOffer(offer.id)}
                    disabled={!offer.isActive}
                  >
                    Send
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onCancelOffer(offer.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {offers.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No active offers. Create your first offer above!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OfferManager;
