/**
 * Custom hook for managing interval-based API refreshes
 */
import { useEffect, useRef, useCallback } from 'react';
import intervalService from '../services/intervalService';

/**
 * Hook for automatic API refresh based on interval
 * @param {string} interval - Interval string (e.g., '1m', '5m', '1h')
 * @param {Function} refreshFunction - Function to call on each interval
 * @param {Array} dependencies - Dependencies that should trigger interval restart
 * @param {string} key - Unique key for this interval (optional)
 */
export const useIntervalRefresh = (interval, refreshFunction, dependencies = [], key = null) => {
  const intervalKey = useRef(key || `interval-${Date.now()}-${Math.random()}`);
  const refreshRef = useRef(refreshFunction);

  // Update ref when refreshFunction changes
  useEffect(() => {
    refreshRef.current = refreshFunction;
  }, [refreshFunction]);

  // Create stable callback
  const stableRefresh = useCallback(() => {
    if (refreshRef.current) {
      refreshRef.current();
    }
  }, []);

  // Start/update interval when dependencies change
  useEffect(() => {
    if (!interval) return;

    // Start the interval
    intervalService.start(intervalKey.current, interval, stableRefresh);

    // Cleanup on unmount or dependency change
    return () => {
      intervalService.stop(intervalKey.current);
    };
  }, [interval, stableRefresh, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intervalService.stop(intervalKey.current);
    };
  }, []);
};

/**
 * Hook for managing multiple interval-based refreshes
 * @param {Array} refreshConfigs - Array of refresh configurations
 */
export const useMultipleIntervalRefresh = (refreshConfigs) => {
  useEffect(() => {
    // Start all intervals
    refreshConfigs.forEach((config, index) => {
      const { interval, refreshFunction, key } = config;
      if (interval && refreshFunction) {
        const intervalKey = key || `multi-interval-${index}`;
        intervalService.start(intervalKey, interval, refreshFunction);
      }
    });

    // Cleanup all intervals
    return () => {
      refreshConfigs.forEach((config, index) => {
        const intervalKey = config.key || `multi-interval-${index}`;
        intervalService.stop(intervalKey);
      });
    };
  }, [refreshConfigs]);
};

export default useIntervalRefresh;
