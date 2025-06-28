
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              📊 Bulk Review Dashboard - {photoGroups.length} Items Ready
            </span>
            <div className="flex items-center gap-4 text-sm">
              <Badge className="bg-green-100 text-green-800">
                ✅ {readyToPost.length} Ready to Post
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800">
                ⚠️ {needsReview.length} Need Review
              </Badge>
              <Badge className="bg-red-100 text-red-800">
                ❌ {hasIssues.length} Issues
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button 
              onClick={onPostAll}
              disabled={readyToPost.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              Post All Ready Items ({readyToPost.length})
            </Button>
            <Button variant="outline" onClick={onReviewAll}>
              Review All
            </Button>
            <Button variant="outline" onClick={onSaveDraft}>
              Save Draft
            </Button>
          </div>

          <div className="space-y-4">
            {photoGroups.map((group) => (
              <Card key={group.id} className="border-l-4 border-l-gray-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        <Badge className={getItemStatusColor(group)}>
                          {getItemStatusIcon(group)}
                          <span className="ml-1">{getItemStatusText(group)}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${group.listingData?.price || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {getWeightDisplay(group)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          {getShippingDisplay(group)}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-2">
                        "{group.listingData?.title || group.aiSuggestion}"
                      </p>

                      {group.listingData?.measurements && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {group.listingData.measurements.length && (
                            <span>📏 Length: {group.listingData.measurements.length}</span>
                          )}
                          {group.listingData.measurements.width && (
                            <span>Width: {group.listingData.measurements.width}</span>
                          )}
                          {group.selectedShipping?.packaging && (
                            <span>📮 {group.selectedShipping.packaging}</span>
                          )}
                        </div>
                      )}

                      {!group.selectedShipping && group.shippingOptions && group.shippingOptions.length > 1 && (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            ⚠️ Multiple shipping options available
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditItem(group.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPreviewItem(group.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onPostItem(group.id)}
                        disabled={!group.selectedShipping}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Smartphone className="w-4 h-4 mr-1" />
                        Post Now
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
