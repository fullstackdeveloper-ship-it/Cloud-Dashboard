import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';
import dateRangeReducer from './slices/dateRangeSlice';
import dataReducer from './slices/dataSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    dateRange: dateRangeReducer,
    data: dataReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['data/setPowerFlowData', 'data/setPowerMixData'],
        ignoredPaths: ['data.powerFlow.data', 'data.powerMix.data']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;