import { useData as useDataContext } from '../contexts/DataProvider';

/**
 * Custom hook for accessing data context
 * Provides a clean API for components to access data
 */
export const useData = () => {
  const context = useDataContext();
  return context;
};

/**
 * Hook for accessing specific data sources
 * @param {string} dataSource - The data source to access ('powerMix', 'kpi', 'alarms', 'equipment')
 */
export const useDataSource = (dataSource) => {
  const context = useDataContext();
  
  if (!context[dataSource]) {
    throw new Error(`Data source '${dataSource}' not found in context`);
  }
  
  return context[dataSource];
};

/**
 * Hook for refresh functionality
 */
export const useRefresh = () => {
  const context = useDataContext();
  
  return {
    refreshAll: context.refreshAll,
    refreshPowerMix: context.refreshPowerMix,
    // refreshKpi: context.refreshKpi,
    isLoading: context.isLoading,
    hasError: context.hasError,
  };
};
