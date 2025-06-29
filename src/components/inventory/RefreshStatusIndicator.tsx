
import React from 'react';
import { Card } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

const RefreshStatusIndicator = () => {
  return (
    <Card className="p-4 border-blue-200 bg-blue-50">
      <div className="flex items-center justify-center">
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        <span className="text-blue-800">Refreshing inventory...</span>
      </div>
    </Card>
  );
};

export default RefreshStatusIndicator;
