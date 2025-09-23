/**
 * Config-Based Chart Component
 * Fetches config from API and creates appropriate chart based on config type
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Plot from 'react-plotly.js';
import { transformConfigToPlotly } from '../modules/timeseries/utils/plotlyTransformer';
import { validateConfig } from '../modules/timeseries/utils/configValidator';

const ConfigBasedChart = ({ 
  configName,           // Config name (e.g., 'energy-monitoring')
  className = "",       // CSS classes
  height = 400,         // Chart height
  refreshInterval = 0,  // Auto refresh interval in ms (0 = disabled)
  controllerId = "CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA" // Controller ID
}) => {
  const [config, setConfig] = useState(null);
  const [data, setData] = useState([]);
  const [chartComponent, setChartComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const chartRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Backend API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

  // Load configuration from backend API
  const loadConfig = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/config/${configName}`);
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.statusText}`);
      }
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load config');
      }
      
      const configData = result.data;
      
      // Validate config
      const validation = validateConfig(configData);
      if (!validation.isValid) {
        throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
      }
      
      setConfig(configData);
      console.log('Config loaded:', configData);
    } catch (err) {
      setError(`Config Error: ${err.message}`);
      console.error('Config loading error:', err);
    }
  }, [configName, API_BASE_URL]);

  // Load data from backend API using flux query
  const loadData = useCallback(async () => {
    if (!config) return;

    try {
      // Use the query from config
      let query = config.query;
      let parameters = { controllerId };
      
      // Merge config parameters with provided parameters
      if (config.parameters) {
        parameters = { ...config.parameters, ...parameters };
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/flux/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          parameters
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load data');
      }
      
      const fluxData = result.data;
      
      // Transform flux data to chart format
      const transformedData = transformFluxDataToChartFormat(fluxData);
      
      setData(transformedData);
      setLastRefresh(new Date());
      console.log('Data loaded:', transformedData);
    } catch (err) {
      setError(`Data Error: ${err.message}`);
      console.error('Data loading error:', err);
    }
  }, [config, controllerId, API_BASE_URL]);

  // Transform flux data to chart format
  const transformFluxDataToChartFormat = (fluxData) => {
    if (!fluxData.series || fluxData.series.length === 0) {
      return [];
    }

    // Group data by timestamp
    const dataByTime = {};
    
    fluxData.series.forEach(series => {
      series.data.forEach(point => {
        const timestamp = new Date(point.time).getTime();
        
        if (!dataByTime[timestamp]) {
          dataByTime[timestamp] = {
            timestamp,
            time: point.time
          };
        }
        
        // Map field names to chart format
        dataByTime[timestamp][series.field] = point.value;
      });
    });

    // Convert to array and sort by timestamp
    return Object.values(dataByTime).sort((a, b) => a.timestamp - b.timestamp);
  };

  // Create chart component based on config type
  const createChartComponent = useCallback(() => {
    if (!config || !data || data.length === 0) return null;

    try {
      // Determine chart type from config
      const chartType = config.chartType || 'timeseries';
      
      switch (chartType) {
        case 'timeseries':
          return createTimeseriesChart();
        case 'single-count':
          return createSingleCountChart();
        case 'gauge':
          return createGaugeChart();
        default:
          console.warn(`Unknown chart type: ${chartType}, defaulting to timeseries`);
          return createTimeseriesChart();
      }
    } catch (err) {
      setError(`Chart Creation Error: ${err.message}`);
      console.error('Chart creation error:', err);
      return null;
    }
  }, [config, data]);

  // Create timeseries chart
  const createTimeseriesChart = useCallback(() => {
    const plotlyConfig = transformConfigToPlotly(config, data);
    
    return (
      <Plot
        data={plotlyConfig.data}
        layout={plotlyConfig.layout}
        style={{ width: '100%', height: '100%' }}
        config={{ 
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
          staticPlot: false
        }}
        onHover={handleHover}
        onUnhover={handleUnhover}
      />
    );
  }, [config, data]);

  // Create single count chart (for future use)
  const createSingleCountChart = useCallback(() => {
    // This will be implemented when you add single count plugin
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">
            {data.length > 0 ? data[data.length - 1].value || 0 : 0}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {config.title || 'Count'}
          </div>
        </div>
      </div>
    );
  }, [config, data]);

  // Create gauge chart (for future use)
  const createGaugeChart = useCallback(() => {
    // This will be implemented when you add gauge plugin
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            Gauge Chart
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {config.title || 'Gauge'}
          </div>
        </div>
      </div>
    );
  }, [config]);

  // Handle hover events for custom tooltip
  const handleHover = useCallback((event) => {
    if (!event.points || event.points.length === 0) {
      return;
    }

    const point = event.points[0];
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const tooltipData = {
      x: point.x,
      y: point.y,
      text: point.text || `${point.data.name}: ${point.y}`,
      color: point.data.line?.color || point.data.marker?.color || '#1f77b4',
      name: point.data.name,
      xLabel: new Date(point.x).toLocaleString(),
      yLabel: point.y.toLocaleString()
    };

    setTooltip({
      ...tooltipData,
      position: {
        x: event.event.clientX - rect.left,
        y: event.event.clientY - rect.top
      }
    });
  }, []);

  // Handle unhover events
  const handleUnhover = useCallback(() => {
    setTooltip(null);
  }, []);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Load data when config is ready
  useEffect(() => {
    if (config) {
      loadData();
    }
  }, [config, loadData]);

  // Create chart component when config and data are ready
  useEffect(() => {
    if (config && data && data.length > 0) {
      const component = createChartComponent();
      setChartComponent(component);
    }
  }, [config, data, createChartComponent]);

  // Set up auto refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        loadData();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [loadData, refreshInterval]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    loadData().finally(() => setIsLoading(false));
  }, [loadData]);

  if (isLoading && !data.length) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#198c1a] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-red-600">
          <h3 className="text-lg font-semibold mb-2">Chart Error</h3>
          <p className="text-sm">{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!config || !data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-600">
          <h3 className="text-lg font-semibold mb-2">No Data</h3>
          <p className="text-sm">No data available for the selected time range</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full relative ${className}`} style={{ height }}>
      {/* Chart Header with Refresh Info */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-500">
          {lastRefresh && `Last updated: ${lastRefresh.toLocaleTimeString()}`}
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <div ref={chartRef} className="w-full h-full">
        {chartComponent}
      </div>
      
      {/* Custom Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-50 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 max-w-xs"
          style={{
            left: Math.min(tooltip.position.x + 10, window.innerWidth - 200),
            top: Math.max(tooltip.position.y - 10, 10),
            transform: 'translateY(-50%)',
            zIndex: 9999
          }}
        >
          <div className="flex items-center mb-2">
            <div 
              className="w-4 h-4 rounded-full mr-2 border-2 border-white shadow-sm"
              style={{ backgroundColor: tooltip.color }}
            ></div>
            <span className="font-bold text-gray-900 text-lg">{tooltip.name}</span>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <div><strong>Time:</strong> {tooltip.xLabel}</div>
            <div><strong>Value:</strong> {tooltip.yLabel}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigBasedChart;
