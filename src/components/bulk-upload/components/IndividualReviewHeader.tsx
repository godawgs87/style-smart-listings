
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface IndividualReviewHeaderProps {
  currentIndex: number;
  totalItems: number;
  itemName: string;
  onBack: () => void;
  onSkip: () => void;
}

const IndividualReviewHeader = ({
  currentIndex,
  totalItems,
  itemName,
  onBack,
  onSkip
}: IndividualReviewHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button variant="outline" onClick={onBack} size="sm">
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">Back</span>
      </Button>
      <div className="text-center flex-1">
        <span className="text-xs text-gray-600 block">
          ({currentIndex + 1} of {totalItems})
        </span>
        <h1 className="text-lg md:text-xl font-bold truncate">{itemName}</h1>
      </div>
      <Button 
        variant="outline" 
        onClick={onSkip}
        size="sm"
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline">Skip</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default IndividualReviewHeader;
