import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Hardcoded values - no authentication needed
  const value = {
    isAuthenticated: true, // Always authenticated
    isLoading: false,
    user: {
      name: 'Ali Tariq',
      role: 'Site Manager'
    },
    login: () => Promise.resolve({ success: true }),
    logout: () => {},
    changePassword: () => Promise.resolve({ success: true }),
    token: 'hardcoded-token'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
