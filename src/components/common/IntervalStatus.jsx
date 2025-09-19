/**
 * Interval Status Component - Shows current interval status
 */
import React from 'react';
import { useDateRange } from '../../contexts/DateRangeContext';
import { Clock, RefreshCw } from 'lucide-react';

const IntervalStatus = () => {
  const { selectedInterval } = useDateRange();

  const getIntervalLabel = (interval) => {
    const labels = {
      '5s': '5 Seconds',
      '1m': '1 Minute',
      '5m': '5 Minutes', 
      '15m': '15 Minutes',
      '30m': '30 Minutes',
      '1h': '1 Hour',
      '6h': '6 Hours',
      '1d': '1 Day'
    };
    return labels[interval] || interval;
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Clock className="w-4 h-4" />
      <span>Auto-refresh: {getIntervalLabel(selectedInterval)}</span>
      <RefreshCw className="w-4 h-4 animate-spin" />
    </div>
  );
};

export default IntervalStatus;
