
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FallbackDataNoticeProps {
  onRetryPrimary: () => void;
}

const FallbackDataNotice = ({ onRetryPrimary }: FallbackDataNoticeProps) => {
  return (
    <Card className="p-4 border-blue-200 bg-blue-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-blue-800 font-medium">Using Diagnostic Data</div>
          <div className="text-blue-700 text-sm">Switched to fallback data source due to loading issues</div>
        </div>
        <Button onClick={onRetryPrimary} variant="outline" size="sm">
          Try Primary Again
        </Button>
      </div>
    </Card>
  );
};

export default FallbackDataNotice;
