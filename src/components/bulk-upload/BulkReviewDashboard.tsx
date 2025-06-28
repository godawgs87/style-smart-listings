
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Edit, Eye, Smartphone, Package, DollarSign, Truck } from 'lucide-react';
import type { PhotoGroup } from './BulkUploadManager';

interface BulkReviewDashboardProps {
  photoGroups: PhotoGroup[];
  onEditItem: (groupId: string) => void;
  onPreviewItem: (groupId: string) => void;
  onPostItem: (groupId: string) => void;
  onPostAll: () => void;
  onReviewAll: () => void;
  onSaveDraft: () => void;
}

const BulkReviewDashboard = ({
  photoGroups,
  onEditItem,
  onPreviewItem,
  onPostItem,
  onPostAll,
  onReviewAll,
  onSaveDraft
}: BulkReviewDashboardProps) => {
  const readyToPost = photoGroups.filter(group => 
    group.status === 'completed' && group.selectedShipping
  );
  const needsReview = photoGroups.filter(group => 
    group.status === 'completed' && !group.selectedShipping
  );
  const hasIssues = photoGroups.filter(group => group.status === 'error');

  const handleEditItem = (groupId: string) => {
    console.log('🔧 Edit item clicked:', groupId);
    onEditItem(groupId);
  };

  const handlePreviewItem = (groupId: string) => {
    console.log('👁️ Preview item clicked:', groupId);
    onPreviewItem(groupId);
  };

  const handlePostItem = (groupId: string) => {
    console.log('📤 Post item clicked:', groupId);
    onPostItem(groupId);
  };

  const handlePostAll = () => {
    console.log('📤📤 Post all clicked, ready items:', readyToPost.length);
    onPostAll();
  };

  const handleReviewAll = () => {
    console.log('👁️👁️ Review all clicked');
    onReviewAll();
  };

  const handleSaveDraft = () => {
    console.log('💾 Save draft clicked');
    onSaveDraft();
  };

  const getItemStatusIcon = (group: PhotoGroup) => {
    if (group.status === 'error') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (group.status === 'completed' && group.selectedShipping) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  const getItemStatusText = (group: PhotoGroup) => {
    if (group.status === 'error') return 'Error';
    if (group.status === 'completed' && group.selectedShipping) return 'Ready';
    return 'Needs Review';
  };

  const getItemStatusColor = (group: PhotoGroup) => {
    if (group.status === 'error') return 'bg-red-100 text-red-800';
    if (group.status === 'completed' && group.selectedShipping) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getWeightDisplay = (group: PhotoGroup) => {
    const weight = group.listingData?.measurements?.weight;
    if (!weight) return 'Unknown';
    return weight;
  };

  const getShippingDisplay = (group: PhotoGroup) => {
    if (!group.selectedShipping) {
      return group.shippingOptions && group.shippingOptions.length > 1 
        ? 'Choose shipping method' 
        : 'Set shipping';
    }
    return `$${group.selectedShipping.cost} ${group.selectedShipping.name}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-lg md:text-xl">
              📊 Review Dashboard - {photoGroups.length} Items
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
              <Badge className="bg-green-100 text-green-800">
                ✅ {readyToPost.length} Ready
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800">
                ⚠️ {needsReview.length} Review
              </Badge>
              <Badge className="bg-red-100 text-red-800">
                ❌ {hasIssues.length} Issues
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-col sm:flex-row gap-2 mb-4 md:mb-6">
            <Button 
              onClick={handlePostAll}
              disabled={readyToPost.length === 0}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              Post All Ready ({readyToPost.length})
            </Button>
            <Button variant="outline" onClick={handleReviewAll} className="w-full sm:w-auto">
              Review All
            </Button>
            <Button variant="outline" onClick={handleSaveDraft} className="w-full sm:w-auto">
              Save Draft
            </Button>
          </div>

          <div className="space-y-3 md:space-y-4">
            {photoGroups.map((group) => (
              <Card key={group.id} className="border-l-4 border-l-gray-300">
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-3">
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base md:text-lg truncate">{group.name}</h3>
                        <Badge className={getItemStatusColor(group)}>
                          {getItemStatusIcon(group)}
                          <span className="ml-1">{getItemStatusText(group)}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 md:w-4 md:h-4" />
                          ${group.listingData?.price || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3 md:w-4 md:h-4" />
                          {getWeightDisplay(group)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="truncate max-w-[150px]">{getShippingDisplay(group)}</span>
                        </span>
                      </div>

                      <p className="text-gray-700 mb-2 text-sm md:text-base line-clamp-2">
                        "{group.listingData?.title || group.aiSuggestion}"
                      </p>

                      {group.listingData?.measurements && (
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-gray-500">
                          {group.listingData.measurements.length && (
                            <span>📏 {group.listingData.measurements.length}</span>
                          )}
                          {group.listingData.measurements.width && (
                            <span>W: {group.listingData.measurements.width}</span>
                          )}
                          {group.selectedShipping?.packaging && (
                            <span>📮 {group.selectedShipping.packaging}</span>
                          )}
                        </div>
                      )}

                      {!group.selectedShipping && group.shippingOptions && group.shippingOptions.length > 1 && (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-xs">
                            ⚠️ Multiple shipping options available
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditItem(group.id)}
                        className="flex-1 lg:flex-none"
                      >
                        <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewItem(group.id)}
                        className="flex-1 lg:flex-none"
                      >
                        <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        <span className="hidden sm:inline">Preview</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePostItem(group.id)}
                        disabled={!group.selectedShipping}
                        className="bg-blue-600 hover:bg-blue-700 flex-1 lg:flex-none"
                      >
                        <Smartphone className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        <span className="hidden sm:inline">Post</span>
                        <span className="sm:hidden">Post</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkReviewDashboard;
