/**
 * Config-Based Chart Component
 * Fetches config from API and creates appropriate chart based on config type
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Plot from 'react-plotly.js';
import { transformConfigToPlotly } from '../modules/timeseries/utils/plotlyTransformer';
import { validateConfig } from '../modules/timeseries/utils/configValidator';
import { useDateRange } from '../hooks/redux';

const ConfigBasedChart = ({ 
  configName,           // Config name (e.g., 'energy-monitoring')
  className = "",       // CSS classes
  height = 400,         // Chart height
  refreshInterval = 0,  // Auto refresh interval in ms (0 = disabled)
  controllerId = null   // Controller ID (will use from date range if not provided)
}) => {
  const [config, setConfig] = useState(null);
  const [data, setData] = useState([]);
  const [chartComponent, setChartComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const chartRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Get date range from Redux
  const { getControllerId, getApiTimeRange, refreshTrigger } = useDateRange();

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
      // Get controller ID and time range from Redux
      const actualControllerId = controllerId || getControllerId();
      const timeRange = getApiTimeRange();
      
      // Use the query from config
      let query = config.query;
      let parameters = { 
        controllerId: actualControllerId,
        start: timeRange.start,
        stop: timeRange.stop,
        window: timeRange.window
      };
      
      // Merge config parameters with provided parameters
      if (config.parameters) {
        parameters = { ...config.parameters, ...parameters };
      }

      console.log('🔌 Fetching chart data with date range:', {
        configName,
        controllerId: actualControllerId,
        start: timeRange.start,
        stop: timeRange.stop,
        // window: timeRange.window
      });

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
  }, [config, controllerId, getControllerId, getApiTimeRange, API_BASE_URL]);

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
        
        // Map field names to chart format - preserve zero values
        dataByTime[timestamp][series.field] = point.value;
      });
    });

    // Convert to array and sort by timestamp
    const result = Object.values(dataByTime).sort((a, b) => a.timestamp - b.timestamp);
    
    // Debug: Log date range for tick formatting
    if (result.length > 0) {
      const firstTime = result[0].time;
      const lastTime = result[result.length - 1].time;
      const diffDays = (new Date(lastTime) - new Date(firstTime)) / (1000 * 60 * 60 * 24);
      
      console.log('Data date range for tick formatting:', {
        firstTime,
        lastTime,
        diffDays: diffDays.toFixed(2),
        totalPoints: result.length
      });
    }
    
    // Debug: Log zero values
    const zeroValues = result.filter(item => 
      Object.values(item).some(val => val === 0)
    );
    console.log('Zero values found:', zeroValues.length, 'out of', result.length);
    if (zeroValues.length > 0) {
      console.log('Sample zero value:', zeroValues[0]);
    }
    
    return result;
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

  // Custom tooltip event handlers
  const handlePlotlyHover = useCallback((event) => {
    console.log('Hover event triggered:', event);
    if (!event.points || event.points.length === 0) return;
    
    const point = event.points[0];
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;

    const tooltipData = {
      traceName: point.data.name || point.fullData.name,
      x: point.x,
      y: point.y,
      xLabel: new Date(point.x).toLocaleString(),
      yLabel: point.y.toFixed(2),
      color: point.data.line?.color || point.data.marker?.color || '#1f77b4'
    };

    console.log('Setting tooltip:', tooltipData);
    setTooltip({
      ...tooltipData,
      position: {
        x: event.event.clientX - rect.left,
        y: event.event.clientY - rect.top
      }
    });
  }, []);

  const handlePlotlyUnhover = useCallback(() => {
    setTooltip(null);
  }, []);

  // Selection event handler for drag selection
  const handlePlotlySelection = useCallback(async (event) => {
    console.log('Selection event triggered:', event);
    
    if (!event.selection || !event.selection.xrange) {
      console.log('No selection range found');
      return;
    }

    const { xrange } = event.selection;
    const startTime = new Date(xrange[0]);
    const endTime = new Date(xrange[1]);
    
    console.log('Selected time range:', {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      duration: `${(endTime - startTime) / (1000 * 60 * 60)} hours`
    });

    try {
      // Make API call with selected range
      const apiTimeRange = getApiTimeRange();
      const controllerId = getControllerId();
      
      const requestBody = {
        query: config.query,
        parameters: {
          ...config.parameters,
          start: startTime.toISOString(),
          stop: endTime.toISOString(),
          controllerId: controllerId,
          window: apiTimeRange.window || '1h'
        }
      };

      console.log('Making API call with selected range:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API call failed');
      }

      console.log('API response for selected range:', result.data);
      
      // Update the chart with new data
      if (result.data && result.data.length > 0) {
        setData(result.data);
        console.log('Chart updated with selected range data');
      } else {
        console.log('No data returned for selected range');
      }

    } catch (error) {
      console.error('Error fetching data for selected range:', error);
      setError(`Selection Error: ${error.message}`);
    }
  }, [config, getControllerId, getApiTimeRange, API_BASE_URL]);

  // Create timeseries chart
  const createTimeseriesChart = useCallback(() => {
    const apiTimeRange = getApiTimeRange();
    const dateRange = {
      start: apiTimeRange.start,
      stop: apiTimeRange.stop
    };
    const plotlyConfig = transformConfigToPlotly(config, data, dateRange);
    
    return (
      <Plot
        data={plotlyConfig.data}
        layout={plotlyConfig.layout}
        style={{ width: '100%', height: '100%' }}
        config={{ 
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d', 'zoom2d', 'autoScale2d', 'resetScale2d'],
          staticPlot: false,
          doubleClick: 'reset+autosize',
          showTips: false,
          scrollZoom: true, // Enable scroll zoom within date range
          editable: false,
          toImageButtonOptions: {
            format: 'png',
            filename: 'chart',
            height: 500,
            width: 700,
            scale: 1
          }
        }}
        onHover={handlePlotlyHover}
        onUnhover={handlePlotlyUnhover}
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


  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Load data when config is ready or date range changes
  useEffect(() => {
    if (config) {
      loadData();
    }
  }, [config, loadData, refreshTrigger]);

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
    <div className={`w-full relative ${className}`} style={{ height, overflow: 'visible' }}>
      <style jsx global>{`
        .custom-plotly-tooltip {
          position: absolute;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #ccc;
          padding: 8px;
          border-radius: 4px;
          font-size: 13px;
          font-family: Arial, sans-serif;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          pointer-events: none;
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.2s ease-in-out;
        }
        .custom-plotly-tooltip.show {
          opacity: 1;
        }
        .custom-plotly-tooltip .tooltip-header {
          font-weight: bold;
          margin-bottom: 4px;
          color: #333;
        }
        .custom-plotly-tooltip .tooltip-content {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }
      `}</style>
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

      <div ref={chartRef} className="w-full h-full" style={{ cursor: 'grab' }}>
        {chartComponent}
      </div>
      
      {/* Custom Tooltip */}
      {tooltip && (
        <div 
          className="custom-plotly-tooltip show"
          style={{
            left: `${tooltip.position.x + 10}px`,
            top: `${tooltip.position.y - 10}px`,
            borderLeftColor: tooltip.color,
            borderLeftWidth: '3px'
          }}
        >
          <div className="tooltip-header">{tooltip.traceName}</div>
          <div className="tooltip-content">
            Time: {tooltip.xLabel}<br/>
            Value: {tooltip.yLabel} W
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigBasedChart;
