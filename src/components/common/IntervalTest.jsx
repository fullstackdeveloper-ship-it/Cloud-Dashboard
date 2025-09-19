/**
 * Interval Test Component - Simple test to verify interval service works
 */
import React, { useState, useEffect } from 'react';
import { useDateRange } from '../../contexts/DateRangeContext';

const IntervalTest = () => {
  const [count, setCount] = useState(0);
  const { selectedInterval, startIntervalRefresh, stopIntervalRefresh } = useDateRange();

  useEffect(() => {
    const intervalKey = 'test-interval';
    
    // Start test interval
    startIntervalRefresh(intervalKey, () => {
      setCount(prev => prev + 1);
      console.log(`🔄 Test interval triggered! Count: ${count + 1}`);
    });

    // Cleanup
    return () => {
      stopIntervalRefresh(intervalKey);
    };
  }, [selectedInterval, startIntervalRefresh, stopIntervalRefresh]);

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3 className="font-semibold text-blue-800">Interval Test</h3>
      <p className="text-sm text-blue-600">
        Current interval: <strong>{selectedInterval}</strong>
      </p>
      <p className="text-sm text-blue-600">
        Refresh count: <strong>{count}</strong>
      </p>
    </div>
  );
};

export default IntervalTest;
