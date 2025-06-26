
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
  return (
    <TableCell className="text-sm">
      {measurements ? (
        <div className="space-y-1">
          {measurements.length && <div>L: {measurements.length}</div>}
          {measurements.width && <div>W: {measurements.width}</div>}
          {measurements.height && <div>H: {measurements.height}</div>}
          {measurements.weight && <div>Wt: {measurements.weight}</div>}
        </div>
      ) : '-'}
    </TableCell>
  );
};

export default MeasurementsCell;
