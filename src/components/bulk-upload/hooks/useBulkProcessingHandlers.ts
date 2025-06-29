
import { useToast } from '@/hooks/use-toast';
import type { PhotoGroup } from '../BulkUploadManager';
import { generateShippingOptions } from '../utils/shippingCalculator';
import { generateRealisticListingData } from '../utils/aiSimulation';

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

      // Generate realistic AI analysis results
      const mockListingData = generateRealisticListingData(group.name, group.photos.length);

      // Generate shipping options based on weight
      const shippingOptions = generateShippingOptions(mockListingData.measurements.weight);

      // Update group with AI results - ensure proper typing
      setPhotoGroups(prev => prev.map(g => 
        g.id === group.id 
          ? { 
              ...g, 
              status: 'completed' as const,
              listingData: {
                ...mockListingData,
                gender: mockListingData.gender as 'Men' | 'Women' | 'Kids' | 'Unisex'
              },
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
