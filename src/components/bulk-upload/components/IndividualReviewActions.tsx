
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Save } from 'lucide-react';
import type { PhotoGroup } from '../BulkUploadManager';

interface IndividualReviewActionsProps {
  editedGroup: PhotoGroup;
  onReject: () => void;
  onSaveDraft: (group: PhotoGroup) => void;
  onApprove: (group: PhotoGroup) => void;
}

const IndividualReviewActions = ({
  editedGroup,
  onReject,
  onSaveDraft,
  onApprove
}: IndividualReviewActionsProps) => {
  const hasRequiredData = () => {
    return editedGroup.listingData?.title && 
           editedGroup.listingData?.price && 
           editedGroup.selectedShipping;
  };

  const handleApprove = () => {
    console.log('✅ IndividualReviewActions - Approving item:', editedGroup);
    onApprove(editedGroup);
  };

  const handleSaveDraft = () => {
    console.log('💾 IndividualReviewActions - Saving draft:', editedGroup);
    onSaveDraft(editedGroup);
  };

  const handleReject = () => {
    console.log('❌ IndividualReviewActions - Rejecting item:', editedGroup);
    onReject();
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-6 pt-4 border-t gap-3">
      <Button 
        variant="destructive" 
        onClick={handleReject}
        className="w-full sm:w-auto"
      >
        <X className="w-4 h-4 mr-2" />
        Reject
      </Button>
      
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button 
          variant="outline" 
          onClick={handleSaveDraft}
          className="w-full sm:w-auto"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
        <Button 
          onClick={handleApprove}
          disabled={!hasRequiredData()}
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Approve & Next</span>
          <span className="sm:hidden">Approve</span>
        </Button>
      </div>
    </div>
  );
};

export default IndividualReviewActions;
