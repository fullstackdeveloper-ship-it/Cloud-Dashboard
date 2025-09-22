import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: true, // Always authenticated
  isLoading: false,
  user: {
    name: 'Ali Tariq',
    role: 'Site Manager'
  },
  token: 'hardcoded-token'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    changePassword: (state) => {
      // No state change needed for password change
    }
  }
});

export const { login, logout, setLoading, changePassword } = authSlice.actions;
export default authSlice.reducer;
