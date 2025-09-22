import { useData as useDataRedux } from './redux';
import { useDispatch } from 'react-redux';
import { refreshAll, refreshPowerFlow, refreshPowerMix } from '../store/slices/dataSlice';

/**
 * Custom hook for accessing data from Redux store
 * Provides a clean API for components to access data
 */
export const useData = () => {
  return useDataRedux();
};

/**
 * Hook for accessing specific data sources
 * @param {string} dataSource - The data source to access ('powerMix', 'powerFlow')
 */
export const useDataSource = (dataSource) => {
  const data = useDataRedux();
  
  if (!data[dataSource]) {
    throw new Error(`Data source '${dataSource}' not found in Redux store`);
  }
  
  return data[dataSource];
};

/**
 * Hook for refresh functionality
 */
export const useRefresh = () => {
  const data = useDataRedux();
  const dispatch = useDispatch();
  
  return {
    refreshAll: () => dispatch(refreshAll()),
    refreshPowerMix: () => dispatch(refreshPowerMix()),
    refreshPowerFlow: () => dispatch(refreshPowerFlow()),
    isLoading: data.powerMix.isLoading || data.powerFlow.isLoading,
    hasError: !!(data.powerMix.error || data.powerFlow.error),
  };
};
