import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appConfig: {
    siteName: 'Green Energy Site - Dubai',
    language: 'en',
    timezone: 'Asia/Dubai',
    deviceTime: new Date().toISOString(),
    theme: 'light'
  },
  isLoading: false
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    updateConfig: (state, action) => {
      state.appConfig = { ...state.appConfig, ...action.payload };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    refreshConfig: (state) => {
      // Refresh config logic if needed
      state.deviceTime = new Date().toISOString();
    }
  }
});

export const { updateConfig, setLoading, refreshConfig } = appSlice.actions;
export default appSlice.reducer;
