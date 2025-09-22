import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useKpiData from './useKpiData';
import { useDateRange } from './redux';
import {
  setPowerMixData,
  setPowerFlowData,
  setPowerFlowConnection
} from '../store/slices/dataSlice';

/**
 * Hook to integrate existing KPI data hooks with Redux store
 * This ensures data flows from the existing hooks into Redux state
 */
export const useDataIntegration = () => {
  const dispatch = useDispatch();
  const { getControllerId, getApiTimeRange, refreshTrigger } = useDateRange();
  
  // Get refresh timestamps from Redux store
  const powerFlowLastUpdated = useSelector(state => state.data.powerFlow.lastUpdatedAt);
  const powerMixLastUpdated = useSelector(state => state.data.powerMix.lastUpdatedAt);
  
  // Get power mix data using existing hook
  const powerMixData = useKpiData(getControllerId(), 'powerMix', {
    startTime: getApiTimeRange().start,
    stopTime: getApiTimeRange().stop,
    autoRefresh: true,
    enableIntervalRefresh: true,
    globalRefreshTrigger: refreshTrigger
  });

  // Get power flow data using existing hook
  const powerFlowData = useKpiData(getControllerId(), 'powerFlow', {
    startTime: getApiTimeRange().start,
    stopTime: getApiTimeRange().stop,
    autoRefresh: true,
    enableIntervalRefresh: true,
    globalRefreshTrigger: refreshTrigger
  });

  // Update Redux store when power mix data changes
  useEffect(() => {
    dispatch(setPowerMixData({
      data: powerMixData.data,
      isLoading: powerMixData.isLoading,
      error: powerMixData.error
    }));
  }, [dispatch, powerMixData.data, powerMixData.isLoading, powerMixData.error]);

  // Update Redux store when power flow data changes
  useEffect(() => {
    dispatch(setPowerFlowData({
      data: powerFlowData.data,
      isLoading: powerFlowData.isLoading,
      error: powerFlowData.error
    }));

    dispatch(setPowerFlowConnection({
      isConnected: powerFlowData.isConnected,
      isOffline: powerFlowData.isOffline,
      consecutiveFailures: powerFlowData.consecutiveFailures
    }));
  }, [dispatch, powerFlowData.data, powerFlowData.isLoading, powerFlowData.error, powerFlowData.isConnected, powerFlowData.isOffline, powerFlowData.consecutiveFailures]);

  // Trigger data refresh when refresh actions are dispatched
  useEffect(() => {
    if (powerFlowLastUpdated) {
      // Trigger power flow data refresh
      powerFlowData.refresh?.();
    }
  }, [powerFlowLastUpdated, powerFlowData]);

  useEffect(() => {
    if (powerMixLastUpdated) {
      // Trigger power mix data refresh
      powerMixData.refresh?.();
    }
  }, [powerMixLastUpdated, powerMixData]);

  return {
    powerMix: powerMixData,
    powerFlow: powerFlowData
  };
};
