import { configureStore, createSlice } from '@reduxjs/toolkit';

// Simple demo slice for any components that might still use Redux
const demoSlice = createSlice({
  name: 'demo',
  initialState: {
    alerts: {
      unreadCount: 0
    },
    sensor: {
      data: {}
    },
    logs: {
      data: []
    }
  },
  reducers: {
    // Dummy reducers for compatibility
    setAlerts: (state, action) => {
      state.alerts = action.payload;
    },
    setSensorData: (state, action) => {
      state.sensor.data = action.payload;
    },
    setLogs: (state, action) => {
      state.logs.data = action.payload;
    }
  }
});

export const { setAlerts, setSensorData, setLogs } = demoSlice.actions;

export const store = configureStore({
  reducer: {
    demo: demoSlice.reducer,
    // For backward compatibility with existing components
    alerts: (state = { unreadCount: 0 }) => state,
    sensor: (state = { data: {} }) => state,
    logs: (state = { data: [] }) => state,
  },
});