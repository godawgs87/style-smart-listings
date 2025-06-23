
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { ListingData } from '@/types/CreateListing';

interface PriceAlertProps {
  listingData: ListingData;
}

const PriceAlert = ({ listingData }: PriceAlertProps) => {
  const isPriceHigh = listingData.condition?.toLowerCase().includes('used') && listingData.price > 100;

  if (!isPriceHigh) return null;

  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Price Check:</strong> ${listingData.price} seems high for used condition. 
        Consider checking sold listings on eBay for similar items to ensure competitive pricing.
      </AlertDescription>
    </Alert>
  );
};

export default PriceAlert;
