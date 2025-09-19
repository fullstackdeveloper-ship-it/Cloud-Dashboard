import React, { createContext, useContext, useCallback, useMemo } from 'react';
import usePowerMixData from '../hooks/usePowerMixData';
// Import other data hooks as they are created
// import useKpiData from '../hooks/useKpiData';
// import useAlarmData from '../hooks/useAlarmData';
// import useEquipmentData from '../hooks/useEquipmentData';

const DataContext = createContext();

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Individual data hooks
  const powerMixData = usePowerMixData();
  // const kpiData = useKpiData();
  // const alarmData = useAlarmData();
  // const equipmentData = useEquipmentData();

  // Unified refresh function
  const refreshAllData = useCallback(async () => {
    console.log('🔄 Refreshing all data...');
    
    const refreshPromises = [
      powerMixData.refreshData(),
      // kpiData.refreshData(),
      // alarmData.refreshData(),
      // equipmentData.refreshData(),
    ].filter(Boolean); // Remove undefined refresh functions

    try {
      await Promise.all(refreshPromises);
      console.log('✅ All data refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      throw error;
    }
  }, [powerMixData.refreshData]);

  // Individual refresh functions
  const refreshPowerMix = useCallback(async () => {
    console.log('🔄 Refreshing Power Mix data...');
    await powerMixData.refreshData();
  }, [powerMixData.refreshData]);

  // const refreshKpi = useCallback(async () => {
  //   console.log('🔄 Refreshing KPI data...');
  //   await kpiData.refreshData();
  // }, [kpiData.refreshData]);

  // Unified loading state
  const isAnyLoading = useMemo(() => {
    return powerMixData.isLoading;
    // || kpiData.isLoading 
    // || alarmData.isLoading 
    // || equipmentData.isLoading;
  }, [powerMixData.isLoading]);

  // Unified error state
  const hasAnyError = useMemo(() => {
    return powerMixData.error;
    // || kpiData.error 
    // || alarmData.error 
    // || equipmentData.error;
  }, [powerMixData.error]);

  // Context value
  const contextValue = useMemo(() => ({
    // Data
    powerMix: powerMixData,
    // kpi: kpiData,
    // alarms: alarmData,
    // equipment: equipmentData,
    
    // Unified functions
    refreshAll: refreshAllData,
    refreshPowerMix,
    // refreshKpi,
    
    // Unified states
    isLoading: isAnyLoading,
    hasError: hasAnyError,
  }), [
    powerMixData,
    refreshAllData,
    refreshPowerMix,
    isAnyLoading,
    hasAnyError,
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};
