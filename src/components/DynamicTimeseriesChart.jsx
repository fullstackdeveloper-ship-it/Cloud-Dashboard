/**
 * Dynamic Timeseries Chart Component
 * Simple component that loads config and data files to create charts
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Plot from 'react-plotly.js';
import { transformConfigToPlotly } from '../modules/timeseries/utils/plotlyTransformer';
import { validateConfig } from '../modules/timeseries/utils/configValidator';

const DynamicTimeseriesChart = ({ 
  configPath,           // Path to config file (e.g., 'energy-monitoring')
  dataPath,            // Path to data file (e.g., 'energy-monitoring-data')
  dateRange = null,     // Date range object with start/stop
  className = "",      // CSS classes
  height = 400         // Chart height
}) => {
  const [config, setConfig] = useState(null);
  const [data, setData] = useState([]);
  const [plotlyData, setPlotlyData] = useState(null);
  const [plotlyLayout, setPlotlyLayout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const chartRef = useRef(null);

  // Load configuration file
  const loadConfig = useCallback(async () => {
    try {
      const response = await fetch(`/configs/${configPath}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.statusText}`);
      }
      const configData = await response.json();
      
      // Validate config
      const validation = validateConfig(configData);
      if (!validation.isValid) {
        throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
      }
      
      setConfig(configData);
    } catch (err) {
      setError(`Config Error: ${err.message}`);
      console.error('Config loading error:', err);
    }
  }, [configPath]);

  // Load data file
  const loadData = useCallback(async () => {
    try {
      const response = await fetch(`/data/${dataPath}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      const dataArray = await response.json();
      
      // Transform data to chart format
      const transformedData = dataArray.map(item => ({
        timestamp: new Date(item.time || item.timestamp).getTime(),
        time: item.time || item.timestamp,
        ...item
      }));
      
      setData(transformedData);
    } catch (err) {
      setError(`Data Error: ${err.message}`);
      console.error('Data loading error:', err);
    }
  }, [dataPath]);

  // Transform to Plotly format
  const transformToPlotly = useCallback(() => {
    if (!config || !data || data.length === 0) return;

    try {
      const plotlyConfig = transformConfigToPlotly(config, data, dateRange);
      setPlotlyData(plotlyConfig.data);
      setPlotlyLayout(plotlyConfig.layout);
    } catch (err) {
      setError(`Transform Error: ${err.message}`);
      console.error('Plotly transformation error:', err);
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

  // Load everything on mount
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      setError(null);
      
      await Promise.all([loadConfig(), loadData()]);
      setIsLoading(false);
    };
    
    loadAll();
  }, [loadConfig, loadData]);

  // Transform when config and data are ready
  useEffect(() => {
    if (config && data && data.length > 0) {
      transformToPlotly();
    }
  }, [config, data, transformToPlotly]);

  if (isLoading) {
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
        </div>
      </div>
    );
  }

  if (!config || !data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-600">
          <h3 className="text-lg font-semibold mb-2">No Data</h3>
          <p className="text-sm">Please provide valid config and data files</p>
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
      <div ref={chartRef} className="w-full h-full" style={{ cursor: 'grab' }}>
        <Plot
          data={plotlyData}
          layout={plotlyLayout}
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
      
      {/* Debug: Show tooltip state */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '5px', fontSize: '12px', zIndex: 9999 }}>
          Tooltip: {tooltip ? 'Active' : 'Inactive'}
        </div>
      )}
    </div>
  );
};

export default DynamicTimeseriesChart;
