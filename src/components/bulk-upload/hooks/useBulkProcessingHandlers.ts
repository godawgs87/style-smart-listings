
import { useToast } from '@/hooks/use-toast';
import type { PhotoGroup } from '../BulkUploadManager';
import { generateShippingOptions } from '../utils/shippingCalculator';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkProcessingHandlers = (
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void,
  setProcessingResults: (results: any[]) => void,
  setCurrentStep: (step: StepType) => void
) => {
  const { toast } = useToast();

  const processAllGroupsWithAI = async (groups: PhotoGroup[]) => {
    console.log('Starting AI processing for', groups.length, 'groups');
    
    // Process each group with AI analysis
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      
      // Update status to processing
      setPhotoGroups(prev => prev.map(g => 
        g.id === group.id 
          ? { ...g, status: 'processing' as const }
          : g
      ));

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate mock AI analysis results with all required fields
      const mockListingData = {
        title: `${group.name} - Analyzed Item`,
        description: `High-quality item analyzed from uploaded photos. This appears to be a well-maintained piece with good resale potential.`,
        price: Math.floor(Math.random() * 50) + 15,
        category: 'Clothing',
        category_id: null,
        condition: 'Good',
        measurements: {
          length: '12',
          width: '8', 
          height: '4',
          weight: (Math.random() * 2 + 0.5).toFixed(1) // Random weight between 0.5-2.5 lbs
        },
        keywords: ['vintage', 'quality', 'fashion'],
        photos: [],
        priceResearch: 'Comparable items selling for $20-45',
        purchase_price: undefined,
        purchase_date: undefined,
        source_location: undefined,
        source_type: undefined,
        is_consignment: false,
        consignment_percentage: undefined,
        consignor_name: undefined,
        consignor_contact: undefined,
        clothing_size: undefined,
        shoe_size: undefined,
        gender: undefined,
        age_group: undefined,
        features: [],
        includes: [],
        defects: []
      };

      // Generate shipping options based on weight
      const weight = parseFloat(mockListingData.measurements.weight);
      const shippingOptions = generateShippingOptions(weight);

      // Update group with AI results
      setPhotoGroups(prev => prev.map(g => 
        g.id === group.id 
          ? { 
              ...g, 
              status: 'completed' as const,
              listingData: mockListingData,
              shippingOptions: shippingOptions
            }
          : g
      ));
    }

    // Set processing results
    const results = groups.map(g => ({ id: g.id, status: 'completed' }));
    setProcessingResults(results);

    toast({
      title: "AI Analysis Complete!",
      description: `Processed ${groups.length} items successfully.`,
    });

    // Move to shipping step
    setTimeout(() => {
      setCurrentStep('shipping');
    }, 1000);
  };

  return {
    processAllGroupsWithAI
  };
};
