// Global date range context for sharing date/time selection across components
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import intervalService from '../services/intervalService';

const DateRangeContext = createContext();

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
};

export const DateRangeProvider = ({ children }) => {
  const [selectedSite, setSelectedSite] = useState('dubai');
  const [fromDateTime, setFromDateTime] = useState(() => {
    // Set to full day (12:00 AM today) - same as "Today" preset
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0); // 12:00 AM today
    
    // Format for datetime-local input
    const year = startOfDay.getFullYear();
    const month = String(startOfDay.getMonth() + 1).padStart(2, '0');
    const day = String(startOfDay.getDate()).padStart(2, '0');
    const hours = String(startOfDay.getHours()).padStart(2, '0');
    const minutes = String(startOfDay.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [endDateTime, setEndDateTime] = useState(() => {
    // Set to next day at 12:00 AM - same as "Today" preset
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setDate(endOfDay.getDate() + 1);
    endOfDay.setHours(0, 0, 0, 0); // 12:00 AM tomorrow
    
    // Format for datetime-local input
    const year = endOfDay.getFullYear();
    const month = String(endOfDay.getMonth() + 1).padStart(2, '0');
    const day = String(endOfDay.getDate()).padStart(2, '0');
    const hours = String(endOfDay.getHours()).padStart(2, '0');
    const minutes = String(endOfDay.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [selectedInterval, setSelectedInterval] = useState('1h');
  const [isUsingTodayDefault, setIsUsingTodayDefault] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Convert datetime to ISO format for API calls
  const getApiTimeRange = () => {
    return {
      start: new Date(fromDateTime).toISOString(),
      stop: new Date(endDateTime).toISOString(),
      window: selectedInterval
    };
  };

  // Get controller ID based on selected site
  const getControllerId = () => {
    const siteControllerMap = {
      'dubai': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA',
      'abu-dhabi': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA',
      'london': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA',
      'california': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA',
      'tokyo': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA'
    };
    return siteControllerMap[selectedSite] || 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA';
  };

  // Global refresh function that triggers all KPI data to refresh
  const triggerGlobalRefresh = useCallback(() => {
    console.log('🔄 Triggering global refresh for all KPI data...');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Interval management functions
  const startIntervalRefresh = useCallback((key, refreshFunction) => {
    intervalService.start(key, selectedInterval, refreshFunction);
  }, [selectedInterval]);

  const stopIntervalRefresh = useCallback((key) => {
    intervalService.stop(key);
  }, []);

  const updateIntervalRefresh = useCallback((key, refreshFunction) => {
    intervalService.update(key, selectedInterval, refreshFunction);
  }, [selectedInterval]);

  const stopAllIntervals = useCallback(() => {
    intervalService.stopAll();
  }, []);

  // Cleanup intervals when component unmounts
  useEffect(() => {
    return () => {
      intervalService.stopAll();
    };
  }, []);

  const value = {
    selectedSite,
    setSelectedSite,
    fromDateTime,
    setFromDateTime,
    endDateTime,
    setEndDateTime,
    selectedInterval,
    setSelectedInterval,
    isUsingTodayDefault,
    setIsUsingTodayDefault,
    getApiTimeRange,
    getControllerId,
    refreshTrigger,
    triggerGlobalRefresh,
    // Interval management
    startIntervalRefresh,
    stopIntervalRefresh,
    updateIntervalRefresh,
    stopAllIntervals
  };

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
};
