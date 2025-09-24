/**
 * Auto Chart Renderer Component
 * Fetches all config files and automatically renders charts for each one
 */

import React, { useState, useEffect, useCallback } from 'react';
import ConfigBasedChart from './ConfigBasedChart';

const AutoChartRenderer = ({ 
  className = "",
  controllerId = "CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA",
  refreshInterval = 0,
  chartHeight = 400
}) => {
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Backend API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

  // Load all configs from backend API
  const loadAllConfigs = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/config`);
      if (!response.ok) {
        throw new Error(`Failed to load configs: ${response.statusText}`);
      }
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load configs');
      }
      
      setConfigs(result.data);
      console.log('All configs loaded:', result.data);
    } catch (err) {
      setError(`Config Loading Error: ${err.message}`);
      console.error('Config loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  // Load configs on mount
  useEffect(() => {
    loadAllConfigs();
  }, [loadAllConfigs]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    loadAllConfigs();
  }, [loadAllConfigs]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#198c1a] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading charts...</p>
        </div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className={`flex items-center justify-center ${className}`}>
  //       <div className="text-center text-red-600">
  //         <h3 className="text-lg font-semibold mb-2">Error Loading Charts</h3>
  //         <p className="text-sm">{error}</p>
  //         <button 
  //           onClick={handleRefresh}
  //           className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //         >
  //           Retry
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!configs || configs.length === 0) {
  //   return (
  //     <div className={`flex items-center justify-center ${className}`}>
  //       <div className="text-center text-gray-600">
  //         <h3 className="text-lg font-semibold mb-2">No Charts Available</h3>
  //         <p className="text-sm">No configuration files found</p>

  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full">
      {/* Render each chart in its own separate div */}
      {configs.map((config, index) => (
        <div key={config.name || index} className="mb-8">
          <div 
            className="w-full rounded-2xl bg-white shadow-lg border border-gray-200 p-2 sm:p-3"
          >
            {/* Chart Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {config.name || `Chart ${index + 1}`}
              </h3>
              {config.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {config.description}
                </p>
              )}
            </div>

            {/* Chart Component */}
            <div style={{ height: chartHeight }} className="relative overflow-hidden">
              <ConfigBasedChart
                configName={config.name}
                height={chartHeight}
                refreshInterval={refreshInterval}
                controllerId={controllerId}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AutoChartRenderer;
