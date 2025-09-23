import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDateRange } from './redux';
import {
  setPowerMixData,
  setPowerFlowData,
  setPowerFlowConnection
} from '../store/slices/dataSlice';
import powerMixService from '../services/powerMixService';
import kpiApiService from '../services/kpiApiService';

/**
 * Simple data integration hook that only fetches data when needed
 * - Fetches data only when time range changes or refresh is triggered
 * - No automatic refresh or interval calls
 */
export const useDataIntegration = () => {
  const dispatch = useDispatch();
  const { getControllerId, getApiTimeRange, refreshTrigger } = useDateRange();
  
  // Local state for data
  const [powerMixState, setPowerMixState] = useState({
    data: null,
    isLoading: false,
    error: null
  });
  
  const [powerFlowState, setPowerFlowState] = useState({
    data: null,
    isLoading: false,
    error: null,
    isConnected: false,
    isOffline: false,
    consecutiveFailures: 0
  });

  // Fetch power mix data
  const fetchPowerMixData = useCallback(async () => {
    const controllerId = getControllerId();
    const timeRange = getApiTimeRange();
    
    setPowerMixState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await powerMixService.getPowerMixData({
        controllerId,
        start: timeRange.start,
        stop: timeRange.stop
      });
      console.log('Power Mix data fetched:', data);
      setPowerMixState({
        data,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setPowerMixState({
        data: null,
        isLoading: false,
        error: error.message
      });
    }
  }, [getControllerId, getApiTimeRange]);

  // Fetch power flow data
  const fetchPowerFlowData = useCallback(async () => {
    const controllerId = getControllerId();
    
    setPowerFlowState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await kpiApiService.fetchPowerFlowData(controllerId);
      setPowerFlowState({
        data,
        isLoading: false,
        error: null,
        isConnected: true,
        isOffline: false,
        consecutiveFailures: 0
      });
    } catch (error) {
      setPowerFlowState(prev => ({
        data: prev.data, // Keep previous data on error
        isLoading: false,
        error: error.message,
        isConnected: false,
        isOffline: true,
        consecutiveFailures: prev.consecutiveFailures + 1
      }));
    }
  }, [getControllerId]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchPowerMixData(),
      fetchPowerFlowData()
    ]);
  }, [fetchPowerMixData, fetchPowerFlowData]);

  // Get time range values for dependency array
  const timeRange = getApiTimeRange();
  
  // Fetch data when time range changes or refresh is triggered
  useEffect(() => {
    fetchAllData();
  }, [timeRange.start, timeRange.stop, refreshTrigger, fetchAllData]);

  // Update Redux store when data changes
  useEffect(() => {
    dispatch(setPowerMixData(powerMixState));
  }, [dispatch, powerMixState]);

  useEffect(() => {
    dispatch(setPowerFlowData(powerFlowState));
    dispatch(setPowerFlowConnection({
      isConnected: powerFlowState.isConnected,
      isOffline: powerFlowState.isOffline,
      consecutiveFailures: powerFlowState.consecutiveFailures
    }));
  }, [dispatch, powerFlowState]);

  return {
    powerMix: powerMixState,
    powerFlow: powerFlowState,
    refreshAll: fetchAllData,
    refreshPowerMix: fetchPowerMixData,
    refreshPowerFlow: fetchPowerFlowData
  };
};
