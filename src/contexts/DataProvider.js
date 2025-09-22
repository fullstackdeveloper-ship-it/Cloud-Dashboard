// Centralized data provider to reduce duplicate API calls
import React, { createContext, useContext, useCallback } from 'react';
import useKpiData from '../hooks/useKpiData';
import { useDateRange } from './DateRangeContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { getControllerId, getApiTimeRange, refreshTrigger } = useDateRange();
  const controllerId = getControllerId();
  const timeRange = getApiTimeRange();

  // Fetch only powerMix data (PowerFlow disabled to prevent unnecessary API calls)
  const powerFlowData = {
    data: null,
    isLoading: false,
    error: null,
    isConnected: false,
    isOffline: false,
    consecutiveFailures: 0,
    staleDataCount: 0,
    lastUpdatedAt: null,
    refresh: () => console.log('PowerFlow refresh disabled')
  };

  const powerMixData = useKpiData(controllerId, 'powerMix', {
    startTime: timeRange.start,
    stopTime: timeRange.stop,
    autoRefresh: true,
    enableIntervalRefresh: true,
    globalRefreshTrigger: refreshTrigger
  });

  // Provide centralized data and refresh functions
  const value = {
    // Power Flow Data
    powerFlow: {
      data: powerFlowData.data,
      isLoading: powerFlowData.isLoading,
      error: powerFlowData.error,
      isConnected: powerFlowData.isConnected,
      isOffline: powerFlowData.isOffline,
      consecutiveFailures: powerFlowData.consecutiveFailures,
      staleDataCount: powerFlowData.staleDataCount,
      lastUpdatedAt: powerFlowData.lastUpdatedAt,
      refresh: powerFlowData.refreshData
    },
    
    // Power Mix Data
    powerMix: {
      data: powerMixData.data,
      isLoading: powerMixData.isLoading,
      error: powerMixData.error,
      refresh: powerMixData.refreshData
    },
    
    // Global refresh function
    refreshAll: useCallback(() => {
      powerFlowData.refreshData();
      powerMixData.refreshData();
    }, [powerFlowData, powerMixData])
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};