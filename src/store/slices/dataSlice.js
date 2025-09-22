import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  powerFlow: {
    data: null,
    isLoading: false,
    error: null,
    isConnected: false,
    isOffline: false,
    consecutiveFailures: 0,
    staleDataCount: 0,
    lastUpdatedAt: null
  },
  powerMix: {
    data: null,
    isLoading: false,
    error: null
  }
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setPowerFlowData: (state, action) => {
      state.powerFlow = { ...state.powerFlow, ...action.payload };
    },
    setPowerMixData: (state, action) => {
      state.powerMix = { ...state.powerMix, ...action.payload };
    },
    setPowerFlowLoading: (state, action) => {
      state.powerFlow.isLoading = action.payload;
    },
    setPowerMixLoading: (state, action) => {
      state.powerMix.isLoading = action.payload;
    },
    setPowerFlowError: (state, action) => {
      state.powerFlow.error = action.payload;
    },
    setPowerMixError: (state, action) => {
      state.powerMix.error = action.payload;
    },
    setPowerFlowConnection: (state, action) => {
      state.powerFlow.isConnected = action.payload.isConnected;
      state.powerFlow.isOffline = action.payload.isOffline;
      state.powerFlow.consecutiveFailures = action.payload.consecutiveFailures || 0;
    },
    setPowerFlowStaleData: (state, action) => {
      state.powerFlow.staleDataCount = action.payload.staleDataCount || 0;
      state.powerFlow.lastUpdatedAt = action.payload.lastUpdatedAt || null;
    },
    refreshPowerFlow: (state) => {
      // Trigger refresh - this will be handled by the component
      state.powerFlow.lastUpdatedAt = new Date().toISOString();
    },
    refreshPowerMix: (state) => {
      // Trigger refresh - this will be handled by the component
      state.powerMix.lastUpdatedAt = new Date().toISOString();
    },
    refreshAll: (state) => {
      // Trigger refresh for all data
      const now = new Date().toISOString();
      state.powerFlow.lastUpdatedAt = now;
      state.powerMix.lastUpdatedAt = now;
    }
  }
});

export const {
  setPowerFlowData,
  setPowerMixData,
  setPowerFlowLoading,
  setPowerMixLoading,
  setPowerFlowError,
  setPowerMixError,
  setPowerFlowConnection,
  setPowerFlowStaleData,
  refreshPowerFlow,
  refreshPowerMix,
  refreshAll
} = dataSlice.actions;

export default dataSlice.reducer;
