// Unified hook for all KPI data fetching
import { useState, useEffect, useCallback, useRef } from 'react';
import kpiApiService from '../services/kpiApiService.js';
import apiCallManager from '../services/apiCallManager.js';
import { useDateRange } from '../contexts/DateRangeContext.js';

const useKpiData = (controllerId, dataType = 'powerFlow', options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [staleDataCount, setStaleDataCount] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const isFetchingRef = useRef(false);
  const lastFetchParamsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  
  // Get interval management from context
  const { selectedInterval, startIntervalRefresh, stopIntervalRefresh } = useDateRange();

  const {
    autoRefresh = true,
    startTime = null,
    stopTime = null,
    globalRefreshTrigger = null,
    enableIntervalRefresh = true // New option to enable/disable interval refresh
  } = options;

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!controllerId) {
      console.warn('No controller ID provided');
      return;
    }

    // Create a unique key for this fetch request
    const callKey = apiCallManager.generateCallKey(controllerId, dataType, startTime, stopTime, globalRefreshTrigger);
    
    // Prevent duplicate calls unless it's a forced refresh
    if (!forceRefresh && isFetchingRef.current) {
      console.log(`⏸️ Skipping duplicate ${dataType} fetch request (already fetching)`);
      return;
    }

    // Check if we're fetching the same data (only for non-forced refreshes)
    if (!forceRefresh && lastFetchParamsRef.current === callKey) {
      console.log(`⏸️ Skipping duplicate ${dataType} fetch with same parameters`);
      return;
    }

    console.log(`🔄 Starting ${dataType} fetch with key: ${callKey}`);

    isFetchingRef.current = true;
    lastFetchParamsRef.current = callKey;
    setIsLoading(true);
    setError(null);

    try {
      // Define the API function to call
      const apiFunction = async () => {
        switch (dataType) {
          case 'powerFlow':
            return await kpiApiService.fetchPowerFlowData(controllerId);
          case 'powerMix':
            if (!startTime || !stopTime) {
              throw new Error('startTime and stopTime are required for powerMix data');
            }
            return await kpiApiService.fetchPowerMixData(controllerId, startTime, stopTime);
          default:
            throw new Error(`Unknown data type: ${dataType}. Only 'powerFlow' and 'powerMix' are supported.`);
        }
      };

      // Use API call manager to prevent duplicate calls
      const result = await apiCallManager.getOrCreateCall(callKey, apiFunction);
      
      setData(result);
      setIsConnected(result.status === 'live' || result.status === 'online');
      
      // Check for stale data based on updatedAt timestamp
      const currentUpdatedAt = result.updatedAt;
      if (currentUpdatedAt && lastUpdatedAt && currentUpdatedAt === lastUpdatedAt) {
        // Same timestamp as before - data is stale
        const newStaleCount = staleDataCount + 1;
        setStaleDataCount(newStaleCount);
        
        console.log(`⚠️ ${dataType} data is stale (same updatedAt: ${currentUpdatedAt}) - count: ${newStaleCount}`);
        
        // Mark as offline if stale data appears 3+ times
        if (newStaleCount >= 3) {
          setIsOffline(true);
          console.log(`🔴 ${dataType} marked as offline due to stale data (${newStaleCount} times)`);
        }
      } else {
        // New timestamp - data is fresh
        setStaleDataCount(0);
        setIsOffline(false);
        setLastUpdatedAt(currentUpdatedAt);
        console.log(`✅ ${dataType} data is fresh (updatedAt: ${currentUpdatedAt})`);
      }
      
      // Reset failure count on successful fetch
      setConsecutiveFailures(0);
      
      console.log(`✅ ${dataType} data loaded successfully`, result);
    } catch (err) {
      console.error(`❌ Failed to fetch ${dataType} data:`, err);
      setError(err.message);
      
      // Increment consecutive failures
      const newFailureCount = consecutiveFailures + 1;
      setConsecutiveFailures(newFailureCount);
      
      // Reset stale data count on API failure
      setStaleDataCount(0);
      
      // Check if we should mark as offline (3 consecutive failures)
      if (newFailureCount >= 3) {
        setIsOffline(true);
        console.log(`🔴 ${dataType} marked as offline after ${newFailureCount} consecutive failures`);
      }
      
      // Set fallback data based on data type
      switch (dataType) {
        case 'powerFlow':
          setData(kpiApiService.getDefaultPowerFlow());
          break;
        case 'powerMix':
          setData(kpiApiService.getDefaultPowerMixData());
          break;
        default:
          setData(null);
          break;
      }
      
      setIsConnected(false);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [controllerId, dataType, startTime, stopTime, globalRefreshTrigger, consecutiveFailures, lastUpdatedAt, staleDataCount]);

  // Load data on mount and when dependencies change (with debounce)
  useEffect(() => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce the fetch call
    debounceTimeoutRef.current = setTimeout(() => {
      fetchData();
    }, 100); // 100ms debounce
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [controllerId, dataType, startTime, stopTime, globalRefreshTrigger, fetchData]);

  // Listen to global refresh trigger (separate from dependency changes)
  useEffect(() => {
    if (globalRefreshTrigger !== null && globalRefreshTrigger > 0) {
      console.log(`🔄 Global refresh triggered for ${dataType} data`);
      // Reset fetch state to allow refresh
      isFetchingRef.current = false;
      lastFetchParamsRef.current = null;
      fetchData(true); // Force refresh on global trigger
    }
  }, [globalRefreshTrigger, dataType, fetchData]);

  // Interval-based refresh management using the global interval service
  useEffect(() => {
    if (!enableIntervalRefresh || !autoRefresh || !controllerId) {
      return;
    }

    // Use a more specific interval key to avoid conflicts
    const intervalKey = `kpi-${controllerId}-${dataType}-${Date.now()}`;
    
    // Start interval refresh using the global interval service
    startIntervalRefresh(intervalKey, () => {
      console.log(`🔄 Interval refresh triggered for ${dataType} (${selectedInterval})`);
      // Only fetch if not already fetching
      if (!isFetchingRef.current) {
        fetchData(true);
      }
    });

    // Cleanup on unmount or dependency change
    return () => {
      stopIntervalRefresh(intervalKey);
    };
  }, [controllerId, dataType, selectedInterval, enableIntervalRefresh, autoRefresh, startIntervalRefresh, stopIntervalRefresh, fetchData]);

  // Manual refresh function
  const refreshKpiData = useCallback(() => {
    fetchData(true); // Force refresh on manual trigger
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    isConnected,
    consecutiveFailures,
    isOffline,
    staleDataCount,
    lastUpdatedAt,
    refreshData: refreshKpiData
  };
};

export default useKpiData;
