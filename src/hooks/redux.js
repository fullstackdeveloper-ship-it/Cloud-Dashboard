import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { setSelectedSite as setSelectedSiteAction, setSelectedInterval as setSelectedIntervalAction } from '../store/slices/dateRangeSlice';

// Auth hooks
export const useAuth = () => {
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const login = useCallback((userData) => {
    dispatch({ type: 'auth/login', payload: userData });
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch({ type: 'auth/logout' });
  }, [dispatch]);

  const changePassword = useCallback(() => {
    dispatch({ type: 'auth/changePassword' });
  }, [dispatch]);

  return {
    ...auth,
    login,
    logout,
    changePassword
  };
};

// App context hooks
export const useAppContext = () => {
  const app = useSelector(state => state.app);
  const dispatch = useDispatch();

  const updateConfig = useCallback((newConfig) => {
    dispatch({ type: 'app/updateConfig', payload: newConfig });
    return Promise.resolve({ success: true });
  }, [dispatch]);

  const refreshConfig = useCallback(() => {
    dispatch({ type: 'app/refreshConfig' });
    return Promise.resolve();
  }, [dispatch]);

  return {
    ...app,
    updateConfig,
    refreshConfig
  };
};

// Date range hooks
export const useDateRange = () => {
  const dateRange = useSelector(state => state.dateRange);
  const dispatch = useDispatch();

  const setSelectedSite = useCallback((site) => {
    dispatch(setSelectedSiteAction(site));
  }, [dispatch]);

  const updateSelectedSite = useCallback((site) => {
    dispatch(setSelectedSiteAction(site));
  }, [dispatch]);

  const setFromDateTime = useCallback((dateTime) => {
    dispatch({ type: 'dateRange/setFromDateTime', payload: dateTime });
  }, [dispatch]);

  const setEndDateTime = useCallback((dateTime) => {
    dispatch({ type: 'dateRange/setEndDateTime', payload: dateTime });
  }, [dispatch]);

  const setSelectedInterval = useCallback((interval) => {
    dispatch(setSelectedIntervalAction(interval));
  }, [dispatch]);

  const updateSelectedInterval = useCallback((interval) => {
    dispatch(setSelectedIntervalAction(interval));
  }, [dispatch]);

  const setIsUsingTodayDefault = useCallback((value) => {
    dispatch({ type: 'dateRange/setIsUsingTodayDefault', payload: value });
  }, [dispatch]);

  const applyDateTimeChanges = useCallback(() => {
    dispatch({ type: 'dateRange/applyDateTimeChanges' });
  }, [dispatch]);

  const triggerGlobalRefresh = useCallback(() => {
    dispatch({ type: 'dateRange/triggerGlobalRefresh' });
  }, [dispatch]);

  const resetToToday = useCallback(() => {
    dispatch({ type: 'dateRange/resetToToday' });
  }, [dispatch]);

  // Helper functions
  const getControllerId = useCallback(() => {
    const siteControllerMap = {
      'dubai': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA',
      'abu-dhabi': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA',
      'london': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA',
      'california': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA',
      'tokyo': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA'
    };
    return siteControllerMap[dateRange.selectedSite] || 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA';
  }, [dateRange.selectedSite]);

  const getApiTimeRange = useCallback(() => {
    return {
      start: new Date(dateRange.appliedFromDateTime).toISOString(),
      stop: new Date(dateRange.appliedEndDateTime).toISOString(),
      window: dateRange.selectedInterval
    };
  }, [dateRange.appliedFromDateTime, dateRange.appliedEndDateTime, dateRange.selectedInterval]);

  // Interval management functions (simplified for Redux)
  const startIntervalRefresh = useCallback((key, refreshFunction) => {
    // This will be handled by the existing interval service
  }, []);

  const stopIntervalRefresh = useCallback((key) => {
    // This will be handled by the existing interval service
  }, []);

  const updateIntervalRefresh = useCallback((key, refreshFunction) => {
    // This will be handled by the existing interval service
  }, []);

  const stopAllIntervals = useCallback(() => {
    // This will be handled by the existing interval service
  }, []);

  const result = {
    ...dateRange,
    setSelectedSite,
    updateSelectedSite,
    setFromDateTime,
    setEndDateTime,
    setSelectedInterval,
    updateSelectedInterval,
    setIsUsingTodayDefault,
    applyDateTimeChanges,
    triggerGlobalRefresh,
    resetToToday,
    getControllerId,
    getApiTimeRange,
    startIntervalRefresh,
    stopIntervalRefresh,
    updateIntervalRefresh,
    stopAllIntervals
  };

  return result;
};

// Data hooks
export const useData = () => {
  const data = useSelector(state => state.data);
  const dispatch = useDispatch();

  const refreshAll = useCallback(() => {
    dispatch({ type: 'data/refreshAll' });
  }, [dispatch]);

  return {
    powerFlow: {
      ...data.powerFlow,
      refresh: () => dispatch({ type: 'data/refreshPowerFlow' })
    },
    powerMix: {
      ...data.powerMix,
      refresh: () => dispatch({ type: 'data/refreshPowerMix' })
    },
    refreshAll
  };
};