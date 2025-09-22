import { createSlice } from '@reduxjs/toolkit';
import localStorageManager from '../../utils/localStorage';

// Helper function to get default date range
const getDefaultDateRange = () => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(now);
  endOfDay.setDate(endOfDay.getDate() + 1);
  endOfDay.setHours(0, 0, 0, 0);
  
  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
  return {
    fromDateTime: formatDateTime(startOfDay),
    endDateTime: formatDateTime(endOfDay),
    appliedFromDateTime: formatDateTime(startOfDay),
    appliedEndDateTime: formatDateTime(endOfDay)
  };
};

const initialState = {
  selectedSite: localStorageManager.getSelectedSite(),
  ...getDefaultDateRange(),
  selectedInterval: localStorageManager.getRefreshInterval(),
  isUsingTodayDefault: true,
  refreshTrigger: 0
};

const dateRangeSlice = createSlice({
  name: 'dateRange',
  initialState,
  reducers: {
    setSelectedSite: (state, action) => {
      state.selectedSite = action.payload;
      localStorageManager.setSelectedSite(action.payload);
    },
    setFromDateTime: (state, action) => {
      state.fromDateTime = action.payload;
    },
    setEndDateTime: (state, action) => {
      state.endDateTime = action.payload;
    },
    setSelectedInterval: (state, action) => {
      state.selectedInterval = action.payload;
      localStorageManager.setRefreshInterval(action.payload);
    },
    setIsUsingTodayDefault: (state, action) => {
      state.isUsingTodayDefault = action.payload;
    },
    applyDateTimeChanges: (state) => {
      state.appliedFromDateTime = state.fromDateTime;
      state.appliedEndDateTime = state.endDateTime;
      state.refreshTrigger += 1;
    },
    triggerGlobalRefresh: (state) => {
      state.refreshTrigger += 1;
    },
    resetToToday: (state) => {
      const defaultRange = getDefaultDateRange();
      state.fromDateTime = defaultRange.fromDateTime;
      state.endDateTime = defaultRange.endDateTime;
      state.appliedFromDateTime = defaultRange.appliedFromDateTime;
      state.appliedEndDateTime = defaultRange.appliedEndDateTime;
      state.isUsingTodayDefault = true;
    }
  }
});

// Selectors
export const selectControllerId = (state) => {
  const siteControllerMap = {
    'dubai': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA',
    'abu-dhabi': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA',
    'london': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA',
    'california': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA',
    'tokyo': 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA'
  };
  return siteControllerMap[state.dateRange.selectedSite] || 'CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA';
};

export const selectApiTimeRange = (state) => {
  return {
    start: new Date(state.dateRange.appliedFromDateTime).toISOString(),
    stop: new Date(state.dateRange.appliedEndDateTime).toISOString(),
    window: state.dateRange.selectedInterval
  };
};

export const {
  setSelectedSite,
  setFromDateTime,
  setEndDateTime,
  setSelectedInterval,
  setIsUsingTodayDefault,
  applyDateTimeChanges,
  triggerGlobalRefresh,
  resetToToday
} = dateRangeSlice.actions;

export default dateRangeSlice.reducer;
