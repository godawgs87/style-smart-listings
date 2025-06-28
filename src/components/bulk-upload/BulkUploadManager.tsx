
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Grid3X3, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import BulkPhotoUpload from './BulkPhotoUpload';
import PhotoGroupingInterface from './PhotoGroupingInterface';
import BulkProcessingStatus from './BulkProcessingStatus';

export interface PhotoGroup {
  id: string;
  photos: File[];
  name: string;
  confidence: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'error';
  aiSuggestion?: string;
}

interface BulkUploadManagerProps {
  onComplete: (results: any[]) => void;
  onBack: () => void;
}

const BulkUploadManager = ({ onComplete, onBack }: BulkUploadManagerProps) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'grouping' | 'processing'>('upload');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([]);
  const [isGrouping, setIsGrouping] = useState(false);
  const [processingResults, setProcessingResults] = useState<any[]>([]);

  const handlePhotosUploaded = (uploadedPhotos: File[]) => {
    setPhotos(uploadedPhotos);
  };

  const handleStartGrouping = async () => {
    if (photos.length === 0) return;
    
    setIsGrouping(true);
    setCurrentStep('grouping');
    
    try {
      // Simulate AI grouping logic
      const groups = await simulateAIGrouping(photos);
      setPhotoGroups(groups);
    } catch (error) {
      console.error('Grouping failed:', error);
    } finally {
      setIsGrouping(false);
    }
  };

  const simulateAIGrouping = async (photos: File[]): Promise<PhotoGroup[]> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create mock groups based on photo count
    const groups: PhotoGroup[] = [];
    let currentIndex = 0;
    
    while (currentIndex < photos.length) {
      const groupSize = Math.min(3 + Math.floor(Math.random() * 3), photos.length - currentIndex);
      const groupPhotos = photos.slice(currentIndex, currentIndex + groupSize);
      
      groups.push({
        id: `group-${groups.length + 1}`,
        photos: groupPhotos,
        name: `Item ${groups.length + 1}`,
        confidence: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        status: 'pending',
        aiSuggestion: getRandomItemSuggestion()
      });
      
      currentIndex += groupSize;
    }
    
    return groups;
  };

  const getRandomItemSuggestion = () => {
    const suggestions = [
      'Vintage T-Shirt',
      'Blue Denim Jeans',
      'Nike Sneakers',
      'Leather Jacket',
      'Cotton Dress',
      'Baseball Cap',
      'Winter Coat',
      'Running Shoes'
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const handleGroupsConfirmed = (confirmedGroups: PhotoGroup[]) => {
    setPhotoGroups(confirmedGroups);
    setCurrentStep('processing');
    processAllGroups(confirmedGroups);
  };

  const processAllGroups = async (groups: PhotoGroup[]) => {
    const results: any[] = [];
    
    for (const group of groups) {
      // Update group status
      setPhotoGroups(prev => prev.map(g => 
        g.id === group.id ? { ...g, status: 'processing' } : g
      ));
      
      try {
        // Simulate processing each group
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const result = {
          groupId: group.id,
          title: group.name,
          status: 'completed',
          listingData: {
            title: group.name,
            category: 'Clothing',
            condition: 'Used',
            price: Math.floor(Math.random() * 50) + 10,
            photos: group.photos.map(photo => URL.createObjectURL(photo))
          }
        };
        
        results.push(result);
        
        // Update group status to completed
        setPhotoGroups(prev => prev.map(g => 
          g.id === group.id ? { ...g, status: 'completed' } : g
        ));
        
      } catch (error) {
        // Update group status to error
        setPhotoGroups(prev => prev.map(g => 
          g.id === group.id ? { ...g, status: 'error' } : g
        ));
      }
    }
    
    setProcessingResults(results);
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'upload': return Upload;
      case 'grouping': return Grid3X3;
      case 'processing': return CheckCircle;
      default: return Upload;
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'upload', label: 'Upload Photos', completed: photos.length > 0 },
      { key: 'grouping', label: 'Group Items', completed: photoGroups.length > 0 },
      { key: 'processing', label: 'Process Groups', completed: processingResults.length > 0 }
    ];

    return (
      <div className="flex items-center justify-center space-x-8 mb-8">
        {steps.map((step, index) => {
          const Icon = getStepIcon(step.key);
          const isActive = currentStep === step.key;
          const isCompleted = step.completed;
          
          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center space-x-2 ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-blue-100 border-2 border-blue-600' : 
                  isCompleted ? 'bg-green-100 border-2 border-green-600' : 
                  'bg-gray-100 border-2 border-gray-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Bulk Upload Manager</h1>
        <p className="text-gray-600">Upload multiple items at once for efficient listing creation</p>
      </div>

      {renderStepIndicator()}

      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BulkPhotoUpload
              onPhotosUploaded={handlePhotosUploaded}
              maxPhotos={100}
            />
            {photos.length > 0 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {photos.length} photos uploaded
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={onBack}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleStartGrouping}
                    disabled={isGrouping}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGrouping ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Grouping...
                      </>
                    ) : (
                      'Start AI Grouping'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 'grouping' && (
        <PhotoGroupingInterface
          photoGroups={photoGroups}
          onGroupsConfirmed={handleGroupsConfirmed}
          onBack={() => setCurrentStep('upload')}
        />
      )}

      {currentStep === 'processing' && (
        <BulkProcessingStatus
          photoGroups={photoGroups}
          results={processingResults}
          onComplete={() => onComplete(processingResults)}
          onBack={() => setCurrentStep('grouping')}
        />
      )}
    </div>
  );
};

export default BulkUploadManager;
