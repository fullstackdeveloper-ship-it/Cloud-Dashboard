import React, { createContext, useContext } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Hardcoded app config - no API calls needed
  const appConfig = {
    siteName: 'Green Energy Site - Dubai',
    language: 'en',
    timezone: 'Asia/Dubai',
    deviceTime: new Date().toISOString(),
    theme: 'light'
  };

  const updateConfig = async (newConfig) => {
    // No-op function for compatibility
    return Promise.resolve({ success: true });
  };

  const value = {
    appConfig,
    isLoading: false,
    updateConfig,
    refreshConfig: () => Promise.resolve()
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;