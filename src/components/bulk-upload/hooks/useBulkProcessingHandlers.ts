
import { usePhotoAnalysis } from '@/hooks/usePhotoAnalysis';
import { generateShippingOptions } from '../utils/shippingCalculator';
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkProcessingHandlers = (
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void,
  setProcessingResults: (results: any[]) => void,
  setCurrentStep: (step: StepType) => void
) => {
  const { analyzePhotos } = usePhotoAnalysis();

  const processAllGroupsWithAI = async (groups: PhotoGroup[]) => {
    const results: any[] = [];
    
    for (const group of groups) {
      setPhotoGroups(prev => prev.map(g => 
        g.id === group.id ? { ...g, status: 'processing', aiSuggestion: 'Analyzing with AI...' } : g
      ));
      
      try {
        console.log(`Analyzing group ${group.id} with ${group.photos.length} photos`);
        
        // Use real AI analysis for each group
        const listingData = await analyzePhotos(group.photos);
        
        if (listingData) {
          // Get weight as string for shipping calculation
          const weightValue = listingData.measurements?.weight || '1lb';
          const weightString = typeof weightValue === 'string' ? weightValue : `${weightValue}lb`;
          
          const shippingOptions = generateShippingOptions(weightString);
          
          const result = {
            groupId: group.id,
            title: listingData.title || group.name,
            status: 'completed',
            listingData,
            shippingOptions
          };
          
          results.push(result);
          
          setPhotoGroups(prev => prev.map(g => 
            g.id === group.id ? { 
              ...g, 
              status: 'completed',
              name: listingData.title || group.name,
              listingData,
              shippingOptions,
              aiSuggestion: `✅ AI Analysis Complete: ${listingData.title}`
            } : g
          ));
        } else {
          // Handle analysis failure
          setPhotoGroups(prev => prev.map(g => 
            g.id === group.id ? { 
              ...g, 
              status: 'error',
              aiSuggestion: '❌ AI Analysis Failed'
            } : g
          ));
        }
        
      } catch (error) {
        console.error(`Analysis failed for group ${group.id}:`, error);
        setPhotoGroups(prev => prev.map(g => 
          g.id === group.id ? { 
            ...g, 
            status: 'error',
            aiSuggestion: '❌ Analysis Error'
          } : g
        ));
      }
    }
    
    setProcessingResults(results);
    setTimeout(() => setCurrentStep('review'), 1000);
  };

  return {
    processAllGroupsWithAI
  };
};
