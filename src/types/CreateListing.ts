
export type Step = 'photos' | 'analysis' | 'preview' | 'shipping';

export interface ListingData {
  title: string;
  description: string;
  price: number;
  purchase_price?: number;
  purchase_date?: string;
  is_consignment?: boolean;
  consignment_percentage?: number;
  consignor_name?: string;
  consignor_contact?: string;
  source_location?: string;
  source_type?: string;
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
  priceResearch?: string;
  cost_basis?: number;
  fees_paid?: number;
  net_profit?: number;
  profit_margin?: number;
  listed_date?: string;
  sold_date?: string;
  sold_price?: number;
  days_to_sell?: number;
  performance_notes?: string;
  features?: string[];
  includes?: string[];
  defects?: string[];
  // New size fields
  clothing_size?: string;
  shoe_size?: string;
  gender?: 'Men' | 'Women' | 'Kids' | 'Unisex';
  age_group?: 'Adult' | 'Youth' | 'Toddler' | 'Baby';
}

export interface CreateListingState {
  step: number;
  listingData: ListingData;
  shippingCost: number;
  isSubmitting: boolean;
  photos: File[];
  photoUrls: string[];
  keywords: string[];
  isAnalyzing: boolean;
  analysisResults: any;
}
