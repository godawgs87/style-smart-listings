
import { useState, useEffect } from 'react';
import type { Platform, CrossListingRule, ListingOffer, PlatformListing } from '@/types/Platform';

export const usePlatformData = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [rules, setRules] = useState<CrossListingRule[]>([]);
  const [offers, setOffers] = useState<ListingOffer[]>([]);
  const [platformListings, setPlatformListings] = useState<PlatformListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, this would fetch from your backend
    const mockPlatforms: Platform[] = [
      {
        id: 'ebay',
        name: 'eBay',
        icon: '🛒',
        isActive: true,
        settings: {
          autoList: true,
          autoDelist: false,
          autoPrice: true,
          offerManagement: true
        },
        fees: {
          listingFee: 0.35,
          finalValueFee: 12.9,
          paymentProcessingFee: 2.9
        }
      },
      {
        id: 'mercari',
        name: 'Mercari',
        icon: '📦',
        isActive: true,
        settings: {
          autoList: false,
          autoDelist: true,
          autoPrice: false,
          offerManagement: true
        },
        fees: {
          listingFee: 0,
          finalValueFee: 10,
          paymentProcessingFee: 2.9
        }
      },
      {
        id: 'poshmark',
        name: 'Poshmark',
        icon: '👗',
        isActive: false,
        settings: {
          autoList: false,
          autoDelist: false,
          autoPrice: false,
          offerManagement: false
        },
        fees: {
          listingFee: 0,
          finalValueFee: 20,
          paymentProcessingFee: 0
        }
      }
    ];

    const mockRules: CrossListingRule[] = [
      {
        id: 'electronics-rule',
        name: 'Electronics Auto-List',
        platforms: ['ebay', 'mercari'],
        conditions: {
          category: ['Electronics', 'Computers'],
          priceRange: { min: 50, max: 500 }
        },
        settings: {
          autoList: true,
          priceMultiplier: 1.1,
          titleTemplate: '{title} - Fast Shipping!',
          descriptionTemplate: '{description}\n\nShips within 24 hours!'
        }
      }
    ];

    const mockOffers: ListingOffer[] = [
      {
        id: 'offer-1',
        listingId: 'listing-1',
        platform: 'ebay',
        offerType: 'price_drop',
        originalPrice: 100,
        offerPrice: 85,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    const mockPlatformListings: PlatformListing[] = [
      {
        id: 'pl-1',
        listingId: 'listing-1',
        platform: 'ebay',
        platformListingId: 'ebay-123456',
        status: 'active',
        views: 45,
        watchers: 3,
        offers: 1,
        lastSynced: new Date().toISOString()
      }
    ];

    setPlatforms(mockPlatforms);
    setRules(mockRules);
    setOffers(mockOffers);
    setPlatformListings(mockPlatformListings);
    setLoading(false);
  }, []);

  return {
    platforms,
    rules,
    offers,
    platformListings,
    loading
  };
};
