
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Database, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useDatabaseHealth } from '@/hooks/useDatabaseHealth';

const DatabaseHealthIndicator = () => {
  const { health } = useDatabaseHealth();

  const getStatusColor = () => {
    if (!health.lastChecked) return 'bg-gray-100 text-gray-800';
    if (health.errorCount > 3) return 'bg-red-100 text-red-800';
    if (health.errorCount > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusIcon = () => {
    if (!health.lastChecked) return <Clock className="w-3 h-3" />;
    if (health.errorCount > 3) return <AlertCircle className="w-3 h-3" />;
    if (health.errorCount > 0) return <Database className="w-3 h-3" />;
    return <CheckCircle className="w-3 h-3" />;
  };

  const getStatusText = () => {
    if (!health.lastChecked) return 'Checking...';
    if (health.errorCount > 3) return 'DB Issues';
    if (health.errorCount > 0) return 'Slow DB';
    return 'DB Healthy';
  };

  return (
    <Badge className={`${getStatusColor()} text-xs flex items-center gap-1`}>
      {getStatusIcon()}
      {getStatusText()}
      {health.responseTime && (
        <span className="text-xs ml-1">({health.responseTime}ms)</span>
      )}
    </Badge>
  );
};

export default DatabaseHealthIndicator;
