
import React from 'react';
import { TableCell } from '@/components/ui/table';

interface MeasurementData {
  length?: string;
  width?: string;
  height?: string;
  weight?: string;
}

interface MeasurementsCellProps {
  measurements: MeasurementData | null;
}

const MeasurementsCell = ({ measurements }: MeasurementsCellProps) => {
  // Handle the case where measurements might be wrapped in a TableCell already
  const content = measurements ? (
    <div className="space-y-1">
      {measurements.length && <div>L: {measurements.length}</div>}
      {measurements.width && <div>W: {measurements.width}</div>}
      {measurements.height && <div>H: {measurements.height}</div>}
      {measurements.weight && <div>Wt: {measurements.weight}</div>}
    </div>
  ) : (
    '-'
  );

  return content;
};

export default MeasurementsCell;
