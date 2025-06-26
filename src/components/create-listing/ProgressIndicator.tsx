
import React from 'react';
import { Check } from 'lucide-react';
import { Step } from '@/types/CreateListing';

interface ProgressIndicatorProps {
  currentStep: Step;
}

const ProgressIndicator = ({ currentStep }: ProgressIndicatorProps) => {
  const steps = [
    { key: 'photos', label: 'Upload Photos' },
    { key: 'preview', label: 'Review & Edit' },
    { key: 'shipping', label: 'Configure Shipping' },
    { key: 'published', label: 'Published' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          <div className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${index < currentIndex 
                ? 'bg-green-500 text-white' 
                : index === currentIndex 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-500'
              }
            `}>
              {index < currentIndex ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className={`
              ml-2 text-sm font-medium
              ${index <= currentIndex ? 'text-gray-900' : 'text-gray-500'}
            `}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`
              w-12 h-0.5 mx-4
              ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressIndicator;
