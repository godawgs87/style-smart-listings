
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
    console.log('🎯 Starting enhanced AI processing for', groups.length, 'groups');
    
    // Process each group with better AI analysis
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

      // Use the enhanced AI simulation with actual group data
      const smartListingData = generateRealisticListingData(
        group.name || `Item Set ${i + 1}`, 
        group.photos.length
      );

      console.log('💡 Generated enhanced listing data:', smartListingData);

      // Generate shipping options including local pickup
      const shippingOptions = generateShippingOptions(
        parseFloat(smartListingData.measurements?.weight || '1')
      );

      // Update group with enhanced AI-generated data
      setPhotoGroups(prev => prev.map(g => 
        g.id === group.id 
          ? { 
              ...g, 
              status: 'completed' as const,
              listingData: smartListingData,
              shippingOptions: shippingOptions,
              aiSuggestion: `AI analyzed ${group.photos.length} photos and suggested: ${smartListingData.category}`
            }
          : g
      ));
    }

    // Set processing results
    const results = groups.map(g => ({ id: g.id, status: 'completed' }));
    setProcessingResults(results);

    toast({
      title: "Enhanced Processing Complete!",
      description: `Generated smart listings for ${groups.length} items with AI analysis. Review and customize before posting.`,
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
