
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Edit, Eye, Smartphone, Package, DollarSign, Truck } from 'lucide-react';
import type { PhotoGroup } from '../BulkUploadManager';

interface ReviewDashboardItemProps {
  group: PhotoGroup;
  onEditItem: (groupId: string) => void;
  onPreviewItem: (groupId: string) => void;
  onPostItem: (groupId: string) => void;
}

const ReviewDashboardItem = ({
  group,
  onEditItem,
  onPreviewItem,
  onPostItem
}: ReviewDashboardItemProps) => {
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

  const handleEditItem = () => {
    console.log('🔧 Edit item clicked:', group.id);
    onEditItem(group.id);
  };

  const handlePreviewItem = () => {
    console.log('👁️ Preview item clicked:', group.id);
    onPreviewItem(group.id);
  };

  const handlePostItem = () => {
    console.log('📤 Post item clicked:', group.id);
    onPostItem(group.id);
  };

  return (
    <Card className="border-l-4 border-l-gray-300">
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
              onClick={handleEditItem}
              className="flex-1 lg:flex-none"
            >
              <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviewItem}
              className="flex-1 lg:flex-none"
            >
              <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button
              size="sm"
              onClick={handlePostItem}
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
  );
};

export default ReviewDashboardItem;
