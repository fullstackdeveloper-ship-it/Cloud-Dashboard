// Custom hook for managing Power Mix data
import { useState, useEffect, useCallback } from 'react';
import powerMixService from '../services/powerMixService';
import { useDateRange } from './redux';

const usePowerMixData = (customControllerId = null, customTimeRange = null) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);

  // Get global date range context
  const { getControllerId, getApiTimeRange, selectedInterval, startIntervalRefresh, stopIntervalRefresh } = useDateRange();
  
  // Use custom values if provided, otherwise use global context
  const effectiveControllerId = customControllerId || getControllerId();
  const effectiveTimeRange = customTimeRange || getApiTimeRange();

  const fetchData = useCallback(async (customTimeRange = null) => {
    if (!effectiveControllerId) {
      setError('Controller ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const timeRangeToUse = customTimeRange || effectiveTimeRange;
      
      console.log('🔄 Fetching Power Mix data...', {
        controllerId: effectiveControllerId,
        timeRange: timeRangeToUse
      });

      const result = await powerMixService.getPowerMixData({
        controllerId: effectiveControllerId,
        start: timeRangeToUse.start,
        stop: timeRangeToUse.stop
      });

      setData(result.data);
      setMetadata(result.metadata);
      
      console.log('✅ Power Mix data loaded successfully', {
        dataPoints: result.data.length,
        metadata: result.metadata
      });
    } catch (err) {
      console.error('❌ Failed to fetch Power Mix data:', err);
      setError(err.message);
      setData([]);
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveControllerId, effectiveTimeRange]);

  // Load data when dependencies change
  useEffect(() => {
    fetchData();
  }, [effectiveControllerId, effectiveTimeRange.start, effectiveTimeRange.stop]);

  // Interval-based refresh management
  useEffect(() => {
    if (!effectiveControllerId) return;

    const intervalKey = `power-mix-${effectiveControllerId}`;
    
    // Start interval refresh
    startIntervalRefresh(intervalKey, () => {
      console.log(`🔄 Interval refresh triggered for Power Mix (${selectedInterval})`);
      fetchData();
    });

    // Cleanup on unmount or dependency change
    return () => {
      stopIntervalRefresh(intervalKey);
    };
  }, [effectiveControllerId, selectedInterval, startIntervalRefresh, stopIntervalRefresh, fetchData]);

  // Refresh data function
  const refreshData = useCallback((customTimeRange = null) => {
    fetchData(customTimeRange);
  }, [fetchData]);

  // Quick refresh functions for common time ranges
  const refreshLast24Hours = useCallback(() => {
    refreshData(powerMixService.getDefaultTimeRange());
  }, [refreshData]);

  const refreshLastWeek = useCallback(() => {
    refreshData(powerMixService.getLastWeekTimeRange());
  }, [refreshData]);

  const refreshLastMonth = useCallback(() => {
    refreshData(powerMixService.getLastMonthTimeRange());
  }, [refreshData]);

  return {
    data,
    isLoading,
    error,
    metadata,
    refreshData,
    refreshLast24Hours,
    refreshLastWeek,
    refreshLastMonth
  };
};

export default usePowerMixData;
