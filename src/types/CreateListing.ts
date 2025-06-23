
export type Step = 'photos' | 'analysis' | 'preview' | 'shipping';

export interface ListingData {
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
  photos: string[];
}

export interface CreateListingProps {
  onBack: () => void;
  onViewListings?: () => void;
}
