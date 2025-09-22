import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store';
import MainLayout from './components/Layout/MainLayout';
import Overview from './pages/Overview';
import Solar from './pages/Solar';
import Genset from './pages/Genset';
import Grid from './pages/Grid';
import Team from './pages/Team';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import { useDataIntegration } from './hooks/useDataIntegration';
import './App.css';

// Data integration wrapper component
function AppWithData() {
  // Initialize data integration once at the app level
  useDataIntegration();
  
  return (
    <Router>
      <div className="App">
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/solar" element={<Solar />} />
            <Route path="/genset" element={<Genset />} />
            <Route path="/grid" element={<Grid />} />
            <Route path="/team" element={<Team />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </MainLayout>
        
        {/* Global Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="!bg-white/95 !backdrop-blur-sm !border !border-[#0097b2]/20 !shadow-xl"
          progressClassName="!bg-gradient-to-r !from-[#0097b2] !to-[#7ed957]"
          style={{ zIndex: 1000001 }}
        />
        </div>
      </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppWithData />
    </Provider>
  );
}

export default App; 