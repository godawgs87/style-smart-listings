import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Grid3X3, CheckCircle, AlertTriangle, XCircle, Loader2, Truck, BarChart } from 'lucide-react';
import BulkPhotoUpload from './BulkPhotoUpload';
import PhotoGroupingInterface from './PhotoGroupingInterface';
import BulkProcessingStatus from './BulkProcessingStatus';
import BulkShippingReview from './BulkShippingReview';
import BulkReviewDashboard from './BulkReviewDashboard';
import IndividualItemReview from './IndividualItemReview';

export interface PhotoGroup {
  id: string;
  photos: File[];
  name: string;
  confidence: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'error';
  aiSuggestion?: string;
  listingData?: any;
  shippingOptions?: any[];
  selectedShipping?: any;
}

interface BulkUploadManagerProps {
  onComplete: (results: any[]) => void;
  onBack: () => void;
}

const BulkUploadManager = ({ onComplete, onBack }: BulkUploadManagerProps) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review'>('upload');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([]);
  const [isGrouping, setIsGrouping] = useState(false);
  const [processingResults, setProcessingResults] = useState<any[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const handlePhotosUploaded = (uploadedPhotos: File[]) => {
    setPhotos(uploadedPhotos);
  };

  const handleStartGrouping = async () => {
    if (photos.length === 0) return;
    
    setIsGrouping(true);
    setCurrentStep('grouping');
    
    try {
      const groups = await simulateAIGrouping(photos);
      setPhotoGroups(groups);
    } catch (error) {
      console.error('Grouping failed:', error);
    } finally {
      setIsGrouping(false);
    }
  };

  const simulateAIGrouping = async (photos: File[]): Promise<PhotoGroup[]> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
      setPhotoGroups(prev => prev.map(g => 
        g.id === group.id ? { ...g, status: 'processing' } : g
      ));
      
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const listingData = {
          title: group.name,
          category: 'Clothing',
          condition: 'Used',
          price: Math.floor(Math.random() * 50) + 10,
          photos: group.photos.map(photo => URL.createObjectURL(photo)),
          measurements: {
            weight: Math.random() > 0.5 ? '6oz' : '1.2lb',
            length: Math.floor(Math.random() * 10) + 20 + '"',
            width: Math.floor(Math.random() * 8) + 15 + '"'
          }
        };

        const weight = listingData.measurements.weight;
        const shippingOptions = generateShippingOptions(weight);
        
        const result = {
          groupId: group.id,
          title: group.name,
          status: 'completed',
          listingData,
          shippingOptions
        };
        
        results.push(result);
        
        setPhotoGroups(prev => prev.map(g => 
          g.id === group.id ? { 
            ...g, 
            status: 'completed',
            listingData,
            shippingOptions
          } : g
        ));
        
      } catch (error) {
        setPhotoGroups(prev => prev.map(g => 
          g.id === group.id ? { ...g, status: 'error' } : g
        ));
      }
    }
    
    setProcessingResults(results);
    setTimeout(() => setCurrentStep('review'), 1000);
  };

  const generateShippingOptions = (weight: string) => {
    const isLight = weight.includes('oz') || parseFloat(weight) < 1;
    
    if (isLight) {
      return [
        {
          id: 'first-class',
          name: 'USPS First Class',
          cost: 4.50,
          days: '1-3 business days',
          recommended: true,
          packaging: 'Padded envelope'
        },
        {
          id: 'priority',
          name: 'USPS Priority',
          cost: 8.95,
          days: '1-2 business days',
          recommended: false,
          packaging: 'Small box'
        }
      ];
    } else {
      return [
        {
          id: 'priority',
          name: 'USPS Priority',
          cost: 8.95,
          days: '1-2 business days',
          recommended: true,
          packaging: 'Small box'
        },
        {
          id: 'ups-ground',
          name: 'UPS Ground',
          cost: 7.25,
          days: '2-5 business days',
          recommended: false,
          packaging: 'Small box'
        }
      ];
    }
  };

  // New review dashboard handlers
  const handleEditItem = (groupId: string) => {
    const groupIndex = photoGroups.findIndex(g => g.id === groupId);
    setCurrentReviewIndex(groupIndex);
    setCurrentStep('individual-review');
  };

  const handlePreviewItem = (groupId: string) => {
    console.log('Preview item:', groupId);
    // Implement preview functionality
  };

  const handlePostItem = (groupId: string) => {
    console.log('Post item:', groupId);
    // Implement individual posting
  };

  const handlePostAll = () => {
    const readyItems = photoGroups.filter(g => g.status === 'completed' && g.selectedShipping);
    console.log('Posting all ready items:', readyItems);
    onComplete(readyItems);
  };

  const handleReviewAll = () => {
    setCurrentReviewIndex(0);
    setCurrentStep('individual-review');
  };

  const handleSaveDraft = () => {
    console.log('Saving draft...');
    // Implement draft saving
  };

  // Individual review handlers
  const handleIndividualReviewNext = () => {
    if (currentReviewIndex < photoGroups.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    } else {
      setCurrentStep('review');
    }
  };

  const handleIndividualReviewBack = () => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex(currentReviewIndex - 1);
    } else {
      setCurrentStep('review');
    }
  };

  const handleIndividualReviewSkip = () => {
    handleIndividualReviewNext();
  };

  const handleIndividualReviewApprove = (updatedGroup: PhotoGroup) => {
    setPhotoGroups(prev => prev.map(g => 
      g.id === updatedGroup.id ? updatedGroup : g
    ));
    handleIndividualReviewNext();
  };

  const handleIndividualReviewReject = () => {
    setPhotoGroups(prev => prev.map(g => 
      g.id === photoGroups[currentReviewIndex].id ? { ...g, status: 'error' } : g
    ));
    handleIndividualReviewNext();
  };

  const handleIndividualSaveDraft = (updatedGroup: PhotoGroup) => {
    setPhotoGroups(prev => prev.map(g => 
      g.id === updatedGroup.id ? updatedGroup : g
    ));
  };

  const handleShippingComplete = (groupsWithShipping: PhotoGroup[]) => {
    setPhotoGroups(groupsWithShipping);
    setCurrentStep('review');
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'upload': return Upload;
      case 'grouping': return Grid3X3;
      case 'processing': return CheckCircle;
      case 'shipping': return Truck;
      case 'review': return BarChart;
      default: return Upload;
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'upload', label: 'Upload Photos', completed: photos.length > 0 },
      { key: 'grouping', label: 'Group Items', completed: photoGroups.length > 0 },
      { key: 'processing', label: 'Process Groups', completed: processingResults.length > 0 },
      { key: 'review', label: 'Review & Post', completed: photoGroups.every(g => g.selectedShipping) }
    ];

    return (
      <div className="flex items-center justify-center space-x-4 mb-8 overflow-x-auto">
        {steps.map((step, index) => {
          const Icon = getStepIcon(step.key);
          const isActive = currentStep === step.key || (currentStep === 'individual-review' && step.key === 'review');
          const isCompleted = step.completed;
          
          return (
            <div key={step.key} className="flex items-center flex-shrink-0">
              <div className={`flex items-center space-x-2 ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  isActive ? 'bg-blue-100 border-2 border-blue-600' : 
                  isCompleted ? 'bg-green-100 border-2 border-green-600' : 
                  'bg-gray-100 border-2 border-gray-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
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
          onComplete={() => setCurrentStep('review')}
          onBack={() => setCurrentStep('grouping')}
        />
      )}

      {currentStep === 'shipping' && (
        <BulkShippingReview
          photoGroups={photoGroups}
          onComplete={handleShippingComplete}
          onBack={() => setCurrentStep('processing')}
        />
      )}

      {currentStep === 'review' && (
        <BulkReviewDashboard
          photoGroups={photoGroups}
          onEditItem={handleEditItem}
          onPreviewItem={handlePreviewItem}
          onPostItem={handlePostItem}
          onPostAll={handlePostAll}
          onReviewAll={handleReviewAll}
          onSaveDraft={handleSaveDraft}
        />
      )}

      {currentStep === 'individual-review' && photoGroups[currentReviewIndex] && (
        <IndividualItemReview
          group={photoGroups[currentReviewIndex]}
          currentIndex={currentReviewIndex}
          totalItems={photoGroups.length}
          onBack={handleIndividualReviewBack}
          onNext={handleIndividualReviewNext}
          onSkip={handleIndividualReviewSkip}
          onApprove={handleIndividualReviewApprove}
          onReject={handleIndividualReviewReject}
          onSaveDraft={handleIndividualSaveDraft}
        />
      )}
    </div>
  );
};

export default BulkUploadManager;
